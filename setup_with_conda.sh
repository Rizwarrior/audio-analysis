#!/bin/bash

echo "Setting up Percussion Analyzer with Conda..."

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo "Conda not found. Please install Miniconda or Anaconda first."
    echo "Download from: https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi

# Create conda environment with Python 3.8.10
echo "Creating conda environment 'perc-analyzer' with Python 3.8.10..."
conda create -n perc-analyzer python=3.8.10 -y

# Activate the environment
echo "Activating conda environment..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate perc-analyzer

# Verify Python version
echo "Python version in conda environment: $(python --version)"

# Create necessary directories
mkdir -p models audio_samples output

# Install the known-good combo for Magenta onsets/frames
echo "Installing TensorFlow and Magenta dependencies..."
pip install tensorflow==2.11.1 tensorflow-estimator==2.11.0 tensorboard==2.11.2 keras==2.11.0 protobuf==3.19.6 tensorflow-probability==0.19.0 tf_slim==1.1.0 note-seq==0.0.3

# Install other requirements
echo "Installing remaining dependencies..."
pip install -r backend/requirements.txt

echo "Python dependencies installed."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
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
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "1. Activate conda environment: conda activate perc-analyzer"
echo "2. Start development: ./dev_conda.sh"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "The backend API will be available at http://localhost:8000"