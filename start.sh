#!/bin/bash

# Start script for Content Calendar Ideas Backend

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file based on the .env.example file."
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the project if dist directory doesn't exist
if [ ! -d "dist" ]; then
  echo "Building project..."
  npm run build
fi

# Determine the environment (default to development)
ENV=${NODE_ENV:-development}

# Start the server based on the environment
if [ "$ENV" = "production" ]; then
  echo "Starting server in production mode..."
  npm start
else
  echo "Starting server in development mode..."
  npm run dev
fi 