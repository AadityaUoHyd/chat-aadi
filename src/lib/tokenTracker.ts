import prisma from "@/lib/prisma";

const DAILY_LIMIT = Number(process.env.DAILY_TOKEN_LIMIT) || 20000;

// Normalize date to start of day
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get today's token usage for user (optionally filtered by chat)
export async function getTodayTokens(userId: string, chatId?: string) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
    console.log("User id", userId)
  const result = await prisma.tokenUsage.aggregate({
    _sum: { token: true },
    where: {
      userId,
      chatId,
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  return result._sum.token || 0;
}

// Check quota before streaming
export async function checkUserTokenLimit(userId: string, estimatedTokens: number, chatId?: string) {
  const todayTokens = await getTodayTokens(userId);
  if (todayTokens + estimatedTokens > DAILY_LIMIT) {
    throw new Error("Daily token limit reached");
  }
}

// Add tokens usage: update row if exists, else create
export async function addUserTokens(userId: string, tokensUsed: number, chatId: string) {
  const today = startOfDay(new Date());

  // Check if a row already exists today for this chat
  const existing = await prisma.tokenUsage.findFirst({
    where: { userId, chatId, createdAt: { gte: today } },
  });
  console.log(existing);
  if (existing) {
    await prisma.tokenUsage.update({
      where: { id: existing.id },
      data: { token: { increment: tokensUsed } },
    });
  } else {
    await prisma.tokenUsage.create({
      data: { userId, chatId, token: tokensUsed, createdAt: today },
    });
  }
}
