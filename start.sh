#!/bin/sh
set -e

echo "Starting backend server on port 3000..."
cd /app/packages/web && pnpx tsx src/server.ts &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

echo "Starting frontend server on port 5173..."
cd /app/packages/frontend && pnpx serve -s dist -l 5173 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

# Wait for services to be ready
sleep 2

echo "Starting nginx on port 8080..."
nginx -g 'daemon off;' &
NGINX_PID=$!
echo "Nginx started with PID $NGINX_PID"

echo "All services started successfully"
echo "  - Backend API: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo "  - Nginx (public): http://localhost:8080"

# Wait for all processes
wait $BACKEND_PID $FRONTEND_PID $NGINX_PID

