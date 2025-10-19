.PHONY: help up down logs clean restart es-status es-reindex backend-install backend-dev seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services (Elasticsearch + Kibana)
	@echo "🚀 Starting Elasticsearch and Kibana..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "📊 Elasticsearch: http://localhost:9200"
	@echo "📈 Kibana: http://localhost:5601"

down: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker-compose down
	@echo "✅ Services stopped!"

logs: ## Show logs from all services
	docker-compose logs -f

logs-es: ## Show Elasticsearch logs only
	docker-compose logs -f elasticsearch

logs-kibana: ## Show Kibana logs only
	docker-compose logs -f kibana

restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	docker-compose restart
	@echo "✅ Services restarted!"

restart-es: ## Restart Elasticsearch only
	@echo "🔄 Restarting Elasticsearch..."
	docker-compose restart elasticsearch
	@echo "✅ Elasticsearch restarted!"

clean: ## Remove all containers, volumes, and data
	@echo "🗑️  Cleaning up all data..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

es-status: ## Check Elasticsearch cluster health
	@echo "🔍 Checking Elasticsearch status..."
	@curl -s http://localhost:9200/_cluster/health?pretty || echo "❌ Elasticsearch is not running"

es-indices: ## List all Elasticsearch indices
	@echo "📋 Listing all indices..."
	@curl -s http://localhost:9200/_cat/indices?v

es-reindex: ## Delete and recreate products index
	@echo "🔄 Recreating products index..."
	@curl -X DELETE http://localhost:9200/products 2>/dev/null || true
	@echo "\n✅ Index deleted (if existed)"

backend-install: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ Dependencies installed!"

backend-dev: ## Start backend in development mode
	@echo "🚀 Starting backend server..."
	cd backend && npm run start:dev

backend-build: ## Build backend for production
	@echo "🏗️  Building backend..."
	cd backend && npm run build
	@echo "✅ Build complete!"

backend-prod: ## Start backend in production mode
	cd backend && npm run start:prod

seed: ## Generate 1000 sample products
	@echo "🌱 Seeding database with sample data..."
	curl -X POST http://localhost:3000/products/seed
	@echo "\n✅ Sample data created!"

test: ## Run backend tests
	cd backend && npm run test

test-e2e: ## Run E2E tests
	cd backend && npm run test:e2e

# Development workflow shortcuts
dev-setup: up backend-install ## Complete development setup
	@echo "✅ Development environment ready!"
	@echo "Next steps:"
	@echo "  1. Wait for Elasticsearch to be ready (make es-status)"
	@echo "  2. Start backend (make backend-dev)"
	@echo "  3. Seed data (make seed)"

dev-reset: clean up ## Reset entire development environment
	@echo "✅ Environment reset complete!"

# Quick check
check: es-status ## Quick health check
	@echo "\n🔍 Checking backend..."
	@curl -s http://localhost:3000/health || echo "❌ Backend is not running"
