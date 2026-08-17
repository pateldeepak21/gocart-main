import prisma from "@/lib/prisma";
import { nextResponse } from "next/server";

export async function GET(request){
    try{
        const {searchParams} = new URL (request.url)
        const username = searchParams.get('username').toLocaleLowerCaseCase();
        if(!username){
            return NextResponse.json({error:"missing username"},{status:400})
    }
    const store = await prisma.store.findUnique({where:{username,isActive:true},
    include:{product:{include:{rating:true}}}
    })

    if(!store){
        return NextResponse.json({error:"store not found"},{status:400})
}

    return NextResponse.json({store})
}catch (error) {
    console.error(error);
    return NextResponse.json({error:error.code||error.message},{status:400})
 
    }
}