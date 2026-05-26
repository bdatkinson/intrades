import type { AIMessage, AIProviderConfig, AIOptions } from '../types/ai';

class AIService {
  private provider: 'anthropic' | 'deepseek';
  private config: AIProviderConfig;

  constructor(provider: 'anthropic' | 'deepseek', config: AIProviderConfig) {
    this.provider = provider;
    this.config = config;
  }

  async sendMessage(
    messages: AIMessage[],
    options: AIOptions
  ): Promise<string> {
    switch (this.provider) {
      case 'anthropic':
        return this.sendToAnthropic(messages, options);
      case 'deepseek':
        return this.sendToDeepseek(messages, options);
      default:
        throw new Error('Unsupported AI provider');
    }
  }

  private async sendToAnthropic(
    messages: AIMessage[],
    options: AIOptions
  ): Promise<string> {
    // Validate inputs
    if (!messages.length) {
      throw new Error('At least one message is required');
    }
    if (!options.model) {
      throw new Error('Model is required');
    }

    // TODO: Implement proper Anthropic API integration
    return `Anthropic response for model ${options.model}`;
  }

  private async sendToDeepseek(
    messages: AIMessage[],
    options: AIOptions
  ): Promise<string> {
    // Validate inputs
    if (!messages.length) {
      throw new Error('At least one message is required');
    }
    if (!options.model) {
      throw new Error('Model is required');
    }

    // TODO: Implement proper Deepseek API integration
    return `Deepseek response for model ${options.model}`;
  }
}

export default AIService;
