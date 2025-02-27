import { FastifyInstance } from 'fastify';
import { verifyAuth } from '../middleware/auth';

// ContentERP integration routes for handling content pushing and API integration
export const contenterpRoutes = async (fastify: FastifyInstance) => {
  // Route for pushing content to ContentERP
  fastify.post('/contenterp/push', {
    preHandler: [verifyAuth],
    handler: async (request, reply) => {
      try {
        // This is a placeholder - actual ContentERP integration to be implemented
        return {
          success: true,
          message: 'Content successfully pushed to ContentERP',
          data: {
            items: 0,
            destination: 'ContentERP'
          }
        };
      } catch (error) {
        console.error('Error pushing content to ContentERP:', error);
        
        // Provide appropriate error messages based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        
        return reply
          .code(500)
          .send({
            success: false,
            message: isProduction
              ? 'An error occurred while pushing content to ContentERP'
              : `Error: ${error}`
          });
      }
    }
  });

  // Route for checking ContentERP connection status
  fastify.get('/contenterp/status', {
    preHandler: [verifyAuth],
    handler: async (request, reply) => {
      try {
        // This is a placeholder - actual connection check to be implemented
        return {
          success: true,
          connected: true,
          message: 'ContentERP connection is active'
        };
      } catch (error) {
        console.error('Error checking ContentERP connection:', error);
        
        // Provide appropriate error messages based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        
        return reply
          .code(500)
          .send({
            success: false,
            connected: false,
            message: isProduction
              ? 'An error occurred while checking ContentERP connection'
              : `Error: ${error}`
          });
      }
    }
  });
}; 