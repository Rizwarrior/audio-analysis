#!/usr/bin/env python3
"""
Test script to check Magenta availability and model loading.
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, '.')

print("Testing Magenta setup...")
print(f"Python path: {sys.path[:3]}...")  # Show first 3 entries

# Test 1: Basic imports
print("\n1. Testing basic imports...")
try:
    import tensorflow.compat.v1 as tf
    tf.disable_v2_behavior()
    print(f"✓ TensorFlow {tf.__version__}")
except Exception as e:
    print(f"✗ TensorFlow error: {e}")
    sys.exit(1)

# Test 2: Magenta imports
print("\n2. Testing Magenta imports...")
try:
    # Check if we need to clone Magenta
    if not os.path.exists('magenta'):
        print("Cloning Magenta repository...")
        os.system('git clone https://github.com/magenta/magenta.git')
    
    # Add magenta to path
    sys.path.insert(0, './magenta')
    
    from magenta.models.onsets_frames_transcription import train_util
    from magenta.models.onsets_frames_transcription import infer_util
    import note_seq
    print("✓ Magenta imports successful")
    MAGENTA_AVAILABLE = True
except Exception as e:
    print(f"✗ Magenta import error: {e}")
    MAGENTA_AVAILABLE = False

# Test 3: Model files
print("\n3. Testing model files...")
model_path = "./models/train"
if os.path.exists(model_path):
    print(f"✓ Model directory exists: {model_path}")
    
    checkpoint_path = tf.train.latest_checkpoint(model_path)
    if checkpoint_path:
        print(f"✓ Checkpoint found: {checkpoint_path}")
    else:
        print(f"✗ No checkpoint found in {model_path}")
        
    # List files
    files = os.listdir(model_path)
    print(f"Model files: {files}")
else:
    print(f"✗ Model directory not found: {model_path}")

# Test 4: Try to load model
if MAGENTA_AVAILABLE:
    print("\n4. Testing model loading...")
    try:
        config = train_util.get_default_hparams()
        config.batch_size = 1
        config.truncated_length_secs = 0
        print("✓ Config created")
        
        session = tf.Session()
        print("✓ TensorFlow session created")
        
        checkpoint_path = tf.train.latest_checkpoint(model_path)
        if checkpoint_path:
            model = train_util.get_model(config)
            print("✓ Model built")
            
            saver = tf.train.Saver()
            saver.restore(session, checkpoint_path)
            print("✓ Model loaded successfully!")
            
            session.close()
        else:
            print("✗ No checkpoint to load")
            
    except Exception as e:
        print(f"✗ Model loading error: {e}")
        import traceback
        traceback.print_exc()

print("\nTest complete!")