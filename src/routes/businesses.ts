import { Router } from 'express';
import { prisma } from '@/config/database';

const router = Router();

// Get all businesses for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const businesses = await prisma.business.findMany({
      where: {
        userId: userId as string
      },
      include: {
        conversations: {
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        agents: true,
        employees: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.status(200).json(businesses);
  } catch (error) {
    console.error('Error getting businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific business
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        agents: true,
        employees: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.status(200).json(business);
  } catch (error) {
    console.error('Error getting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new business
router.post('/', async (req, res) => {
  try {
    const { userId, name, domain, description, logoUrl, theme, settings } = req.body;

    if (!userId || !name || !domain) {
      return res.status(400).json({ error: 'User ID, name, and domain are required' });
    }

    const business = await prisma.business.create({
      data: {
        userId,
        name,
        domain,
        description,
        logoUrl,
        theme,
        settings
      },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        agents: true,
        employees: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(business);
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a business
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, description, logoUrl, theme, settings } = req.body;

    const business = await prisma.business.update({
      where: { id },
      data: {
        name,
        domain,
        description,
        logoUrl,
        theme,
        settings
      },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        agents: true,
        employees: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a business
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        conversations: true,
        agents: true,
        employees: true,
        leads: {
          include: {
            pipeline: true
          }
        }
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const stats = {
      conversations: business.conversations.length,
      agents: business.agents.length,
      employees: business.employees.length,
      leads: business.leads.length,
      qualifiedLeads: business.leads.filter(lead => lead.score >= 0.7).length,
      openConversations: business.conversations.filter(conv => conv.status === 'OPEN').length,
      activeAgents: business.agents.filter(agent => agent.availability).length
    };

    res.status(200).json({
      business: {
        id: business.id,
        name: business.name,
        domain: business.domain
      },
      stats
    });
  } catch (error) {
    console.error('Error getting business statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business agents
router.get('/:id/agents', async (req, res) => {
  try {
    const { id } = req.params;

    const agents = await prisma.agent.findMany({
      where: { businessId: id },
      include: {
        handoffs: {
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
      }
    });

    res.status(200).json(agents);
  } catch (error) {
    console.error('Error getting business agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new agent
router.post('/:id/agents', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, availability = true, metadata } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const agent = await prisma.agent.create({
      data: {
        businessId: id,
        name,
        role,
        availability,
        metadata
      },
      include: {
        handoffs: {
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
      }
    });

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update agent availability
router.put('/:id/agents/:agentId/availability', async (req, res) => {
  try {
    const { id, agentId } = req.params;
    const { availability } = req.body;

    if (typeof availability !== 'boolean') {
      return res.status(400).json({ error: 'Availability must be a boolean' });
    }

    const agent = await prisma.agent.update({
      where: {
        id: agentId,
        businessId: id
      },
      data: {
        availability
      },
      include: {
        handoffs: {
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
      }
    });

    res.status(200).json(agent);
  } catch (error) {
    console.error('Error updating agent availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as businessesRouter };