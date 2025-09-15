#!/bin/bash

echo "Fixing Magenta dependencies..."

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installing sox dependency..."
pip install sox

echo "Testing Magenta import..."
python -c "
import sys
sys.path.insert(0, './magenta')
try:
    from magenta.models.onsets_frames_transcription import train_util
    print('✓ Magenta import successful!')
except Exception as e:
    print(f'✗ Magenta import failed: {e}')
"

echo "Testing drums analysis with fixed setup..."
python test_drums.py