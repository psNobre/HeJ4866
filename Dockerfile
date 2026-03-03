# Build Stage
FROM node:22-slim AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production Stage
FROM node:22-slim

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY . .

# Create data directory for SQLite persistence
RUN mkdir -p /data
ENV DATABASE_PATH=/data/masonic_lodge.db
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "server.ts"]
