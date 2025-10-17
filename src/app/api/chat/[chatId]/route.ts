import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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
            console.error('DELETE /api/chat/[chatId] - Unauthorized: No session or user ID');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!chatId) {
            console.error('DELETE /api/chat/[chatId] - Bad Request: Missing chat ID');
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        console.log(`Attempting to delete chat ${chatId} for user ${session.user.id}`);

        // First, verify the chat exists and belongs to the user
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId: session.user.id
            }
        });

        if (!chat) {
            console.error(`Chat ${chatId} not found or access denied for user ${session.user.id}`);
            return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
        }

        // Use a transaction to ensure all deletes succeed or fail together
        const deletedChat = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            try {
                // 1. Delete all token usage records for this chat
                await tx.tokenUsage.deleteMany({
                    where: { chatId }
                });
                
                // 2. Delete all messages in the chat
                await tx.message.deleteMany({
                    where: { chatId }
                });

                // 3. Finally, delete the chat itself
                return await tx.chat.delete({
                    where: { id: chatId }
                });
            } catch (txError) {
                console.error('Transaction error during chat deletion:', txError);
                throw new Error(`Failed to delete chat: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
            }
        });

        console.log(`Successfully deleted chat ${chatId}`);
        return NextResponse.json(
            { success: true, message: 'Chat deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in DELETE /api/chat/[chatId]:", error);
        return NextResponse.json(
            { 
                error: "Failed to delete chat",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}