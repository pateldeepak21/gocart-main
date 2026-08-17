import { clerkClient } from "@clerk/nextjs/server";

const authAdmin = async (userId) => {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        const isAdmin = process.env.ADMIN_EMAIL === user.emailAddresses[0].emailAddress;

        return isAdmin;

    } catch (error) {
        console.error(error);
        return false;
    }
}

export default authAdmin
