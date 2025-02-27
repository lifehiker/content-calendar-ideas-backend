import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyMongodb from '@fastify/mongodb';
import { clerkPlugin } from '@clerk/fastify';
import env from './utils/env';
import { healthRoutes } from './routes/health';
import { contentRoutes } from './routes/content';
import { userRoutes } from './routes/user';
import { subscriptionRoutes } from './routes/subscription';
import { integrationRoutes } from './routes/integration';
import stripeWebhooksRoutes from './routes/stripe-webhooks';
import usersRoutes from './routes/users';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL || 'info',
      transport: env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    // Enable raw body for stripe webhook validation
    bodyLimit: 1048576, // 1MiB
  });

  // Register CORS to allow requests from the frontend
  await app.register(cors, {
    origin: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Register MongoDB plugin
  if (env.MONGODB_URI) {
    await app.register(fastifyMongodb, {
      url: env.MONGODB_URI,
      forceClose: true,
    });
    app.log.info('MongoDB plugin registered');
  } else {
    app.log.warn('MongoDB URI not configured. Database functionality will be unavailable.');
  }

  // Register Clerk for authentication
  if (env.CLERK_SECRET_KEY) {
    await app.register(clerkPlugin);
    app.decorate('authenticate', async (request, reply) => {
      try {
        // This will throw an error if the request is not authenticated
        await request.authenticate();
      } catch (error) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });
    app.log.info('Clerk authentication plugin registered');
  } else {
    app.log.warn('Clerk Secret Key not configured. Authentication will be unavailable.');
    // Add a dummy authenticate method for development
    app.decorate('authenticate', (request, reply, done) => {
      // In development, add a dummy user to the request
      request.user = { sub: 'dev-user-id' };
      done();
    });
  }

  // Register all route handlers
  await app.register(healthRoutes);
  await app.register(contentRoutes);
  await app.register(userRoutes);
  await app.register(subscriptionRoutes);
  await app.register(integrationRoutes);
  
  // Register new routes
  await app.register(stripeWebhooksRoutes, { prefix: '/webhooks' });
  await app.register(usersRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    
    const statusCode = error.statusCode || 500;
    const errorMsg = env.NODE_ENV === 'production' 
      ? 'An error occurred. Please try again later.'
      : error.message;
    
    reply.status(statusCode).send({
      status: 'error',
      message: errorMsg,
      error: env.NODE_ENV === 'development' ? error : undefined,
    });
  });

  return app;
};

export default buildApp; 