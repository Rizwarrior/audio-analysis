#!/bin/bash

echo "Cleaning up running processes..."

# Kill any running Node.js processes
echo "Stopping Node.js processes..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "node" 2>/dev/null

# Kill any running Python processes from our app
echo "Stopping Python backend processes..."
pkill -f "python main.py" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null

# Wait a moment for processes to terminate
sleep 2

# Check what's using the ports
echo "Checking port usage..."
echo "Port 3000:"
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || echo "Port 3000 is free"

echo "Port 3001:"
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || echo "Port 3001 is free"

echo "Port 3002:"
lsof -ti:3002 2>/dev/null | xargs kill -9 2>/dev/null || echo "Port 3002 is free"

echo "Port 3003:"
lsof -ti:3003 2>/dev/null | xargs kill -9 2>/dev/null || echo "Port 3003 is free"

echo "Port 8000:"
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null || echo "Port 8000 is free"

echo "Cleanup complete!"