import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { PaymentMethod } from "@prisma/client";
import ensureUserExists from "@/lib/ensureUserExists";

const withRetry = async (fn, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            const isConnectionError = error?.message?.includes('Connection terminated')
                || error?.message?.includes('Connection reset')

            if (!isConnectionError || attempt === retries) {
                throw error
            }
            await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)))
        }
    }
}

export async function POST(request) {
    try {
        const { userId, has } = getAuth(request)
        await ensureUserExists(userId)

        const { addressId, items, couponCode, paymentMethod } = await request.json()

        if (!addressId || !items || items.length === 0) {
            return NextResponse.json({ error: "missing order details" }, { status: 400 })
        }

        const productIds = items.map(item => item.id)
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        })

        if (products.length === 0) {
            return NextResponse.json({ error: "no valid products found" }, { status: 400 })
        }

        const itemsByStore = {}
        for (const item of items) {
            const product = products.find(p => p.id === item.id)
            if (!product) continue

            if (!itemsByStore[product.storeId]) {
                itemsByStore[product.storeId] = []
            }
            itemsByStore[product.storeId].push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            })
        }

        let coupon = null
        if (couponCode) {
            coupon = await prisma.coupon.findUnique({
                where: {
                    code: couponCode.toUpperCase(),
                    expiresAt: { gt: new Date() }
                }
            })

            if (!coupon) {
                return NextResponse.json({ error: "coupon not found" }, { status: 404 })
            }

            if (coupon.forNewUser) {
                const userOrders = await prisma.order.findMany({ where: { userId } })
                if (userOrders.length > 0) {
                    return NextResponse.json({ error: "coupon valid for new users only" }, { status: 400 })
                }
            }

            if (coupon.forMember) {
                const hasPlusPlan = has({ plan: 'plus' })
                if (!hasPlusPlan) {
                    return NextResponse.json({ error: "coupon valid for members only" }, { status: 400 })
                }
            }
        }

        const createdOrders = await withRetry(() =>
            prisma.$transaction(
                Object.entries(itemsByStore).map(([storeId, storeItems]) => {
                    const storeTotal = storeItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
                    const discountedTotal = coupon
                        ? storeTotal - (storeTotal * coupon.discount / 100)
                        : storeTotal

                    return prisma.order.create({
                        data: {
                            userId,
                            storeId,
                            addressId,
                            total: discountedTotal,
                            paymentMethod: paymentMethod || 'COD',
                            isCouponUsed: !!coupon,
                            coupon: coupon ? coupon : {},
                            orderItems: {
                                create: storeItems.map(item => ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    price: item.price
                                }))
                            }
                        }
                    })
                })
            )
        )

        if (paymentMethod === PaymentMethod.STRIPE) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
            const origin = request.headers.get('origin')

            const fullAmount = createdOrders.reduce((acc, order) => acc + order.total, 0)
            const orderIds = createdOrders.map(order => order.id)

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Order from GoCart`,
                        },
                        unit_amount: Math.round(fullAmount * 100),
                    },
                    quantity: 1
                }],
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
                mode: 'payment',
                success_url: `${origin}/loading?nextUrl=orders`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderIds: orderIds.join(','),
                    userId,
                    appId: 'gocart'
                }
            })
            return NextResponse.json({ session })
        }

        await prisma.user.update({
            where: { id: userId },
            data: { cart: {} }
        })

        return NextResponse.json({ message: "order placed successfully", orders: createdOrders })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

export async function GET(request) {
    try {
        const { userId } = getAuth(request)

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: { include: { product: true } },
                address: true,
                store: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ orders })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}
