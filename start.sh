#!/bin/bash

echo "🎵 Percussion Analyzer + Demucs Integration"
echo "=========================================="
echo ""

# Check if setup has been run
if [ ! -d "venv" ]; then
    echo "🔧 First time setup required..."
    echo "Running setup.sh..."
    echo ""
    ./setup.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Setup failed. Please check the errors above."
        exit 1
    fi
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start the application
echo "🚀 Starting the integrated application..."
./dev.sh