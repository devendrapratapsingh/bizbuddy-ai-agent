import { Router } from 'express';
import { prisma } from '@/config/database';

const router = Router();

// Get all leads for a business
router.get('/', async (req, res) => {
  try {
    const { businessId } = req.query;
    const { limit = 50, offset = 0, scoreThreshold = 0 } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const leads = await prisma.lead.findMany({
      where: {
        businessId,
        score: {
          gte: parseFloat(scoreThreshold as string)
        }
      },
      include: {
        pipeline: {
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
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.status(200).json(leads);
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific lead
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        pipeline: {
          include: {
            conversation: {
              include: {
                messages: {
                  orderBy: {
                    createdAt: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.status(200).json(lead);
  } catch (error) {
    console.error('Error getting lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new lead
router.post('/', async (req, res) => {
  try {
    const { pipelineId, businessId, name, email, phone, company, intent, score, conversionProbability, metadata } = req.body;

    if (!businessId || !name) {
      return res.status(400).json({ error: 'Business ID and name are required' });
    }

    const lead = await prisma.lead.create({
      data: {
        pipelineId,
        businessId,
        name,
        email,
        phone,
        company,
        intent,
        score,
        conversionProbability,
        metadata
      },
      include: {
        pipeline: {
          include: {
            conversation: true
          }
        }
      }
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a lead
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, intent, score, conversionProbability, metadata } = req.body;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        intent,
        score,
        conversionProbability,
        metadata
      },
      include: {
        pipeline: {
          include: {
            conversation: true
          }
        }
      }
    });

    res.status(200).json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lead statistics
router.get('/stats', async (req, res) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const stats = await prisma.lead.groupBy({
      by: ['score'],
      where: { businessId },
      _count: true
    });

    // Calculate additional statistics
    const totalLeads = await prisma.lead.count({
      where: { businessId }
    });

    const qualifiedLeads = await prisma.lead.count({
      where: {
        businessId,
        score: {
          gte: 0.7
        }
      }
    });

    const conversionProbabilityStats = await prisma.lead.aggregate({
      where: { businessId },
      _sum: {
        conversionProbability: true
      },
      _avg: {
        conversionProbability: true
      },
      _max: {
        conversionProbability: true
      },
      _min: {
        conversionProbability: true
      }
    });

    const result = {
      totalLeads,
      qualifiedLeads,
      conversionProbability: conversionProbabilityStats,
      stats
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting lead statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as leadsRouter };