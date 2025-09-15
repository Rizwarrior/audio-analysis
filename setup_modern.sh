#!/bin/bash

echo "Setting up Percussion Analyzer with Modern Python/TensorFlow..."
echo "Note: This uses newer TensorFlow versions and librosa-only analysis"
echo "For full Magenta support, use Python 3.8.10 with setup.sh"

# Create necessary directories
mkdir -p models audio_samples output

# Setup Python virtual environment
echo "Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix/Linux/macOS
    source venv/bin/activate
fi

# Verify Python version in venv
echo "Python version in virtual environment: $(python --version)"

pip install --upgrade pip

# Install modern TensorFlow and dependencies
echo "Installing modern TensorFlow and dependencies..."
pip install -r backend/requirements_modern.txt

echo "Python dependencies installed."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo ""
echo "Setup complete!"
echo ""
echo "Note: This setup uses librosa-only analysis (no Magenta model)"
echo "For better accuracy, consider using Python 3.8.10 with the full Magenta setup"
echo ""
echo "To start the application:"
echo "1. For local development: ./dev.sh"
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "The backend API will be available at http://localhost:8000"