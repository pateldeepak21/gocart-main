import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        const formData = await request.formData();

        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const image = formData.get("image");

        if (!name || !username || !description || !email || !contact || !address || !image) {
            return NextResponse.json({ error: "Missing store info" }, { status: 400 });
        }

        const existingStore = await prisma.store.findUnique({
            where: { userId }
        });

        if (existingStore) {
            return NextResponse.json({ status: existingStore.status });
        }

        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        });

        if (isUsernameTaken) {
            return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        });

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "500" },
            ]
        });

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        });

        // link store to user
        await prisma.user.update({
            where: { id: userId },
            data: { store: { connect: { id: newStore.id } } }
        });

        return NextResponse.json({ message: "applied, waiting for approval" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        const store = await prisma.store.findUnique({
            where: { userId }
        });

        if (store) {
            return NextResponse.json({ status: store.status });
        }

        return NextResponse.json({ status: "not registered" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}