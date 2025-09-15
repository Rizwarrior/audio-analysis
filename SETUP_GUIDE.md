# Setup Guide for Percussion Analyzer

Since you're using Python 3.13.5, here are your best options:

## Recommended: Use Conda (Easiest)

If you have conda installed:

```bash
# Make scripts executable (in WSL/Linux terminal)
chmod +x setup_with_conda.sh dev_conda.sh

# Run conda setup
./setup_with_conda.sh

# Start development
./dev_conda.sh
```

## Alternative 1: Install Python 3.8.10

```bash
# Install Python 3.8.10 (in WSL/Linux terminal)
chmod +x install_python38.sh
./install_python38.sh

# Then run normal setup
chmod +x setup.sh dev.sh
./setup.sh
./dev.sh
```

## Alternative 2: Use Modern Python (Limited Features)

This works with your current Python 3.13.5 but only uses librosa (no Magenta):

```bash
# Use modern setup (in WSL/Linux terminal)
chmod +x setup_modern.sh
./setup_modern.sh
./dev.sh
```

## Alternative 3: Docker (Easiest, Full Features)

```bash
# No Python setup needed
docker-compose up --build
```

## What's the Difference?

- **Conda/Python 3.8.10**: Full Magenta AI model (best accuracy)
- **Modern Python**: Librosa-only analysis (good accuracy, simpler)
- **Docker**: Full Magenta AI model, no local Python setup needed

## Current Issue

Your Python 3.13.5 can't install the old TensorFlow versions (2.11.1) that Magenta requires. The solutions above work around this limitation.

## Quick Test

After any setup, test with:
```bash
# Activate your environment first, then:
python test_setup.py
```