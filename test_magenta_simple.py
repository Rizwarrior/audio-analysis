#!/usr/bin/env python3
"""
Simple test to debug the Magenta CLI issue.
"""

import os
import sys
import subprocess
import tempfile

print("Testing Magenta CLI directly...")

# Check current working directory
print(f"Current working directory: {os.getcwd()}")

# Check Python executable
print(f"Python executable: {sys.executable}")

# Check if we can import magenta
try:
    sys.path.insert(0, '../magenta')
    from magenta.models.onsets_frames_transcription import train_util
    print("✓ Magenta import successful")
except Exception as e:
    print(f"✗ Magenta import failed: {e}")

# Test the CLI command directly
print("\nTesting CLI command...")

# Create a simple test command
cmd = [
    sys.executable, '-c', 
    '''
import sys
sys.path.insert(0, "magenta")
try:
    from magenta.models.onsets_frames_transcription import train_util
    print("CLI import successful")
except Exception as e:
    print(f"CLI import failed: {e}")
    '''
]

try:
    # Run from parent directory
    parent_dir = os.path.dirname(os.getcwd())
    print(f"Running from: {parent_dir}")
    
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=parent_dir)
    print(f"Return code: {result.returncode}")
    print(f"Stdout: {result.stdout}")
    print(f"Stderr: {result.stderr}")
    
except Exception as e:
    print(f"Command failed: {e}")

print("Test complete!")