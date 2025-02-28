import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export const debugRoutes = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) => {
  // Simple endpoint that will always respond
  fastify.get('/debug/ping', async (request, reply) => {
    return {
      status: 'pong',
      timestamp: new Date().toISOString(),
      route: request.url,
      requestInfo: {
        method: request.method,
        url: request.url,
        hostname: request.hostname,
        headers: request.headers
      }
    };
  });

  // Environment info without sensitive values
  fastify.get('/debug/env', async (request, reply) => {
    return {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      CORS_ORIGINS: process.env.CORS_ORIGINS,
      has_mongodb: !!process.env.MONGODB_URI,
      has_clerk: !!process.env.CLERK_SECRET_KEY,
      has_stripe: !!process.env.STRIPE_SECRET_KEY,
      has_deepseek: !!process.env.DEEPSEEK_API_KEY,
      has_claude: !!process.env.CLAUDE_API_KEY,
      has_contenterp: !!process.env.CONTENTERP_API_KEY,
      os: {
        platform: process.platform,
        version: process.version,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  });

  // System diagnostics
  fastify.get('/debug/diag', async (request, reply) => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        ppid: process.ppid,
        title: process.title,
        argv: process.argv,
        execPath: process.execPath,
        cwd: process.cwd(),
        env_vars_count: Object.keys(process.env).length
      },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      resourceUsage: process.resourceUsage()
    };

    return diagnostics;
  });
}; 