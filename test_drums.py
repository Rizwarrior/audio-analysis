#!/usr/bin/env python3
"""
Test script to analyze drums.wav directly from command line.
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, '.')

print("Testing drums.wav analysis...")

# Check if drums.wav exists
if not os.path.exists('drums.wav'):
    print("✗ drums.wav not found in current directory")
    sys.exit(1)

print("✓ drums.wav found")

# Import the analyzer
try:
    from backend.percussion_analyzer import PercussionAnalyzer
    print("✓ PercussionAnalyzer imported")
except Exception as e:
    print(f"✗ Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Create analyzer instance
print("\nInitializing analyzer...")
try:
    analyzer = PercussionAnalyzer()
    print("✓ Analyzer created")
except Exception as e:
    print(f"✗ Analyzer creation error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Analyze the file
print("\nAnalyzing drums.wav...")
try:
    results = analyzer.analyze('drums.wav')
    print("✓ Analysis complete")
    
    print(f"\nResults:")
    print(f"Kicks: {len(results['kicks'])}")
    print(f"Snares: {len(results['snares'])}")
    print(f"All drums: {len(results['all_drums'])}")
    
    if results['kicks']:
        print(f"First few kicks: {results['kicks'][:5]}")
    
    if results['snares']:
        print(f"First few snares: {results['snares'][:5]}")
    
    if results['all_drums']:
        print(f"First few drums: {results['all_drums'][:3]}")
    
    if 'error' in results:
        print(f"Error in results: {results['error']}")
        
except Exception as e:
    print(f"✗ Analysis error: {e}")
    import traceback
    traceback.print_exc()

print("\nTest complete!")