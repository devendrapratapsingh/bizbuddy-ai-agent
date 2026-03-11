import { Router } from 'express';
import { prisma } from '@/config/database';
import { ConversationService } from '@/services/conversation';

const router = Router();
const conversationService = new ConversationService();

// Get all conversations for a business
router.get('/', async (req, res) => {
  try {
    const { businessId } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const conversations = await prisma.conversation.findMany({
      where: { businessId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        business: {
          select: {
            name: true,
            description: true,
            industry: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific conversation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new conversation
router.post('/', async (req, res) => {
  try {
    const { businessId, customerId, channel = 'CHAT' } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const conversation = await conversationService.createConversation(
      businessId,
      customerId,
      channel as 'CHAT' | 'VOICE' | 'EMAIL'
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a message to a conversation
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, content, contentType = 'TEXT' } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ error: 'Sender and content are required' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        sender,
        content,
        contentType
      },
      include: {
        conversation: {
          select: {
            id: true,
            businessId: true
          }
        }
      }
    });

    // Emit message to WebSocket clients
    // This would be handled by the Socket.IO setup in the main server

    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close a conversation
router.put('/:id/close', async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await conversationService.closeConversation(id);

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfer conversation to an agent
router.post('/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId, reason } = req.body;

    if (!agentId || !reason) {
      return res.status(400).json({ error: 'Agent ID and reason are required' });
    }

    const conversation = await conversationService.transferToAgent(
      id,
      agentId,
      reason
    );

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error transferring conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation history for a business
router.get('/history', async (req, res) => {
  try {
    const { businessId } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const conversations = await conversationService.getConversationHistory(
      businessId as string,
      parseInt(limit as string)
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as conversationsRouter };