import buildApp from './app';
import env from './utils/env';

// Environment validation
if (!env.PORT) {
  console.error('PORT is not defined. Using default port 3000.');
}

const startServer = async () => {
  const app = await buildApp();
  
  try {
    const port = Number(env.PORT || 3000);
    const host = env.HOST || '0.0.0.0';
    
    // Start the server
    await app.listen({ port, host });
    
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Start the server
startServer(); 