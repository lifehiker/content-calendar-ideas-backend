import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import env from './utils/env';
import { healthRoutes } from './routes/health';
import { contentRoutes } from './routes/content';
import { userRoutes } from './routes/user';
import { subscriptionRoutes } from './routes/subscription';
import { integrationRoutes } from './routes/integration';

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
  });

  // Register CORS to allow requests from the frontend
  await app.register(cors, {
    origin: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Register all route handlers
  await app.register(healthRoutes);
  await app.register(contentRoutes);
  await app.register(userRoutes);
  await app.register(subscriptionRoutes);
  await app.register(integrationRoutes);

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