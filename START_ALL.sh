#!/bin/bash

# ============================================
#   Pet Matchmaking Website - Startup Script
# ============================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     Pet Matchmaking - Complete Startup Script          ║"
echo "║   (Backend + Frontend + AI Service)                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "⏳ Installing root dependencies..."
    npm install
    echo ""
fi

# Check if server node_modules exist
if [ ! -d "server/node_modules" ]; then
    echo "⏳ Installing server dependencies..."
    cd server
    npm install
    cd ..
    echo ""
fi

# Setup AI Service Python venv
if [ ! -d "ai-service/.venv" ]; then
    echo "⏳ Setting up AI service virtual environment..."
    cd ai-service
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo ""
fi

echo "🚀 Starting Backend Server..."
echo "🚀 Starting Frontend Development Server..."
echo "🚀 Starting AI Matching Service..."
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ Backend will run on:  http://localhost:5000"
echo "✅ Frontend will run on: http://localhost:5173"
echo "✅ AI Service will run on: http://localhost:8001"
echo ""
echo "🌐 Open http://localhost:5173 in your browser"
echo "📍 Features Showcase: http://localhost:5173/showcase"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Start Backend in background
(cd server && npm start) &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start AI Service in background
(cd ai-service && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8001) &
AI_PID=$!

# Wait a bit for AI service to start
sleep 2

# Start Frontend in foreground (so Ctrl+C stops everything)
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID $AI_PID" EXIT
# Kill backend when frontend is stopped
kill $BACKEND_PID 2>/dev/null
