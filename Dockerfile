FROM node:20-slim

WORKDIR /app

# Install pnpm and nginx
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate
RUN apt-get update && apt-get install -y sudo nginx
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

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# Copy and set up start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]