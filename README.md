# Percussion Analyzer

AI-powered drum transcription app using Google's Magenta Onsets & Frames model. Upload audio files and get precise timestamps for kicks, snares, and other percussion elements.

## Features

- **Kick & Snare Detection**: Get precise timestamps for kick drums and snares
- **All Drums Mode**: Toggle to see timing for all detected percussion elements
- **Minimal UI**: Clean, dark interface focused on results
- **Multiple Formats**: Supports WAV, MP3, FLAC, and other audio formats
- **Real-time Analysis**: Fast processing using TensorFlow and Magenta

## Quick Start

You have several options depending on your Python setup:

### Option 1: Full Magenta Setup (Recommended)
**Requires Python 3.8.10 for best compatibility**

```bash
# Install Python 3.8.10 if needed
chmod +x install_python38.sh
./install_python38.sh

# Setup with full Magenta support
chmod +x setup.sh dev.sh
./setup.sh

# Test setup
source venv/bin/activate
python test_setup.py

# Start development
./dev.sh
```

### Option 2: Conda Setup (Easy Python 3.8.10)
**If you have conda/miniconda installed**

```bash
chmod +x setup_with_conda.sh dev_conda.sh
./setup_with_conda.sh
./dev_conda.sh
```

### Option 3: Modern Python (Fallback)
**Works with Python 3.9+ but librosa-only analysis**

```bash
chmod +x setup_modern.sh
./setup_modern.sh
./dev.sh
```

### Option 4: Docker (All platforms)
```bash
docker-compose up --build
```

**Open your browser** to `http://localhost:3000`

## Architecture

- **Frontend**: React + Vite with minimal aesthetic
- **Backend**: FastAPI with TensorFlow 2.11.1
- **AI Model**: Magenta Onsets & Frames Transcription
- **Deployment**: Docker containers with nginx proxy

## Requirements

**Python Version**: 3.8.10 (recommended for best compatibility)

**Model Versions** (known-good combo for Magenta onsets/frames):
- tensorflow==2.11.1
- tensorflow-estimator==2.11.0  
- tensorboard==2.11.2
- keras==2.11.0
- protobuf==3.19.6
- tensorflow-probability==0.19.0
- tf_slim==1.1.0
- note-seq==0.0.3

## Usage

1. Drag and drop an audio file or click to browse
2. Click "Analyze Percussion" 
3. View kick and snare timestamps
4. Toggle "Show all drums" for complete percussion analysis

## API Endpoints

- `POST /api/analyze` - Upload and analyze audio file
- `GET /api/health` - Health check

## Development

**Local development** (creates virtual environment):
```bash
# Linux/macOS
./setup.sh  # One-time setup
./dev.sh    # Start both servers

# Windows
setup.bat   # One-time setup
dev.bat     # Start both servers
```

**Manual setup**:
```bash
# Frontend
npm install
npm run dev

# Backend (in virtual environment)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
cd backend && python main.py
```

## Notes

- **Model Download**: First run downloads the pre-trained model (~250MB)
- **Processing**: Time depends on audio length (typically 5-30 seconds)
- **Compatibility**: Works with Python 3.8+ and modern TensorFlow versions
- **Fallback**: Automatically uses librosa if Magenta model unavailable
- **Accuracy**: Magenta model provides higher accuracy, librosa fallback still gives good results