import OpenAI from 'openai';
import { Conversation, Message, Lead } from '@/models';

export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
      organization: process.env.OPENAI_ORGANIZATION_ID || undefined
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
  }

  async generateResponse(
    conversationId: string,
    userInput: string,
    businessContext: any,
    previousMessages: any[]
  ): Promise<{ response: string; metadata: any }> {
    try {
      const messages = [
        {
          role: 'system',
          content: this.createSystemPrompt(businessContext)
        },
        ...previousMessages,
        {
          role: 'user',
          content: userInput
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0].message.content;
      const metadata = {
        model: this.model,
        usage: completion.usage,
        temperature: 0.7
      };

      return { response, metadata };
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private createSystemPrompt(businessContext: any): string {
    const basePrompt = `
You are BizBuddy, a professional AI assistant for ${businessContext.name}.

Your primary responsibilities are:
1. Understand customer inquiries and provide helpful responses
2. Qualify leads and identify business opportunities
3. Create actionable pipelines and tasks
4. Maintain professional communication aligned with the business's brand

Key business information:
- Business name: ${businessContext.name}
- Business description: ${businessContext.description || 'Professional services'}}
- Industry: ${businessContext.industry || 'Business services'}
- Tone: Professional, helpful, and efficient

Important guidelines:
- Always prioritize understanding customer needs
- Ask clarifying questions when needed
- Never make promises the business cannot keep
- Maintain confidentiality and professionalism
- Focus on creating value for both the customer and the business
`;

    // Add custom scripts if available
    if (businessContext.scripts && businessContext.scripts.length > 0) {
      basePrompt += `\n\nCustom scripts to follow:\n${businessContext.scripts.join('\n')}`;
    }

    return basePrompt.trim();
  }

  async analyzeIntent(
    conversationId: string,
    message: string,
    businessContext: any
  ): Promise<{ intent: string; confidence: number; entities: any[] }> {
    try {
      const prompt = `
Analyze this customer message and identify the primary intent:
\nMessage: ${message}\n\nBusiness context: ${businessContext.name} (${businessContext.industry})

Possible intents include:
- Information request
- Product/service inquiry
- Pricing inquiry
- Support request
- Sales opportunity
- Complaint
- General inquiry

Return the following JSON format:
{
  "intent": "main_intent",
  "confidence": 0.85,
  "entities": [
    {"type": "product", "value": "product_name"},
    {"type": "pricing", "value": "price_range"}
  ]
}
`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an intent analysis expert. Extract structured intent data from customer messages.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(response);
      } catch (parseError) {
        console.warn('Intent analysis parse error:', parseError);
        result = {
          intent: 'unknown',
          confidence: 0.5,
          entities: []
        };
      }

      return result;
    } catch (error) {
      console.error('Intent analysis error:', error);
      return {
        intent: 'unknown',
        confidence: 0.5,
        entities: []
      };
    }
  }

  async qualifyLead(
    conversation: Conversation,
    messages: Message[],
    businessContext: any
  ): Promise<{ score: number; conversionProbability: number; metadata: any }> {
    try {
      const conversationSummary = this.summarizeConversation(messages);

      const prompt = `
Qualify this lead based on the conversation summary and business context:
\nConversation summary: ${conversationSummary}\n\nBusiness context: ${businessContext.name} (${businessContext.industry})

Provide lead qualification score (0-1) and conversion probability (0-1) with reasoning.
Return JSON format:
{
  "score": 0.75, // Lead qualification score
  "conversionProbability": 0.65, // Conversion probability
  "reasoning": "Detailed explanation of qualification factors",
  "metadata": {
    "intentMatch": true,
    "budgetIndicated": false,
    "timeline": "immediate",
    "decisionMaker": true
  }
}
`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a lead qualification expert. Analyze conversations and provide lead scores with reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content;
      let result;

      try {
        result = JSON.parse(response);
      } catch (parseError) {
        console.warn('Lead qualification parse error:', parseError);
        result = {
          score: 0.5,
          conversionProbability: 0.5,
          reasoning: 'Unable to determine qualification factors',
          metadata: {}
        };
      }

      return result;
    } catch (error) {
      console.error('Lead qualification error:', error);
      return {
        score: 0.5,
        conversionProbability: 0.5,
        reasoning: 'Error processing qualification',
        metadata: {}
      };
    }
  }

  private summarizeConversation(messages: Message[]): string {
    if (messages.length === 0) return 'No conversation history available';

    // Get last 10 messages for summary
    const recentMessages = messages.slice(-10);
    const messageTexts = recentMessages.map(msg =>
      `${msg.sender === 'AI' ? 'AI:' : 'Customer:'} ${msg.content}`
    );

    return messageTexts.join(' | ');
  }

  async createPipelineTasks(
    conversation: Conversation,
    lead: Lead,
    businessContext: any
  ): Promise<any[]> {
    try {
      const prompt = `
Create actionable tasks for this pipeline based on the conversation and lead information:
\nConversation context: ${conversation.id} - ${conversation.channel}\nLead information: ${lead.name} (${lead.email || 'No email'}) - Score: ${lead.score}
Business context: ${businessContext.name}

Generate 3-5 specific, actionable tasks with assignees, deadlines, and priorities.
Return JSON format:
[
  {
    "task": "Specific action item",
    "assignee": "Role or person",
    "deadline": "ISO date string",
    "priority": "high|medium|low",
    "description": "Detailed task description"
  }
]
`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a task creation expert. Generate actionable pipeline tasks from conversations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const response = completion.choices[0].message.content;
      let tasks;

      try {
        tasks = JSON.parse(response);
      } catch (parseError) {
        console.warn('Task creation parse error:', parseError);
        tasks = [];
      }

      return tasks;
    } catch (error) {
      console.error('Task creation error:', error);
      return [];
    }
  }
}