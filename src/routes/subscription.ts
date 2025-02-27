import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { verifyAuth } from '../middleware/auth';
import Stripe from 'stripe';
import { createErrorResponse } from '../utils/errors';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

// In a real implementation, you'd have Stripe set up
const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PREMIUM: 'premium',
};

export const subscriptionRoutes = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) => {
  // Get user subscription status
  fastify.get('/subscription/status', {
    preValidation: [verifyAuth],
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // In a real implementation, you'd fetch subscription status from database
      // For now, let's return placeholder data
      
      return {
        status: 'success',
        data: {
          userId,
          plan: SUBSCRIPTION_PLANS.FREE, // Default to free plan
          limitRemaining: 2, // Daily request limit
          validUntil: null, // No expiration for free plan
          features: {
            unlimitedIdeas: false,
            fullCalendar: false,
            dragAndDrop: false,
          },
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send(
        createErrorResponse(error, 'Failed to fetch subscription status')
      );
    }
  });

  // Create checkout session for premium upgrade
  fastify.post('/subscription/create-checkout', {
    preValidation: [verifyAuth],
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const successUrl = `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.FRONTEND_URL}/subscription/cancel`;
      
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Content Calendar Ideas Premium',
                description: 'Unlimited content idea generation and premium features',
              },
              unit_amount: 2000, // $20.00
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
      });
      
      return {
        status: 'success',
        data: {
          sessionId: session.id,
          url: session.url,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to create checkout session',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  });

  // Handle webhook events from Stripe
  fastify.post('/webhook/stripe', {
    schema: {
      body: {
        type: 'object',
      },
    },
  }, async (request, reply) => {
    try {
      const sig = request.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!endpointSecret) {
        return reply.status(500).send({
          status: 'error',
          message: 'Webhook secret not configured',
        });
      }
      
      let event;
      
      try {
        event = stripe.webhooks.constructEvent(
          request.body as string, 
          sig, 
          endpointSecret
        );
      } catch (err) {
        return reply.status(400).send(`Webhook Error: ${(err as Error).message}`);
      }
      
      // Handle specific events
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const userId = session.client_reference_id;
          
          // In a real implementation, you'd update the user's subscription in your database
          fastify.log.info(`Subscription created for user: ${userId}`);
          break;
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          
          // In a real implementation, you'd update the subscription status
          fastify.log.info(`Subscription ${event.type} event received:`, subscription.id);
          break;
          
        default:
          fastify.log.info(`Unhandled event type: ${event.type}`);
      }
      
      return { received: true };
      
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to process webhook',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  });
}; 