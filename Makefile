.PHONY: install dev build up down restart lint

install:
	npm install

## Run UI in Docker with Vite HMR (source files mounted, no rebuild needed).
dev:
	docker compose -f docker-compose.dev.yml up -d --build

build:
	npm run build

up:
	docker compose up --build -d

down:
	docker compose down

## Restart dev containers (Vite HMR — no image rebuild needed).
restart:
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.dev.yml up -d --build

## Auto-fix imports/style; report any remaining logic errors.
lint:
	npm run lint:fix && npm run format
