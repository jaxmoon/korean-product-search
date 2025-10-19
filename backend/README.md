# Product Search Backend

NestJS-based backend service for Elasticsearch product search.

## Tech Stack

- **NestJS 11.x** - Progressive Node.js framework
- **TypeScript 5.x** - Type-safe development
- **Elasticsearch 8.x** - Search and analytics engine
- **@nestjs/elasticsearch** - Elasticsearch integration
- **class-validator** - Validation decorators
- **Swagger** - API documentation

## Prerequisites

- Node.js 18+ and npm
- Elasticsearch 8.x running on localhost:9200
- Docker and Docker Compose (optional)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
```

## Environment Variables

See `.env.example` for all available configuration options.

```bash
PORT=4000
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

## Running the Application

```bash
# Development mode with watch
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at:
- API: http://localhost:4000
- Swagger Documentation: http://localhost:4000/api

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── app.controller.ts      # Health check controller
├── app.service.ts         # Health check service
├── products/              # Products module
│   ├── products.module.ts
│   ├── products.controller.ts
│   └── products.service.ts
├── elasticsearch/         # Elasticsearch module
│   ├── elasticsearch.module.ts
│   └── elasticsearch.service.ts
└── common/                # Shared code
    ├── interfaces/
    │   └── product.interface.ts
    └── dto/
        └── search-query.dto.ts
```

## Available Scripts

```bash
npm run build          # Build the project
npm run start          # Start the application
npm run start:dev      # Start in development mode
npm run start:prod     # Start in production mode
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run tests with coverage
```

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Products
- `GET /products` - Get all products
- More endpoints will be added in future issues

## Development

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Documentation

API documentation is available via Swagger UI at `/api` endpoint when the application is running.

## Next Steps

1. Implement Elasticsearch integration
2. Add product data indexing
3. Implement search functionality
4. Add filtering and pagination

## License

MIT
