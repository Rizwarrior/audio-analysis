#!/bin/bash

echo "Starting development servers with Conda..."

# Check if conda environment exists
if ! conda env list | grep -q "perc-analyzer"; then
    echo "Conda environment 'perc-analyzer' not found. Please run ./setup_with_conda.sh first."
    exit 1
fi

# Activate conda environment
echo "Activating conda environment..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate perc-analyzer

# Verify we're in the right environment
echo "Using Python: $(which python)"
echo "Python version: $(python --version)"

# Start backend in background
echo "Starting backend server..."
cd backend
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Development servers started:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    conda deactivate 2>/dev/null
    exit 0
}

# Wait for user to stop
trap cleanup INT
wait