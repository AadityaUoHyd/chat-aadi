import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await getServerSession(authOptions);

        if(!session?.user.id){
            return NextResponse.json({error: "Unauthorized!"}, {status: 401});
        }

        const allChats = await prisma.chat.findMany({
            where: { 
                userId: session.user.id
            },
            include: {
                messages: {
                    where: { role: 'user' },
                    orderBy: { createdAt: 'asc' },
                    take: 1,
                    select: {
                        content: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        const chatsWithMessageTitles = allChats.map((chat: {
            id: string;
            userId: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            messages: Array<{ content: string }>;
        }) => ({
            ...chat,
            title: chat.messages[0]?.content?.substring(0, 30) + (chat.messages[0]?.content?.length > 30 ? '...' : '') || 'New Chat'
        }));

        return NextResponse.json(chatsWithMessageTitles, {status: 200});

    }catch(error){
        console.error(error);
        return NextResponse.json({error: "Something went wrong!"}, {status: 500});
    }
}