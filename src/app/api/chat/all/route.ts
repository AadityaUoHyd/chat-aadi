import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{

        const session:any  = getServerSession(authOptions);
        if(!session.user.id){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const allChat = await prisma.chat.findMany({
            where: {
                userId:session.user.id
            }
        });

        return NextResponse.json(allChat, {status: 200});

    }catch(error){
        console.log(error);
        return NextResponse.json({error: "Something went wrong!"}, {status: 500})
    }
}