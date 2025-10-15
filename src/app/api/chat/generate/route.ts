import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Get the AI response
    const response = await createChatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in generate chat:", error);
    return NextResponse.json(
      { 
        error: "Error generating response",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
