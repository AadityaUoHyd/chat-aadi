export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AIModel = 'mistral' | 'llama3.2';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MISTRAL_API_URL = process.env.MISTRAL_API_URL || 'https://api.laplateforme.io/mistral/v1';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function getAvailableModels(): Promise<{ local: boolean; models: AIModel[] }> {
  const isOllamaAvailable = await checkOllamaAvailable();
  
  if (isOllamaAvailable) {
    return {
      local: true,
      models: ['llama3.2']
    };
  }
  
  return {
    local: false,
    models: MISTRAL_API_KEY ? ['mistral'] : []
  };
}

export async function createChatCompletion(
  messages: Message[], 
  options: {
    model?: AIModel;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ content: string; model: AIModel }> {
  const { model, temperature = 0.7, maxTokens = 1000 } = options;
  const isOllamaAvailable = await checkOllamaAvailable();
  
  // Default to local Ollama if available and no specific model is requested
  const useOllama = isOllamaAvailable && (!model || model === 'llama3.2');
  
  if (useOllama) {
    return createOllamaCompletion(messages, {
      model: 'llama3.2', // Default to llama3.2 for Ollama
      temperature,
      max_tokens: maxTokens,
    });
  }
  
  // Fall back to Mistral API if available
  if (MISTRAL_API_KEY) {
    return createMistralCompletion(messages, {
      model: 'mistral-tiny', // or 'mistral-small'/'mistral-medium' based on your subscription
      temperature,
      max_tokens: maxTokens,
    });
  }
  
  throw new Error('No AI service available. Please ensure Ollama is running or provide a Mistral API key.');
}

async function createOllamaCompletion(
  messages: Message[],
  options: {
    model: string;
    temperature: number;
    max_tokens: number;
  }
): Promise<{ content: string; model: AIModel }> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      options: {
        temperature: options.temperature,
        num_predict: options.max_tokens,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.message?.content || '',
    model: 'llama3.2' as AIModel,
  };
}

async function createMistralCompletion(
  messages: Message[],
  options: {
    model: string;
    temperature: number;
    max_tokens: number;
  }
): Promise<{ content: string; model: AIModel }> {
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key is not configured');
  }

  const response = await fetch(`${MISTRAL_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    model: 'mistral' as AIModel,
  };
}
