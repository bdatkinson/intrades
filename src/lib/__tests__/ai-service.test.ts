import AIService from '../ai-service';
import { AIMessage } from '../../types/ai';

describe('AIService', () => {
  const testMessages: AIMessage[] = [
    { role: 'user', content: 'Hello' },
  ];
  const testOptions = { model: 'test-model' };

  describe('constructor', () => {
    it('should initialize with provider and config', () => {
      const service = new AIService('anthropic', { provider: 'anthropic', apiKey: 'test-key' });
      expect(service).toBeInstanceOf(AIService);
    });
  });

  describe('sendMessage', () => {
    it('should call anthropic provider', async () => {
      const service = new AIService('anthropic', { provider: 'anthropic', apiKey: 'test-key' });
      const response = await service.sendMessage(testMessages, testOptions);
      expect(response).toContain('Anthropic response');
    });

    it('should call deepseek provider', async () => {
      const service = new AIService('deepseek', { provider: 'deepseek', apiKey: 'test-key' });
      const response = await service.sendMessage(testMessages, testOptions);
      expect(response).toContain('Deepseek response');
    });

    it('should throw for invalid provider', async () => {
      const service = new AIService('invalid' as any, { provider: 'invalid', apiKey: 'test-key' });
      await expect(service.sendMessage(testMessages, testOptions)).rejects.toThrow('Unsupported AI provider');
    });
  });

  describe('validation', () => {
    it('should require at least one message', async () => {
      const service = new AIService('anthropic', { provider: 'anthropic', apiKey: 'test-key' });
      await expect(service.sendMessage([], testOptions)).rejects.toThrow('At least one message is required');
    });

    it('should require model in options', async () => {
      const service = new AIService('anthropic', { provider: 'anthropic', apiKey: 'test-key' });
      await expect(service.sendMessage(testMessages, {} as any)).rejects.toThrow('Model is required');
    });
  });
});