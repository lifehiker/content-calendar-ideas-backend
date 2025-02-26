# Content Calendar Ideas - Backend API

This repository contains the backend API for the Content Calendar Ideas application, built with Node.js, Fastify, and TypeScript.

## Features

- **Content Generation**: AI-powered content idea generation using DeepSeek and Anthropic APIs
- **User Management**: User settings and preferences storage
- **Calendar Storage**: Save and retrieve calendar entries
- **Subscription Management**: Premium subscriptions via Stripe
- **ContentERP Integration**: Export content ideas to ContentERP

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Clerk account (for authentication)
- Stripe account (for payment processing)
- DeepSeek and Anthropic API keys

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/content-calendar-ideas-backend.git
cd content-calendar-ideas-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
```

4. Update the `.env` file with your credentials

### Development

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001` by default.

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### Authentication
- Authentication is handled via Clerk middleware

### Content Generation
- `POST /generate-ideas` - Generate content ideas (public, limited)
- `POST /premium/generate-ideas` - Generate content ideas (premium)

### User Management
- `GET /user/settings` - Get user settings
- `PUT /user/settings` - Update user settings
- `GET /user/calendar` - Get user's calendar entries
- `POST /user/calendar` - Save calendar entries

### Subscription Management
- `GET /subscription/status` - Check subscription status
- `POST /subscription/create-checkout` - Create Stripe checkout session

### ContentERP Integration
- `POST /integration/connect-erp` - Connect to ContentERP
- `POST /integration/export-to-erp` - Export content to ContentERP
- `GET /integration/status` - Check integration status

## Project Structure

```
src/
├── middleware/   # Authentication and validation middleware
├── routes/       # API route handlers
├── services/     # Business logic services
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
├── app.ts        # Express application setup
└── server.ts     # Entry point
```

## Error Handling

The API implements a consistent error response format:

```json
{
  "status": "error",
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Environment Variables

See `.env.example` for required environment variables.

## License

[MIT License](LICENSE) 