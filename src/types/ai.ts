// AI Service Types
export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AIProviderConfig = {
  provider: 'anthropic' | 'deepseek';
  apiKey: string;
};

export type AIOptions = {
  model: string;
  temperature?: number;
  maxTokens?: number;
};
