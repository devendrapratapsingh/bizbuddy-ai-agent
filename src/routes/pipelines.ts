import { Router } from 'express';
import { prisma } from '@/config/database';

const router = Router();

// Get all pipelines for a business
router.get('/', async (req, res) => {
  try {
    const { businessId } = req.query;
    const { limit = 50, offset = 0, status } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const where: any = { businessId };
    if (status) {
      where.status = status;
    }

    const pipelines = await prisma.pipeline.findMany({
      where,
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
        },
        leads: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.status(200).json(pipelines);
  } catch (error) {
    console.error('Error getting pipelines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific pipeline
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        leads: true
      }
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.status(200).json(pipeline);
  } catch (error) {
    console.error('Error getting pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new pipeline
router.post('/', async (req, res) => {
  try {
    const { conversationId, businessId, name, status = 'OPEN', tasks, metadata } = req.body;

    if (!businessId || !name) {
      return res.status(400).json({ error: 'Business ID and name are required' });
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        conversationId,
        businessId,
        name,
        status,
        tasks,
        metadata
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        leads: true
      }
    });

    res.status(201).json(pipeline);
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a pipeline
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, tasks, metadata } = req.body;

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: {
        name,
        status,
        tasks,
        metadata
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        leads: true
      }
    });

    res.status(200).json(pipeline);
  } catch (error) {
    console.error('Error updating pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a pipeline
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pipeline = await prisma.pipeline.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Pipeline deleted successfully' });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a lead to a pipeline
router.post('/:id/leads', async (req, res) => {
  try {
    const { id } = req.params;
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'Lead ID is required' });
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        pipelineId: id
      },
      include: {
        pipeline: true
      }
    });

    res.status(200).json(lead);
  } catch (error) {
    console.error('Error adding lead to pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pipeline statistics
router.get('/stats', async (req, res) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const stats = await prisma.pipeline.groupBy({
      by: ['status'],
      where: { businessId },
      _count: true
    });

    // Calculate additional statistics
    const totalPipelines = await prisma.pipeline.count({
      where: { businessId }
    });

    const openPipelines = await prisma.pipeline.count({
      where: {
        businessId,
        status: 'OPEN'
      }
    });

    const completedPipelines = await prisma.pipeline.count({
      where: {
        businessId,
        status: 'COMPLETED'
      }
    });

    const averageLeadsPerPipeline = await prisma.pipeline.aggregate({
      where: { businessId },
      _avg: {
        leads: true
      }
    });

    const result = {
      totalPipelines,
      openPipelines,
      completedPipelines,
      averageLeadsPerPipeline,
      stats
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting pipeline statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as pipelinesRouter };