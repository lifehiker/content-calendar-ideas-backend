import { FastifyRequest, FastifyReply } from 'fastify';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Define custom error type for Clerk API errors
interface ClerkError {
  status: number;
  message: string;
}

// Extend FastifyRequest to include userId
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    isPremium?: boolean;
  }
}

export const verifyAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Extract auth token from header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized: Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized: No token provided' });
    }
    
    try {
      // Verify the session token with Clerk using the new API
      const { userId } = await clerkClient.verifyToken(token);
      
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid token' });
      }
      
      // Attach user ID to request
      request.userId = userId;
      
    } catch (err) {
      // Handle Clerk API errors
      const error = err as Error;
      return reply.status(401).send({ error: 'Unauthorized: Authentication failed', message: error.message });
    }
    
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error during authentication' });
  }
};

// Middleware that checks premium subscription status
export const verifyPremium = async (request: FastifyRequest, reply: FastifyReply) => {
  // This would check the user's subscription status in your database
  // For now, we'll stub this and implement it properly later
  const userId = request.userId;
  
  if (!userId) {
    return reply.status(401).send({ error: 'Unauthorized: Authentication required' });
  }
  
  // TODO: Implement actual subscription check with Stripe
  const isPremium = false; // This would be a DB query in production
  
  if (!isPremium) {
    return reply.status(403).send({ 
      error: 'Premium subscription required',
      message: 'This feature requires a premium subscription'
    });
  }
}; 