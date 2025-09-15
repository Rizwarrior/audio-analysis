#!/bin/bash

echo "Testing Magenta CLI approach..."

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installing soundfile..."
pip install soundfile

echo "Testing drums analysis with CLI approach..."
python test_drums.py