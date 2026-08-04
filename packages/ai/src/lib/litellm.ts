/**
 * LiteLLM (self-hosted) model gateway client.
 * OpenAI-compatible: /v1/chat/completions, /v1/embeddings.
 */

export interface LiteLLMConfig {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
  timeoutMs?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  timeoutMs?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

const DEFAULT_TIMEOUT_MS = 60_000;

export class LiteLLMClient {
  constructor(private readonly config: LiteLLMConfig) {}

  get baseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.chatModel,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens,
        response_format:
          options.responseFormat === 'json_object'
            ? { type: 'json_object' }
            : undefined,
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`LiteLLM chat failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
      model: string;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };
    return {
      content: data.choices[0]?.message?.content ?? '',
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ model: this.config.embeddingModel, input: texts }),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`LiteLLM embeddings failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => d.embedding);
  }
}

export function createLiteLLMClient(): LiteLLMClient {
  return new LiteLLMClient({
    baseUrl: process.env.LITELLM_BASE_URL ?? 'http://localhost:4000',
    apiKey: process.env.LITELLM_API_KEY ?? 'sk-local',
    chatModel: process.env.CHAT_MODEL ?? 'gpt-4o-mini',
    embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
  });
}
