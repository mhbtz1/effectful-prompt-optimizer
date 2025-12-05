FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate
RUN apt-get update && apt-get install -y sudo
RUN sudo apt-get update && sudo apt-get install -y gcc g++ make build-essential procps

# Copy pnpm workspace configuration
COPY .npmrc pnpm-workspace.yaml ./

# Copy root package files
COPY package.json ./

# Copy all package.json files for dependency installation
COPY packages/web/package.json ./packages/web/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/agents/package.json ./packages/agents/
COPY packages/data/package.json ./packages/data/
COPY packages/optimizers/package.json ./packages/optimizers/

# Install dependencies
RUN pnpm install

# Copy all source code
COPY . .

# Build frontend static assets
RUN pnpm --filter=frontend build

# Expose both ports
EXPOSE 3000 5173

# Create start script to run both services
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Starting frontend preview server on port 5173..."' >> /app/start.sh && \
    echo 'cd /app/packages/frontend && pnpm preview --host 0.0.0.0 --port 5173 &' >> /app/start.sh && \
    echo 'FRONTEND_PID=$!' >> /app/start.sh && \
    echo 'echo "Frontend started with PID $FRONTEND_PID"' >> /app/start.sh && \
    echo 'echo "Starting backend server on port 3000..."' >> /app/start.sh && \
    echo 'cd /app/packages/web && pnpx tsx src/server.ts &' >> /app/start.sh && \
    echo 'BACKEND_PID=$!' >> /app/start.sh && \
    echo 'echo "Backend started with PID $BACKEND_PID"' >> /app/start.sh && \
    echo 'wait $FRONTEND_PID $BACKEND_PID' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start both services
CMD ["/bin/sh", "/app/start.sh"]