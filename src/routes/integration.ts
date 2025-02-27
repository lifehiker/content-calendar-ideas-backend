import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { verifyAuth } from '../middleware/auth';
import axios from 'axios';
import { createErrorResponse } from '../utils/errors';

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
        required: ['apiKey', 'domain'],
        properties: {
          apiKey: { type: 'string' },
          domain: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // This is a placeholder - actual integration logic would go here
      // For now, just return a success message
      
      return {
        status: 'success',
        message: 'Successfully connected to ContentERP',
        data: {
          connected: true,
          accountInfo: {
            name: 'Demo Account',
            plan: 'Professional',
            status: 'Active',
          },
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(
        createErrorResponse(error, 'Failed to connect to ContentERP')
      );
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