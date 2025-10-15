import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if(!session?.user.id){
        return NextResponse.json({message: "Unauthorized"}, {status: 401})
    }

    const { prompt } = await req.json();

    if(!prompt){
        return NextResponse.json({message: "Bad Request!"}, {status: 400});
    }
    const newChat = await prisma.chat.create({
        data: {
            userId: session.user.id,
            title: "New Chat"
        }
    });
    await prisma.message.create({
        data:{
            content: prompt,
            role: "user",
            chatId: newChat.id
        }
    })

    return NextResponse.json({chatId: newChat.id}, {status: 200})

  } catch(error) {
    console.log(error);
    return Response.json({error: "Something went wrong!"}, { status: 500 })
  }
}
