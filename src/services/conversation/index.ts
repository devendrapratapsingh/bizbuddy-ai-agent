import { prisma } from '@/config/database';
import { AIService } from '@/services/ai';

export class ConversationService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async createConversation(
    businessId: string,
    customerId?: string,
    channel: 'CHAT' | 'VOICE' | 'EMAIL' = 'CHAT'
  ) {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          businessId,
          customerId,
          channel,
          status: 'OPEN'
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async getConversation(id: string) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          business: {
            select: {
              name: true,
              description: true,
              industry: true,
              theme: true,
              settings: true
            }
          }
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw new Error('Failed to get conversation');
    }
  }

  async addMessage(
    conversationId: string,
    sender: 'AI' | 'HUMAN' | 'SYSTEM',
    content: string,
    contentType: 'TEXT' | 'VOICE' | 'IMAGE' | 'FILE' = 'TEXT'
  ) {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          sender,
          content,
          contentType
        }
      });

      // If human message, generate AI response
      if (sender === 'HUMAN') {
        await this.processHumanMessage(conversationId, content);
      }

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw new Error('Failed to add message');
    }
  }

  private async processHumanMessage(conversationId: string, content: string) {
    try {
      const conversation = await this.getConversation(conversationId);
      const previousMessages = conversation.messages.map(msg => ({
        role: msg.sender === 'AI' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Generate AI response
      const response = await this.aiService.generateResponse(
        conversationId,
        content,
        {
          name: conversation.business.name,
          description: conversation.business.description,
          industry: conversation.business.industry,
          theme: conversation.business.theme,
          settings: conversation.business.settings
        },
        previousMessages
      );

      // Add AI response to conversation
      await this.addMessage(conversationId, 'AI', response.response, 'TEXT');

      // Analyze intent
      const intentAnalysis = await this.aiService.analyzeIntent(
        conversationId,
        content,
        {
          name: conversation.business.name,
          industry: conversation.business.industry
        }
      );

      // If intent is strong, consider lead qualification
      if (intentAnalysis.confidence > 0.7) {
        await this.considerLeadQualification(conversation, intentAnalysis);
      }

      return response;
    } catch (error) {
      console.error('Error processing human message:', error);
      // Fallback: add system message about error
      await this.addMessage(conversationId, 'SYSTEM', 'Apologies, there was an issue processing your message. Please try again.', 'TEXT');
    }
  }

  private async considerLeadQualification(
    conversation: any,
    intentAnalysis: any
  ) {
    try {
      // Check if conversation already has a pipeline
      const existingPipeline = await prisma.pipeline.findFirst({
        where: {
          conversationId: conversation.id,
          status: 'OPEN'
        }
      });

      if (existingPipeline) {
        console.log('Pipeline already exists for this conversation');
        return;
      }

      // Get all messages in conversation
      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' }
      });

      // Qualify lead
      const qualification = await this.aiService.qualifyLead(
        conversation,
        messages,
        {
          name: conversation.business.name,
          industry: conversation.business.industry
        }
      );

      // If score is above threshold, create lead and pipeline
      if (qualification.score >= parseFloat(process.env.LEAD_QUALIFICATION_THRESHOLD || '0.7')) {
        await this.createLeadAndPipeline(conversation, qualification);
      }
    } catch (error) {
      console.error('Error considering lead qualification:', error);
    }
  }

  private async createLeadAndPipeline(
    conversation: any,
    qualification: any
  ) {
    try {
      // Create lead
      const lead = await prisma.lead.create({
        data: {
          pipelineId: null, // Will be updated when pipeline is created
          name: 'Qualified Lead', // TODO: Extract name from conversation
          email: null, // TODO: Extract email from conversation
          phone: null, // TODO: Extract phone from conversation
          intent: qualification.intent,
          score: qualification.score,
          conversionProbability: qualification.conversionProbability,
          metadata: {
            qualificationReasoning: qualification.reasoning,
            ...qualification.metadata
          }
        }
      });

      // Create pipeline
      const pipeline = await prisma.pipeline.create({
        data: {
          conversationId: conversation.id,
          businessId: conversation.businessId,
          name: `Pipeline for ${lead.name}`,
          status: 'OPEN',
          tasks: await this.aiService.createPipelineTasks(
            conversation,
            lead,
            {
              name: conversation.business.name,
              industry: conversation.business.industry
            }
          )
        }
      });

      // Update lead with pipeline reference
      await prisma.lead.update({
        where: { id: lead.id },
        data: { pipelineId: pipeline.id }
      });

      console.log('Created lead and pipeline:', pipeline.id);
    } catch (error) {
      console.error('Error creating lead and pipeline:', error);
    }
  }

  async closeConversation(id: string) {
    try {
      const conversation = await prisma.conversation.update({
        where: { id },
        data: { status: 'CLOSED' }
      });

      return conversation;
    } catch (error) {
      console.error('Error closing conversation:', error);
      throw new Error('Failed to close conversation');
    }
  }

  async transferToAgent(
    conversationId: string,
    agentId: string,
    reason: string
  ) {
    try {
      // Create handoff record
      await prisma.handoff.create({
        data: {
          conversationId,
          agentId,
          reason
        }
      });

      // Update conversation status
      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          status: 'TRANSFERRED'
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error transferring conversation:', error);
      throw new Error('Failed to transfer conversation');
    }
  }

  async getConversationHistory(businessId: string, limit: number = 50) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { businessId },
        include: {
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit
      });

      return conversations;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw new Error('Failed to get conversation history');
    }
  }

  async getLeadPipeline(businessId: string, limit: number = 50) {
    try {
      const pipelines = await prisma.pipeline.findMany({
        where: {
          businessId,
          status: 'OPEN'
        },
        include: {
          leads: {
            include: {
              conversation: {
                include: {
                  messages: {
                    take: 1,
                    orderBy: {
                      createdAt: 'desc'
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit
      });

      return pipelines;
    } catch (error) {
      console.error('Error getting lead pipeline:', error);
      throw new Error('Failed to get lead pipeline');
    }
  }
}