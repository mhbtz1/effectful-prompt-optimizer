#!/bin/sh
set -e

echo "Starting frontend preview server on port 5173..."
cd /app/packages/frontend && pnpx serve -s dist -l 5173 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

echo "Starting backend server on port 3000..."
cd /app/packages/web && pnpx tsx src/server.ts &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

wait $FRONTEND_PID $BACKEND_PID
