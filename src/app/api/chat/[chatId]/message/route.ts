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
async function getAIProvider(forceMistral = false): Promise<AIProvider> {
  // If Mistral is forced (e.g., after an Ollama failure), use it
  if (forceMistral) {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("MISTRAL_API_KEY is not set in environment variables");
    }
    return "mistral";
  }

  // Try Ollama first if not explicitly disabled
  if (process.env.DISABLE_OLLAMA !== 'true') {
    try {
      // Test if Ollama is available with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(process.env.OLLAMA_URL || 'http://localhost:11434/api/tags', { 
        method: 'GET',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        // Check if llama3.2 is available in the models list
        const hasLlamaModel = data.models?.some((model: any) => 
          model.name?.includes('llama3.2') || 
          model.name?.includes('llama3') ||
          model.model?.includes('llama3.2') ||
          model.model?.includes('llama3')
        );
        
        if (hasLlamaModel) {
          return "ollama";
        }
      }
    } catch (error) {
      console.warn("Ollama not available, falling back to Mistral:", 
        error instanceof Error ? error.message : String(error)
      );
    }
  }
  
  // Fall back to Mistral if Ollama is not available, disabled, or failed
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("Neither Ollama is available nor MISTRAL_API_KEY is set. Please ensure at least one AI provider is properly configured.");
  }
  
  return "mistral";
}

// Initialize Mistral client with custom endpoint if provided
const mistralClient = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1',
});

// Helper: unified chat completion
async function createChatCompletion(messages: any[], options: any = {}) {
  // Always try Ollama first in development, Mistral in production
  const isLocal = process.env.NODE_ENV === 'development';
  const provider = isLocal ? 'ollama' : await getAIProvider();
  
  try {
    if (provider === "ollama") {
      try {
        // Format messages for Ollama's API
        const prompt = messages.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
        
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
        console.log(`Calling Ollama API at: ${ollamaUrl}`);
        
        if (!process.env.OLLAMA_MODEL) {
          throw new Error('OLLAMA_MODEL is not set in environment variables');
        }
        console.log(`Using Ollama model: ${process.env.OLLAMA_MODEL}`);
        
        const response = await fetch(ollamaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            model: process.env.OLLAMA_MODEL,
            prompt,
            stream: options.stream || false,
            ...options
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          console.error('Ollama API error, falling back to Mistral');
          console.error(`Ollama API error (${response.status}): ${errorText}`);
          
          // If we get a 404, it means the model doesn't exist
          if (response.status === 404) {
            console.error(`Model '${process.env.OLLAMA_MODEL}' not found. Please make sure it's installed with 'ollama pull ${process.env.OLLAMA_MODEL}'`);
          }
          
          // Throw to trigger the Mistral fallback
          throw new Error('Ollama API request failed');
        }

        if (options.stream) {
          return response;
        } else {
          // For non-streaming, parse the response
          const responseData = await response.json();
          let fullResponse = '';
          
          // Handle different possible response formats
          if (responseData.response !== undefined) {
            // Format 1: Direct response field
            fullResponse = responseData.response;
          } else if (responseData.choices && responseData.choices[0]?.message?.content) {
            // Format 2: OpenAI-compatible format
            fullResponse = responseData.choices[0].message.content;
          } else if (responseData.message?.content) {
            // Format 3: Another common format
            fullResponse = responseData.message.content;
          } else {
            console.warn('Unexpected Ollama response format:', JSON.stringify(responseData, null, 2));
            fullResponse = 'Received an unexpected response format from the model.';
          }
          
          return {
            id: `ollama-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'llama3.2',
            choices: [{
              message: {
                role: 'assistant',
                content: fullResponse
              },
              finish_reason: 'stop',
              index: 0
            }],
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0
            }
          };
        }
      } catch (error) {
        console.error('Ollama API error, falling back to Mistral:', error);
        try {
          console.log('Falling back to Mistral with model:', process.env.MISTRAL_MODEL || 'mistral-small');
          return await createChatCompletionWithMistral(messages, {
            ...options,
            model: process.env.MISTRAL_MODEL || 'mistral-small',
            stream: options.stream || false
          });
        } catch (mistralError) {
          console.error('Mistral fallback also failed:', mistralError);
          throw new Error('Both Ollama and Mistral APIs failed. Please check your configuration.');
        }
      }
    } else {
      // Use Mistral directly if not using Ollama
      return createChatCompletionWithMistral(messages, options);
    }
  } catch (error) {
    console.error(`Error in createChatCompletion (${provider}):`, error);
    throw error;
  }
}

// Helper function to handle Mistral API calls
async function createChatCompletionWithMistral(messages: any[], options: any = {}) {
  try {
    const completion = await mistralClient.chat.completions.create({
      model: options.model || process.env.MISTRAL_MODEL || "mistral-small",
      messages,
      stream: options.stream || false,
      ...options
    });
    return completion;
  } catch (error) {
    console.error("Mistral API error:", error);
    // If using custom endpoint and it fails, try the default Mistral endpoint as last resort
    if (process.env.MISTRAL_API_URL && process.env.MISTRAL_API_URL !== 'https://api.mistral.ai/v1') {
      console.log("Trying default Mistral endpoint...");
      const defaultMistralClient = new OpenAI({
        apiKey: process.env.MISTRAL_API_KEY,
        baseURL: 'https://api.mistral.ai/v1',
      });
      return await defaultMistralClient.chat.completions.create({
        model: options.model || "mistral-tiny",
        messages,
        stream: options.stream || false,
        ...options
      });
    }
    throw error;
  }
}

// ------------------ GET Messages ------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;
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
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    let { chatId } = await context.params;
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
      
      // Check if chat exists
      const chatExists = await prisma.chat.findUnique({
        where: { id: currentChatId },
        select: { id: true }
      });

      if (!chatExists) {
        console.error(`Chat with ID ${currentChatId} not found`);
        return new Response("Chat not found", { status: 404 });
      }

      // Only save the message if it doesn't already exist
      if (!existingMessage) {
        try {
          await prisma.$transaction([
            prisma.message.create({
              data: {
                chatId: currentChatId,
                role: 'user' as const,
                content: userPrompt
              },
            }),
            prisma.chat.update({
              where: { id: currentChatId },
              data: { updatedAt: new Date() },
            })
          ]);
          
          // Add the new message to the conversation
          messages.push({ role: "user" as const, content: userPrompt });
        } catch (error) {
          console.error("Error saving message:", error);
          return new Response("Error saving message", { status: 500 });
        }
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
                const savedMessage = await prisma.message.create({
                  data: { 
                    chatId, 
                    role: "assistant", 
                    content: assistantMessage 
                  },
                });
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
        model: "mistral-tiny",
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
  
  try {
    const provider = await getAIProvider();
    let rawTitle = "New Chat";

    if (provider === "ollama") {
      try {
        const prompt = `Generate a short and clear chat title (max 6 words, no quotes or punctuation) for the following message:
        "${userMessage}"`;
        
        const response = await fetch(process.env.OLLAMA_URL || 'http://localhost:11434/api/generate', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            prompt,
            stream: false
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        rawTitle = data.response?.trim() || "New Chat";
      } catch (error) {
        console.error("Error using Ollama, falling back to Mistral:", error);
        // Fall back to Mistral if Ollama fails
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
            model: "mistral-tiny",
            max_tokens: 20, 
            temperature: 0.7 
          }
        );
        rawTitle = (completion as any).choices?.[0]?.message?.content?.trim() || "New Chat";
      }
    } else {
      // Use Mistral by default when not using Ollama
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
          model: "mistral-tiny",
          max_tokens: 20, 
          temperature: 0.7 
        }
      );
      rawTitle = (completion as any).choices?.[0]?.message?.content?.trim() || "New Chat";
    }

    const cleanTitle = rawTitle.replace(/["'.!?]/g, "").trim();

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