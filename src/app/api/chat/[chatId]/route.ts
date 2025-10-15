import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { chatId } = params;
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
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong!" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { chatId } = params;

        // First, delete all messages in the chat
        await prisma.message.deleteMany({
            where: {
                chatId: chatId,
                chat: {
                    userId: session.user.id
                }
            }
        });

        // Then delete the chat
        await prisma.chat.delete({
            where: {
                id: chatId,
                userId: session.user.id
            }
        });

        return NextResponse.json(
            { message: "Chat deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete chat" },
            { status: 500 }
        );
    }
}