import { FastifyRequest, FastifyReply } from 'fastify';

// Extend FastifyRequest to include userId
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    isPremium?: boolean;
  }
}

// Simple mock function for testing
const mockVerifyToken = async (token: string): Promise<{ userId: string }> => {
  return { userId: 'mock-user-123' };
};

export const verifyAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Extract auth token from header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid token' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return reply.status(401).send({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }
    
    try {
      // For demo purposes, use a mock function
      const { userId } = await mockVerifyToken(token);
      
      // Attach user ID to request
      request.userId = userId;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(401).send({ 
        error: 'Unauthorized', 
        message: `Authentication failed: ${errorMessage}` 
      });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auth error:', errorMessage);
    return reply.status(500).send({ 
      error: 'Internal Server Error', 
      message: 'Error during authentication' 
    });
  }
};

export const verifyPremium = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.userId;
  
  if (!userId) {
    return reply.status(401).send({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    });
  }
  
  // For demo purposes, always consider user as premium
  request.isPremium = true;
}; 