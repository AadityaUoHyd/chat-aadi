import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateChatTitles() {
  // Find all chats with NULL or empty titles
  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { title: '' },
        { title: 'New Chat' }
      ]
    },
    include: {
      message: {
        where: { role: 'user' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { content: true }
      }
    }
  });

  // Update each chat with a title based on the first message
  for (const chat of chats) {
    const firstMessage = chat.message[0]?.content || 'New Chat';
    const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    await prisma.chat.update({
      where: { id: chat.id },
      data: { 
        title,
        updatedAt: chat.updatedAt || new Date()
      }
    });
  
  }
}

updateChatTitles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
