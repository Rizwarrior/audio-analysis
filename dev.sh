#!/bin/bash

echo "🚀 Starting Integrated Percussion Analyzer + Demucs development servers..."

# Check if virtual environment exists
if [ ! -d "backend/venv_combined" ]; then
    echo "Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source backend/venv_combined/Scripts/activate
else
    # Unix/Linux/macOS
    source backend/venv_combined/bin/activate
fi

# Quick dependency check
echo "🔍 Checking dependencies..."
cd backend
python test_dependencies.py --quick 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️ Some dependencies may have issues. Run ./setup.sh if you encounter problems."
fi
cd ..

# Start backend in background
echo "🔧 Starting backend server (FastAPI + Demucs + Magenta)..."
cd backend
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend server (React + Audio Player)..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Development servers started successfully!"
echo ""
echo "🌐 Frontend (React App): http://localhost:3000"
echo "📡 Backend (API): http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🎵 Integrated Features Available:"
echo "   • Upload audio → Demucs separation → Drum analysis"
echo "   • Interactive stem player with volume controls"
echo "   • Download individual stems + analysis data"
echo ""
echo "💡 Tip: Start with a short music file (30-60s) for faster testing!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    deactivate 2>/dev/null
    exit 0
}

# Wait for user to stop
trap cleanup INT
wait