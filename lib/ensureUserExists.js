import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ensureUserExists = async (userId) => {
    let user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)

        user = await prisma.user.create({
            data: {
                id: clerkUser.id,
                email: clerkUser.emailAddresses[0].emailAddress,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                image: clerkUser.imageUrl,
            }
        })
    }

    return user
}

export default ensureUserExists
