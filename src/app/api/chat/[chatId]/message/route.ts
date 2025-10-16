import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { countMessageTokens } from "@/lib/tokenizer";
import { addUserTokens, checkUserTokenLimit } from "@/lib/tokenTracker";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Ollama endpoint
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";

type AIProvider = "ollama" | "mistral";

// Helper: select AI client with fallback logic
async function getAIProvider(): Promise<AIProvider> {
  // Always try Ollama first if not explicitly disabled
  if (process.env.DISABLE_OLLAMA !== 'true') {
    try {
      // Test if Ollama is available
      const response = await fetch('http://localhost:11434/api/tags', { 
        method: 'GET',
        // Add a short timeout to prevent hanging
        signal: AbortSignal.timeout(1000) 
      });
      if (response.ok) {
        console.log("Using local Ollama provider");
        return "ollama";
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("Ollama not available, falling back to Mistral:", errorMessage);
    }
  }
  
  // Fall back to Mistral if Ollama is not available or explicitly disabled
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment variables");
  }
  
  console.log("Using Mistral AI provider");
  return "mistral";
}

// Initialize Mistral client
const mistralClient = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
});

// Helper: unified chat completion
async function createChatCompletion(messages: any[], options: any = {}) {
  const provider = await getAIProvider();
  console.log(`Using ${provider} for chat completion`);
  
  try {
    if (provider === "ollama") {
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      console.log("Sending to Ollama:", { prompt, options });
      
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "llama3.2",
          prompt, 
          stream: options.stream || false,
          ...options 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      if (options.stream) {
        // For streaming responses, return the raw response
        return response;
      } else {
        const data = await response.json();
        console.log("Ollama response:", data);
        return data;
      }
    } else {
      // Using Mistral
      console.log("Sending to Mistral:", { messages, options });
      
      const completion = await mistralClient.chat.completions.create({
        model: options.model || "mistral-tiny",
        messages,
        ...options
      });
      
      console.log("Mistral response:", completion);
      return completion;
    }
  } catch (error) {
    console.error("Error in createChatCompletion:", error);
    
    // If we were using Ollama and it failed, try falling back to Mistral
    if (provider === "ollama") {
      console.log("Ollama failed, falling back to Mistral");
      return createChatCompletion(messages, { ...options, forceMistral: true });
    }
    
    throw error; // Re-throw if it was already a Mistral error
  }
}

// ------------------ GET Messages ------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const allMessages = await prisma.message.findMany({
      where: { chatId, chat: { userId: session.user.id } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(allMessages, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  }
}

// ------------------ POST Messages / AI Response ------------------
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    let { chatId } = await params;
    const { userPrompt } = await req.json();
    if (!userPrompt) return new Response("No prompt provided", { status: 400 });

    // System prompt
    const systemPrompt = `
You are a helpful and friendly AI assistant. 
Always respond in clean, well-structured **Markdown**.

### Response Rules
1. **Code & Examples**
   - Include full examples with backticks and language tag.
   - Inline comments and step-by-step explanation.

2. **Explanations**
   - Explain, don’t just provide code.
   - Use bullets/numbered lists.

3. **Formatting**
   - Headings for sections.
   - Bold/italics for emphasis.
   - Tables for comparisons.

4. **Follow-up Questions**
   - Suggest 2–3 relevant follow-ups.
   - Ask for confirmation if the user has not provided enough information.
   - ensure "Follow-up Questions" header comes in bold letter and with one line verticle space.

5. **Tone**
   - Friendly, natural, encourage curiosity.
`;

    // Fetch / build conversation messages
    let messages: any[] = [{ role: "system", content: systemPrompt }];

    // Check if this is a new chat
    let currentChatId = chatId;
    let isNewChat = !currentChatId;

    if (isNewChat) {
      // Create a clean title from the first message
      const chatTitle = userPrompt.slice(0, 50) + (userPrompt.length > 50 ? '...' : '');
      
      // First create the chat with the title
      const newChat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: chatTitle,
          updatedAt: new Date()
        }
      });
      
      currentChatId = newChat.id;
      chatId = currentChatId;
      
      // Then create the first message
      await prisma.message.create({
        data: {
          chatId: currentChatId,
          role: 'user',
          content: userPrompt
        }
      });
      
      currentChatId = newChat.id;
      chatId = currentChatId;
      
      // Add the new message to the conversation
      messages.push({ role: "user" as const, content: userPrompt });
      
      // Generate a better title asynchronously without blocking the response
      generateChatTitle(userPrompt, currentChatId).catch(console.error);
    } else {
      // For existing chats, load previous messages
      const [dbMessages, existingMessage] = await Promise.all([
        prisma.message.findMany({
          where: { 
            chatId: currentChatId, 
            chat: { userId: session.user.id } 
          },
          select: { role: true, content: true },
          orderBy: { createdAt: "asc" },
        }),
        prisma.message.findFirst({
          where: {
            chatId: currentChatId,
            content: userPrompt,
            role: 'user',
            createdAt: {
              gte: new Date(Date.now() - 5000)
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        })
      ]);
      
      messages = [...messages, ...dbMessages];
      
      // Only save the message if it doesn't already exist
      if (!existingMessage) {
        await prisma.message.create({
          data: {
            chatId: currentChatId,
            role: 'user' as const,
            content: userPrompt
          },
        });
        
        // Update chat's updatedAt timestamp
        await prisma.chat.update({
          where: { id: currentChatId },
          data: { updatedAt: new Date() },
        });
        
        // Add the new message to the conversation
        messages.push({ role: "user" as const, content: userPrompt });
      }
    }

    // Token estimation & check (only for Mistral/OpenAI)
    const provider = await getAIProvider();
    if (provider === "mistral") {
      const estimatedTokens = countMessageTokens(messages);
      try {
        await checkUserTokenLimit(session.user.id, estimatedTokens, chatId);
      } catch {
        return new Response(
          JSON.stringify({ error: "Daily token limit reached" }),
          { status: 403 }
        );
      }
    }

    // ---------------- Streaming AI Response ----------------
    const encoder = new TextEncoder();
    let assistantMessage = "";
    // Reuse the existing provider variable from line 195

    if (provider === "ollama") {
      try {
        const response: any = await createChatCompletion(messages, {
          stream: true,
        });
        
        if (!response || !response.body) {
          console.error("No response body from Ollama");
          return new Response("No response from Ollama", { status: 500 });
        }

        const stream = new ReadableStream({
          async start(controller) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter(Boolean);
                
                for (const line of lines) {
                  try {
                    const data = JSON.parse(line);
                    if (data.response) {
                      assistantMessage += data.response;
                      controller.enqueue(encoder.encode(data.response));
                    }
                  } catch (err) {
                    console.error("Error parsing Ollama response line:", err);
                  }
                }
              }

              // Save the assistant's message to the database
              try {
                console.log("Attempting to save assistant message to database...");
                const savedMessage = await prisma.message.create({
                  data: { 
                    chatId, 
                    role: "assistant", 
                    content: assistantMessage 
                  },
                });
                console.log("Successfully saved assistant message:", savedMessage);
              } catch (dbError) {
                console.error("Database save error:", dbError);
                throw dbError; // Re-throw to be caught by the outer catch
              }
              
              controller.close();
            } catch (err) {
              console.error("Ollama stream processing error:", err);
              controller.error(err);
            }
          },
        });

        // Return the stream response
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (error) {
        console.error("Error in Ollama request:", error);
        return new Response(JSON.stringify({ error: "Error processing Ollama request" }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Mistral streaming
      const completion: any = await createChatCompletion(messages, {
        model: "gpt-4o-mini",
        stream: true,
        temperature: 0.7,
      });
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              assistantMessage += text;
              controller.enqueue(encoder.encode(text));
            }

            await prisma.message.create({
              data: { chatId, role: "assistant", content: assistantMessage },
            });

            controller.close();
          } catch (err) {
            console.error("OpenAI stream error:", err);
            controller.error(err);
          }
        },
      });

      // Add tokens after successful response
      const estimatedTokens = countMessageTokens(messages);
      addUserTokens(session.user.id, estimatedTokens, chatId);

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response("Error generating response", { status: 500 });
  }
}

// ---------------- Generate Chat Title ----------------
async function generateChatTitle(userMessage: string, chatId: string) {
  console.log("Generating chat title for message:", userMessage);
  
  try {
    const provider = await getAIProvider();
    let rawTitle = "New Chat";

    if (provider === "ollama") {
      console.log("Using Ollama for title generation");
      
      const prompt = `Generate a short and clear chat title (max 6 words, no quotes or punctuation) for the following message:
      "${userMessage}"`;
      
      console.log("Sending to Ollama for title:", { prompt });
      
      const response = await fetch(process.env.OLLAMA_URL || 'http://localhost:11434/api/generate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral",
          prompt,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama title generation error:", {
          status: response.status,
          error: errorText
        });
        return "New Chat";
      }

      const data = await response.json();
      console.log("Title generation response:", data);
      
      rawTitle = data.response?.trim() || "New Chat";
    } else {
      console.log("Using OpenAI for title generation");
      
      const completion = await createChatCompletion(
        [
          {
            role: "system",
            content: "Generate a short, descriptive title (max 6 words, no quotes or punctuation)"
          },
          { 
            role: "user", 
            content: `Create a title for this chat: ${userMessage}`
          }
        ],
        { 
          model: "gpt-3.5-turbo", 
          max_tokens: 20, 
          temperature: 0.7 
        }
      );
      
      console.log("Title generation completion:", completion);
      rawTitle = completion.choices[0]?.message?.content?.trim() || "New Chat";
    }

    const cleanTitle = rawTitle.replace(/["'.!?]/g, "").trim();
    console.log("Generated chat title:", cleanTitle);

    await prisma.chat.update({
      where: { id: chatId },
      data: { title: cleanTitle },
    });

    return cleanTitle;
  } catch (err) {
    console.error("Failed to generate chat title:", err);
    return "New Chat";
  }
}