import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { generateContentIdeas } from '../services/llm';
import { verifyAuth, verifyPremium } from '../middleware/auth';

export const contentRoutes = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) => {
  // Schema for content generation request
  const generateContentSchema = {
    body: {
      type: 'object',
      required: ['keywords'],
      properties: {
        keywords: { type: 'string' },
        days: { type: 'number', default: 30 },
        style: { type: 'string', enum: ['casual', 'professional'], default: 'casual' },
      },
    },
  };

  // Public endpoint for free users (limited to 2 requests per day)
  fastify.post('/generate-ideas', {
    schema: generateContentSchema,
  }, async (request, reply) => {
    try {
      const { keywords, days, style } = request.body;
      
      // In a real implementation, you'd check rate limits here
      // For free users, limit to 2 requests per day
      
      // Generate content ideas
      const contentIdeas = await generateContentIdeas({
        keywords,
        days: Math.min(days, 30), // Limit to 30 days for free users
        style,
        premium: false,
      });
      
      return {
        status: 'success',
        data: contentIdeas,
        limits: {
          isPremium: false,
          daily: 2,
          remaining: 1, // This would be dynamically calculated
          resetAt: '2023-12-31T23:59:59Z', // This would be calculated
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to generate content ideas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Premium endpoint with no limitations
  fastify.post('/premium/generate-ideas', {
    schema: generateContentSchema,
    preValidation: [verifyAuth, verifyPremium], // Check auth and subscription
  }, async (request, reply) => {
    try {
      const { keywords, days, style } = request.body;
      
      // Generate premium content ideas
      const contentIdeas = await generateContentIdeas({
        keywords,
        days: Math.min(days, 90), // Allow up to 90 days for premium
        style,
        premium: true, // Premium quality
      });
      
      return {
        status: 'success',
        data: contentIdeas,
        limits: {
          isPremium: true,
          unlimited: true,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to generate premium content ideas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
}; 