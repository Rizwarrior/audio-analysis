#!/bin/bash

echo "Downloading correct drum transcription model..."

# Create models directory if it doesn't exist
mkdir -p models

# Remove old maestro model
if [ -d "models/train" ]; then
    echo "Removing old maestro model..."
    rm -rf models/train
fi

# Download the e-gmd checkpoint for drums
cd models
echo "Downloading e-gmd checkpoint for drum transcription..."
wget https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/e-gmd_checkpoint.zip

echo "Extracting checkpoint..."
unzip e-gmd_checkpoint.zip

echo "Cleaning up..."
rm e-gmd_checkpoint.zip

# List the contents to see the structure
echo "Model contents:"
ls -la

cd ..
echo "Drum model download complete!"