import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export const healthRoutes = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) => {
  // Root endpoint for basic connectivity check
  fastify.get('/', async (request, reply) => {
    return {
      status: 'ok',
      message: 'Content Calendar Ideas API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  });

  // Simple health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      service: 'content-calendar-ideas-api',
      uptime: process.uptime(),
    };
  });

  // Detailed system status for debugging
  fastify.get('/status', async (request, reply) => {
    const environmentVariables = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'Set ✓' : 'Not set ✗',
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? 'Set ✓' : 'Not set ✗',
      CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? 'Set ✓' : 'Not set ✗',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set ✓' : 'Not set ✗',
      CONTENTERP_API_KEY: process.env.CONTENTERP_API_KEY ? 'Set ✓' : 'Not set ✗',
      FRONTEND_URL: process.env.FRONTEND_URL,
    };

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'content-calendar-ideas-api',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: environmentVariables,
    };
  });
}; 