#!/bin/bash

echo "Fixing NumPy/librosa compatibility issue..."

# Stop any running servers
pkill -f "python main.py" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Uninstalling problematic packages..."
pip uninstall -y numpy librosa scipy

echo "Installing compatible versions..."
pip install numpy==1.24.3
pip install numba==0.58.1
pip install scipy==1.10.1
pip install librosa==0.9.2

echo "Verifying installation..."
python -c "import numpy; print(f'NumPy: {numpy.__version__}')"
python -c "import librosa; print(f'Librosa: {librosa.__version__}')"
python -c "import scipy; print(f'SciPy: {scipy.__version__}')"

echo ""
echo "Fix complete! Now run:"
echo "./dev.sh"