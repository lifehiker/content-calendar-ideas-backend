import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export default async function stripeWebhooksRoutes(fastify: FastifyInstance) {
  // Check if MongoDB plugin is registered
  if (!fastify.mongo) {
    fastify.log.error('MongoDB plugin not registered. Skipping webhook routes that require database access.');
    return;
  }
  
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    done(null, body);
  });

  fastify.post('/stripe-webhook', {
    config: {
      rawBody: true,
    },
    handler: async (request, reply) => {
      const signature = request.headers['stripe-signature'];
      
      if (!signature) {
        return reply.code(400).send({ error: 'Missing stripe-signature header' });
      }
      
      try {
        // @ts-expect-error rawBody is added by our configuration
        const rawBody = request.rawBody || request.body;
        
        const event = stripe.webhooks.constructEvent(
          rawBody as string,
          signature as string,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
        
        fastify.log.info(`Stripe webhook event: ${event.type}`);
        
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId || session.client_reference_id;
            
            if (userId) {
              // Update user's subscription status in your database
              await fastify.mongo.db.collection('users').updateOne(
                { clerkId: userId },
                { 
                  $set: { 
                    isPremium: true,
                    subscriptionId: session.subscription as string,
                    customerId: session.customer as string,
                    updatedAt: new Date()
                  },
                  $setOnInsert: { 
                    createdAt: new Date(),
                    searchCount: 0,
                    lastSearchDate: null
                  }
                },
                { upsert: true }
              );
              
              fastify.log.info(`User ${userId} upgraded to premium`);
            }
            break;
          }
          
          case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            
            // Get customer ID from the subscription
            const customerId = subscription.customer as string;
            
            // Find the user with this customer ID
            const user = await fastify.mongo.db.collection('users').findOne({
              customerId
            });
            
            if (user) {
              // Update the subscription status based on the status from Stripe
              await fastify.mongo.db.collection('users').updateOne(
                { customerId },
                { 
                  $set: { 
                    isPremium: subscription.status === 'active',
                    updatedAt: new Date()
                  }
                }
              );
              
              fastify.log.info(`User subscription updated, status: ${subscription.status}`);
            }
            break;
          }
          
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            
            // Get customer ID from the subscription
            const customerId = subscription.customer as string;
            
            // Find and update the user with this subscription ID
            await fastify.mongo.db.collection('users').updateOne(
              { customerId },
              { 
                $set: { 
                  isPremium: false,
                  updatedAt: new Date()
                }
              }
            );
            
            fastify.log.info(`Subscription canceled for customer ${customerId}`);
            break;
          }
          
          // Handle other event types as needed
        }
        
        return reply.code(200).send({ received: true });
      } catch (err) {
        fastify.log.error('Error processing webhook:', err);
        return reply.code(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  });
} 