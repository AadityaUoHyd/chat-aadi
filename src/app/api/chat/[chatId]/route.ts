import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
    params: {
        chatId: string;
    };
};

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await context.params;
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId: session.user.id
            }
        });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json(chat, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/chat/[chatId]:", error);
        return NextResponse.json(
            { error: "Something went wrong!" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await context.params;
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        // First, delete all messages in the chat
        await prisma.message.deleteMany({
            where: {
                chatId: chatId,
                chat: {
                    userId: session.user.id
                }
            }
        });

        // Then delete the chat itself
        const deletedChat = await prisma.chat.delete({
            where: {
                id: chatId,
                userId: session.user.id
            }
        });

        return NextResponse.json(deletedChat, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/chat/[chatId]:", error);
        return NextResponse.json(
            { error: "Something went wrong!" },
            { status: 500 }
        );
    }
}