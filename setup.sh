#!/bin/bash

echo "🎵 Setting up Integrated Percussion Analyzer + Demucs Source Separation..."
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oP '\d+\.\d+\.\d+')
REQUIRED_VERSION="3.8.10"

echo "🐍 Detected Python version: $PYTHON_VERSION"

# Check if we have Python 3.8.x available
if command -v python3.8 &> /dev/null; then
    PYTHON_CMD="python3.8"
    echo "✅ Using python3.8"
elif [[ "$PYTHON_VERSION" == 3.8.* ]]; then
    PYTHON_CMD="python3"
    echo "✅ Using python3 (version 3.8.x detected)"
else
    echo "⚠️ Warning: Python 3.8.x not found. Current version: $PYTHON_VERSION"
    echo "   The specified TensorFlow versions work best with Python 3.8.10"
    echo "   Continuing with current Python version..."
    PYTHON_CMD="python3"
fi

# Create necessary directories
mkdir -p models audio_samples output

# Navigate to backend directory
cd backend

# Setup Python virtual environment with specific Python version
echo "Creating Python virtual environment with $PYTHON_CMD..."
if [ ! -d "venv_combined" ]; then
    $PYTHON_CMD -m venv venv_combined
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv_combined/Scripts/activate
else
    # Unix/Linux/macOS
    source venv_combined/bin/activate
fi

# Verify Python version in venv
echo "Python version in virtual environment: $(python --version)"

pip install --upgrade pip

# Install the known-good combo for Magenta onsets/frames
echo "Installing TensorFlow and Magenta dependencies..."
pip install tensorflow==2.11.1 tensorflow-estimator==2.11.0 tensorboard==2.11.2 keras==2.11.0 protobuf==3.19.6 tensorflow-probability==0.19.0 tf_slim==1.1.0 note-seq==0.0.3

# Install FastAPI and web server dependencies
echo "📦 Installing web server dependencies..."
pip install fastapi==0.104.1 uvicorn==0.24.0 python-multipart==0.0.6

# Install other requirements (skip TensorFlow conflicts)
echo "📦 Installing remaining dependencies..."
pip install -r requirements.txt --no-deps || echo "⚠️ Some requirements may have conflicts, continuing..."

echo "🎛️ Installing PyTorch and Demucs for source separation..."
pip install torch torchaudio
pip install demucs

echo "🔧 Installing audio backend dependencies..."
# Install additional audio backends for TorchAudio compatibility
pip install soundfile librosa==0.9.2 pyparsing

echo "📊 Installing visualization dependencies..."
# Install matplotlib dependencies that are missing
pip install cycler fonttools kiwisolver

echo "🧪 Testing dependency compatibility..."
python test_dependencies.py

if [ $? -eq 0 ]; then
    echo "✅ All dependencies installed and compatible!"
else
    echo "⚠️ Some dependency issues detected. Check the output above."
    echo "   If you're using conda, you might need to install PyTorch separately:"
    echo "   conda install pytorch torchaudio -c pytorch"
    echo "   The application may still work, but consider using a fresh virtual environment if issues persist."
fi

echo "📦 Python dependencies installed."

# Return to project root
cd ..

# Install Node.js dependencies
echo "🌐 Installing Node.js dependencies (including lucide-react for icons)..."
npm install

# Download pre-trained model if it doesn't exist
if [ ! -d "models/train" ]; then
    echo "Downloading pre-trained Magenta model..."
    cd models
    wget https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/maestro_checkpoint.zip
    unzip maestro_checkpoint.zip
    rm maestro_checkpoint.zip
    cd ..
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 New Integrated Features:"
echo "   • 🎛️ Demucs source separation (vocals, drums, bass, other)"
echo "   • 🎵 Interactive stem player with volume controls"
echo "   • 🥁 Automatic drum analysis on separated drums track"
echo "   • 📊 Enhanced BPM detection using Librosa"
echo "   • 📥 Download individual stems + JSON exports"
echo ""
echo "🏃‍♂️ To start the application:"
echo "   1. 🐳 Docker: docker-compose up --build"
echo "   2. 💻 Local development: ./dev.sh"
echo "   3. 🌐 Open http://localhost:3000 in your browser"
echo ""
echo "📡 The backend API will be available at http://localhost:8000"
echo ""
echo "🧪 Test with a short music file (30-60 seconds) for faster processing!"
echo "   The workflow: Upload → Demucs Separation → Drum Analysis → Results"