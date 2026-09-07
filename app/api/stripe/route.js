import Stripe from "stripe";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
    api: { bodyParser: false }
}

export async function POST(request) {
    try {
        const body = await request.text()
        const sig = request.headers.get('stripe-signature')

        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

        const handlePaymentIntent = async (paymentIntentId, isPaid) => {
            const session = await stripe.checkout.sessions.list({
                payment_intent: paymentIntentId
            })

            const { orderIds } = session.data[0].metadata
            const orderIdList = orderIds.split(',')

            if (isPaid) {
                await prisma.order.updateMany({
                    where: { id: { in: orderIdList } },
                    data: { isPaid: true }
                })
            } else {
                await prisma.order.deleteMany({
                    where: { id: { in: orderIdList } }
                })
            }
        }

        switch (event.type) {
            case 'payment_intent.succeeded': {
                await handlePaymentIntent(event.data.object.id, true)
                break;
            }
            case 'payment_intent.payment_failed': {
                await handlePaymentIntent(event.data.object.id, false)
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ received: true })
    }
}