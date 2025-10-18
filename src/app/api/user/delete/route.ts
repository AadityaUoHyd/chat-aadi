import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chats: {
          include: {
            messages: true,
            tokenUsage: true
          }
        },
        tokenUsage: true,
        accounts: true,
        sessions: true
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Delete related records in the correct order
    await prisma.$transaction([
      // Delete messages
      ...user.chats.flatMap((chat: { id: string }) => 
        prisma.message.deleteMany({
          where: { chatId: chat.id }
        })
      ),
      
      // Delete token usage for chats
      prisma.tokenUsage.deleteMany({
        where: { chatId: { in: user.chats.map((chat: { id: string }) => chat.id) } }
      }),
      
      // Delete chats
      prisma.chat.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete user's token usage
      prisma.tokenUsage.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete user's accounts
      prisma.account.deleteMany({
        where: { userId: user.id }
      }),
      
      // Delete user's sessions
      prisma.session.deleteMany({
        where: { userId: user.id }
      }),
      
      // Finally, delete the user
      prisma.user.delete({
        where: { id: user.id }
      })
    ]);
    
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete account' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
