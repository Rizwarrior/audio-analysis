#!/usr/bin/env python3
"""
Test script to verify the percussion analyzer setup.
Run this after setup.sh to check if everything is working.
"""

import sys
import os

def test_imports():
    """Test if all required packages can be imported."""
    print("Testing imports...")
    
    try:
        import tensorflow as tf
        print(f"✓ TensorFlow {tf.__version__}")
    except ImportError as e:
        print(f"✗ TensorFlow import failed: {e}")
        return False
    
    try:
        import librosa
        print(f"✓ Librosa {librosa.__version__}")
    except ImportError as e:
        print(f"✗ Librosa import failed: {e}")
        return False
    
    try:
        import note_seq
        print(f"✓ Note-seq available")
    except ImportError as e:
        print(f"✗ Note-seq import failed: {e}")
        return False
    
    try:
        from magenta.models.onsets_frames_transcription import train_util
        print(f"✓ Magenta onsets_frames_transcription available")
    except ImportError as e:
        print(f"✗ Magenta import failed: {e}")
        print("  This is expected if Magenta repo is not cloned yet")
        return False
    
    return True

def test_model_path():
    """Test if model files exist."""
    print("\nTesting model files...")
    
    model_paths = [
        "./models/train",
        "./models/train/checkpoint",
        "./models/train/model.ckpt.meta"
    ]
    
    for path in model_paths:
        if os.path.exists(path):
            print(f"✓ {path} exists")
        else:
            print(f"✗ {path} not found")
            return False
    
    return True

def test_analyzer():
    """Test the percussion analyzer."""
    print("\nTesting percussion analyzer...")
    
    try:
        from backend.percussion_analyzer import PercussionAnalyzer
        analyzer = PercussionAnalyzer()
        print("✓ PercussionAnalyzer initialized")
        return True
    except Exception as e:
        print(f"✗ PercussionAnalyzer failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Percussion Analyzer Setup Test")
    print("=" * 40)
    
    tests = [
        ("Package imports", test_imports),
        ("Model files", test_model_path),
        ("Analyzer initialization", test_analyzer)
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n{name}:")
        result = test_func()
        results.append((name, result))
    
    print("\n" + "=" * 40)
    print("Test Results:")
    
    all_passed = True
    for name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  {name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n✓ All tests passed! Setup is working correctly.")
        return 0
    else:
        print("\n✗ Some tests failed. Check the setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main())