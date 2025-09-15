#!/usr/bin/env python3
"""
Test the fixed Magenta CLI wrapper.
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, '.')

print("Testing fixed Magenta CLI wrapper...")

# Test the wrapper directly
try:
    from backend.magenta_wrapper import analyze_with_magenta_cli
    
    print("Testing Magenta CLI wrapper directly...")
    results = analyze_with_magenta_cli('drums.wav', './models/train')
    
    if results:
        print("✓ Magenta CLI analysis successful!")
        print(f"Kicks: {len(results['kicks'])}")
        print(f"Snares: {len(results['snares'])}")
        print(f"All drums: {len(results['all_drums'])}")
        
        if results['kicks']:
            print(f"First few kicks: {results['kicks'][:5]}")
        
        if results['snares']:
            print(f"First few snares: {results['snares'][:5]}")
    else:
        print("✗ Magenta CLI analysis failed")
        
except Exception as e:
    print(f"✗ Wrapper test error: {e}")
    import traceback
    traceback.print_exc()

print("\nTest complete!")