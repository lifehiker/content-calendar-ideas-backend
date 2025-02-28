import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { contentRoutes } from './routes/content';
import { userRoutes } from './routes/user';
import { subscriptionRoutes } from './routes/subscription';
import { contenterpRoutes } from './routes/contenterp';
import { healthRoutes } from './routes/health';
import { debugRoutes } from './routes/debug';

// Server setup
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Get CORS origins from environment
const CORS_ORIGINS = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['https://contentcalendarideas.com', 'https://content-calendar-ideas-frontend-8jfz4.ondigitalocean.app'];

const startServer = async () => {
  const server = Fastify({
    logger: true,
  });
  
  // Add a simple ping endpoint that will work even if dependencies fail
  server.get('/ping', async (request, reply) => {
    return { status: 'pong', timestamp: new Date().toISOString() };
  });

  try {
    // Register CORS to allow requests from frontend
    await server.register(cors, {
      origin: CORS_ORIGINS,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Add a root route that redirects to the API health endpoint
    server.get('/', async (request, reply) => {
      return {
        status: 'ok',
        message: 'Content Calendar Ideas API is running',
        endpoints: {
          health: '/api/health',
          status: '/api/status',
          content: '/api/content',
          user: '/api/user',
          subscription: '/api/subscription'
        },
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
    });

    // Add a health route at the root level as well
    server.get('/health', async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        service: 'content-calendar-ideas-api',
        uptime: process.uptime(),
      };
    });

    // Register routes
    server.register(healthRoutes, { prefix: '/api' });
    server.register(contentRoutes, { prefix: '/api' });
    server.register(userRoutes, { prefix: '/api' });
    server.register(subscriptionRoutes, { prefix: '/api' });
    server.register(contenterpRoutes, { prefix: '/api' });
    server.register(debugRoutes, { prefix: '/api' });

    // Error handler
    server.setErrorHandler((error, request, reply) => {
      server.log.error(error);
      reply.status(500).send({
        status: 'error',
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    });

    // Start the server
    await server.listen({ port: Number(PORT), host: HOST });
    console.log(`Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer(); 