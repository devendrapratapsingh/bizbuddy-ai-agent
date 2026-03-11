import { AIService } from '../services/ai';

// Mock the OpenAI client
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  intent: 'information_request',
                  confidence: 0.85,
                  entities: []
                })
              }
            }],
            usage: {
              total_tokens: 100,
              prompt_tokens: 50,
              completion_tokens: 50
            }
          })
        }
      }
    }))
  };
});

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  describe('generateResponse', () => {
    it('should generate a response from OpenAI', async () => {
      const result = await aiService.generateResponse(
        'conv-123',
        'Hello, I need help',
        {
          name: 'Test Business',
          description: 'A test business',
          industry: 'Technology'
        },
        []
      );

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('metadata');
    });
  });

  describe('analyzeIntent', () => {
    it('should analyze intent from message', async () => {
      const result = await aiService.analyzeIntent(
        'conv-123',
        'I want to know about your pricing',
        {
          name: 'Test Business',
          industry: 'Technology'
        }
      );

      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('entities');
    });
  });
});