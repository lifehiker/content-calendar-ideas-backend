import { FastifyInstance } from 'fastify';
import { ClerkWebhookEvent } from '@clerk/fastify';

const FREE_SEARCHES_PER_DAY = 2;

interface SubscriptionStatusResponse {
  isPremium: boolean;
  searchesRemaining?: number;
  lastSearchDate?: string;
}

interface SubscriptionUpdateBody {
  subscriptionId: string;
  customerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
}

export default async function userRoutes(fastify: FastifyInstance) {
  // Get user subscription status
  fastify.get<{ Params: { userId: string } }>(
    '/users/:userId/subscription',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const { userId } = request.params;
      
      try {
        // Check if this is the current authenticated user
        if (request.user.sub !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }
        
        // Get the user document from database
        const user = await fastify.mongo.db.collection('users').findOne({ clerkId: userId });
        
        if (!user) {
          // If user doesn't exist, they're not premium and have default free searches
          return {
            isPremium: false,
            searchesRemaining: FREE_SEARCHES_PER_DAY,
            lastSearchDate: null
          };
        }
        
        // If user is premium, return premium status
        if (user.isPremium) {
          return {
            isPremium: true
          };
        }
        
        // For free users, calculate remaining searches
        let searchesRemaining = FREE_SEARCHES_PER_DAY;
        
        if (user.searchCount && user.lastSearchDate) {
          const lastSearchDate = new Date(user.lastSearchDate);
          const today = new Date();
          
          // Reset search count if it's a new day (UTC)
          if (
            lastSearchDate.getUTCFullYear() === today.getUTCFullYear() &&
            lastSearchDate.getUTCMonth() === today.getUTCMonth() &&
            lastSearchDate.getUTCDate() === today.getUTCDate()
          ) {
            searchesRemaining = Math.max(0, FREE_SEARCHES_PER_DAY - user.searchCount);
          }
        }
        
        return {
          isPremium: false,
          searchesRemaining,
          lastSearchDate: user.lastSearchDate
        } as SubscriptionStatusResponse;
      } catch (error) {
        fastify.log.error('Error getting subscription status:', error);
        return reply.code(500).send({
          error: 'Failed to get subscription status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
  
  // Update user subscription (called from frontend after checkout)
  fastify.post<{ Params: { userId: string }, Body: SubscriptionUpdateBody }>(
    '/users/:userId/subscription',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const { userId } = request.params;
      const { subscriptionId, customerId, status } = request.body;
      
      try {
        // Check if this is the current authenticated user
        if (request.user.sub !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }
        
        // Update the user's subscription info
        await fastify.mongo.db.collection('users').updateOne(
          { clerkId: userId },
          {
            $set: {
              isPremium: status === 'active',
              subscriptionId,
              customerId,
              updatedAt: new Date()
            },
            $setOnInsert: {
              clerkId: userId,
              createdAt: new Date(),
              searchCount: 0,
              lastSearchDate: null
            }
          },
          { upsert: true }
        );
        
        return { success: true };
      } catch (error) {
        fastify.log.error('Error updating subscription:', error);
        return reply.code(500).send({
          error: 'Failed to update subscription',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
  
  // Update search count for a user
  fastify.post<{ Params: { userId: string } }>(
    '/users/:userId/search',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const { userId } = request.params;
      
      try {
        // Check if this is the current authenticated user
        if (request.user.sub !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }
        
        // Get the user from the database
        const user = await fastify.mongo.db.collection('users').findOne({ clerkId: userId });
        
        // If the user is premium, no need to increment search count
        if (user?.isPremium) {
          return { success: true, isPremium: true };
        }
        
        // For free users, check if they have searches remaining
        let searchesRemaining = FREE_SEARCHES_PER_DAY;
        let searchCount = 0;
        
        if (user) {
          const today = new Date();
          const lastSearchDate = user.lastSearchDate ? new Date(user.lastSearchDate) : null;
          
          // Reset search count if it's a new day (UTC)
          if (
            lastSearchDate &&
            lastSearchDate.getUTCFullYear() === today.getUTCFullYear() &&
            lastSearchDate.getUTCMonth() === today.getUTCMonth() &&
            lastSearchDate.getUTCDate() === today.getUTCDate()
          ) {
            searchCount = user.searchCount || 0;
            searchesRemaining = Math.max(0, FREE_SEARCHES_PER_DAY - searchCount);
          }
          
          // If no searches remaining, return error
          if (searchesRemaining <= 0) {
            return reply.code(403).send({
              error: 'Search limit reached',
              searchesRemaining: 0,
              message: 'You have reached your daily search limit. Upgrade to premium for unlimited searches.'
            });
          }
        }
        
        // Increment the search count
        await fastify.mongo.db.collection('users').updateOne(
          { clerkId: userId },
          {
            $set: {
              lastSearchDate: new Date(),
              updatedAt: new Date()
            },
            $inc: { searchCount: 1 },
            $setOnInsert: {
              clerkId: userId,
              createdAt: new Date(),
              isPremium: false
            }
          },
          { upsert: true }
        );
        
        return {
          success: true,
          isPremium: false,
          searchesRemaining: searchesRemaining - 1
        };
      } catch (error) {
        fastify.log.error('Error updating search count:', error);
        return reply.code(500).send({
          error: 'Failed to update search count',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
} 