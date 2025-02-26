import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { verifyAuth } from '../middleware/auth';
import axios from 'axios';

// ContentERP API client
const contentErpApi = axios.create({
  baseURL: process.env.CONTENT_ERP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const integrationRoutes = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) => {
  // Connect to ContentERP
  fastify.post('/integration/connect-erp', {
    preValidation: [verifyAuth],
    schema: {
      body: {
        type: 'object',
        required: ['apiKey'],
        properties: {
          apiKey: { type: 'string' },
          instanceUrl: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { apiKey, instanceUrl } = request.body as {
        apiKey: string;
        instanceUrl?: string;
      };
      
      // Verify the API key with ContentERP
      // In a real implementation, you would make a request to ContentERP to validate
      
      // For now, simulate validation
      const isValid = apiKey.length > 10;
      
      if (!isValid) {
        return reply.status(400).send({
          status: 'error',
          message: 'Invalid ContentERP API key',
        });
      }
      
      // Store the API key securely in your database, associated with the user
      // This is a placeholder for the actual implementation
      
      return {
        status: 'success',
        message: 'Successfully connected to ContentERP',
        data: {
          connected: true,
          connectedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to connect to ContentERP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Export content ideas to ContentERP
  fastify.post('/integration/export-to-erp', {
    preValidation: [verifyAuth],
    schema: {
      body: {
        type: 'object',
        required: ['entries'],
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title', 'date'],
              properties: {
                title: { type: 'string' },
                date: { type: 'string', format: 'date-time' },
                description: { type: 'string' },
                keywords: { 
                  type: 'array',
                  items: { type: 'string' }
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { entries } = request.body as {
        entries: Array<{
          title: string;
          date: string;
          description?: string;
          keywords?: string[];
        }>;
      };
      
      // In a real implementation, you would:
      // 1. Get the user's ContentERP API key from your database
      // 2. Make a request to ContentERP to export the entries
      
      // For now, return a success response
      return {
        status: 'success',
        message: `Successfully exported ${entries.length} entries to ContentERP`,
        data: {
          exportedCount: entries.length,
          exportedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to export to ContentERP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Check ContentERP connection status
  fastify.get('/integration/status', {
    preValidation: [verifyAuth],
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // In a real implementation, you would:
      // 1. Check if the user has a ContentERP API key stored
      // 2. Possibly verify that the key is still valid
      
      // For now, return placeholder data
      return {
        status: 'success',
        data: {
          connected: false,
          lastSync: null,
          exportsCount: 0,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to check ContentERP integration status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
}; 