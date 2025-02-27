import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define environment variable schema with validation
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).optional(),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // CORS configuration
  CORS_ORIGINS: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  
  // Database
  MONGODB_URI: z.string().optional(),
  
  // Authentication
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  
  // Payment processing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // AI services
  DEEPSEEK_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // ContentERP integration
  CONTENT_ERP_API_URL: z.string().optional(),
});

// Parse and validate environment variables
// In development, missing variables will be replaced with defaults when possible
// In production, validation is strict and will throw errors for missing required variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', 
      error instanceof Error ? (error as any).format?.() || error.message : 'Unknown error');
    
    // Only exit in production, allow defaults in development
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Missing required environment variables in production mode');
      process.exit(1);
    }
    
    // In development, continue with defaults
    console.warn('⚠️ Using default values for missing environment variables');
    return envSchema.parse({
      ...process.env,
      NODE_ENV: 'development',
    });
  }
};

// Export validated environment variables
const env = parseEnv();

export default env; 