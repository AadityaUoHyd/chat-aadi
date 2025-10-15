// tokenCounter.ts
import { encodingForModel } from "js-tiktoken";

export function countMessageTokens(
  messages: { role: string; content: string; name?: string }[],
  model: any = "gpt-3.5-turbo-0613"
): number {
  const encoding = encodingForModel(model);

  // Defaults based on OpenAI docs
  let tokensPerMessage = 3;
  let tokensPerName = 1;

  if (!(model === "gpt-3.5-turbo-0613" || model === "gpt-4-0613")) {
    throw new Error(`Token counting not implemented for model: ${model}`);
  }

  let numTokens = 0;

  for (const message of messages) {
    numTokens += tokensPerMessage;
    for (const [key, value] of Object.entries(message)) {
      numTokens += encoding.encode(value).length;
      if (key === "name") {
        numTokens += tokensPerName;
      }
    }
  }

  numTokens += 3; // every reply is primed with <|start|>assistant
  return numTokens;
}
