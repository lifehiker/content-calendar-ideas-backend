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

// Server setup
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://contentcalendarideas.com';

const startServer = async () => {
  const server = Fastify({
    logger: true,
  });

  // Register CORS to allow requests from frontend
  await server.register(cors, {
    origin: [FRONTEND_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Register routes
  server.register(healthRoutes, { prefix: '/api' });
  server.register(contentRoutes, { prefix: '/api' });
  server.register(userRoutes, { prefix: '/api' });
  server.register(subscriptionRoutes, { prefix: '/api' });
  server.register(contenterpRoutes, { prefix: '/api' });

  // Error handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    reply.status(500).send({
      status: 'error',
      message: 'An unexpected error occurred',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  });

  try {
    await server.listen({ port: Number(PORT), host: HOST });
    console.log(`Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

startServer(); 