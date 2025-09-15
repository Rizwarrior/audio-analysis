# 🎵 Integrated Percussion Analyzer + Demucs Setup Guide

This guide covers the new integrated workflow that combines **Demucs source separation** with **percussion analysis**.

## 🚀 **Super Easy Setup (One Command)**

### **Option 1: Auto Setup + Start (Recommended)**
```bash
# On Linux/Mac
./start.sh

# On Windows
start.bat
```
This will automatically:
- Run setup if needed
- Install all dependencies
- Test compatibility
- Start both servers
- Open the application

### **Option 2: Manual Setup**
```bash
# 1. Run setup
./setup.sh

# 2. Start development servers
./dev.sh
```

## 🎯 **What Gets Installed**

### **Backend Dependencies:**
- **Existing:** TensorFlow 2.11.1, Magenta, Librosa, FastAPI
- **New:** Demucs 4.0.1, PyTorch 2.8.0, TorchAudio
- **Compatibility:** All tested to work together

### **Frontend Dependencies:**
- **Existing:** React, Axios, Vite
- **New:** Lucide-react (for icons)

## 🔄 **New Integrated Workflow**

```
📁 Upload Audio
    ↓
🎛️ Demucs Separation (1-3 min)
    ↓ (creates 4 stems)
🎵 Interactive Stem Player
    ↓ (drums stem)
🥁 Percussion Analysis
    ↓
📊 Combined Results
```

## 🎵 **Features You Get**

### **🎛️ Source Separation:**
- **4 stems:** Vocals, Drums, Bass, Other
- **High quality:** Uses Facebook's Demucs AI model
- **Fast processing:** Optimized for CPU

### **🎵 Interactive Audio Player:**
- **Synchronized playback** across all stems
- **Individual volume controls** for each stem
- **Mute/unmute buttons** for isolation
- **Progress bar** with click-to-seek
- **Download buttons** for individual stems

### **🥁 Enhanced Drum Analysis:**
- **Automatic processing** of separated drums stem
- **All drum types:** kick, snare, hihat, crash, ride, tom
- **Improved BPM detection** using Librosa
- **JSON exports** for timestamps and analysis data

## 🧪 **Testing the Setup**

### **1. Dependency Test:**
```bash
cd backend
python test_dependencies.py
```

### **2. Quick Functionality Test:**
1. Upload a **short music file** (30-60 seconds)
2. Watch the **progress phases:**
   - Uploading (0-10%)
   - Separating stems (10-60%)
   - Loading model (60-70%)
   - Analyzing drums (70-85%)
   - Generating results (85-100%)

### **3. Expected Results:**
- ✅ 4 playable audio stems
- ✅ Volume controls work
- ✅ Download buttons work
- ✅ Drum analysis appears
- ✅ BPM detection works
- ✅ JSON exports work

## 🔧 **Troubleshooting**

### **"Demucs command not found"**
```bash
# Reinstall Demucs
pip install demucs

# Or use conda
conda install -c conda-forge demucs
```

### **"Import errors"**
```bash
# Run dependency test
python backend/test_dependencies.py

# If issues persist, fresh install:
rm -rf venv
./setup.sh
```

### **"Processing takes too long"**
- Start with **shorter files** (< 1 minute)
- Demucs separation is the longest step (1-3 minutes)
- Check console logs for progress

### **"Memory issues"**
- Close other applications
- Use shorter audio files
- Both TensorFlow and PyTorch use significant RAM

## 📁 **File Structure**

```
perc-analysis/
├── 🚀 start.sh / start.bat     # One-command setup + start
├── 🔧 setup.sh                 # Enhanced setup with Demucs
├── 🏃 dev.sh                   # Start development servers
├── 📦 backend/
│   ├── main.py                 # Integrated API (Demucs + Analysis)
│   ├── demucs_separator.py     # Demucs integration
│   ├── percussion_analyzer.py  # Original drum analysis
│   └── test_dependencies.py    # Compatibility testing
├── 🌐 src/
│   ├── App.jsx                 # Updated for integrated workflow
│   └── components/
│       ├── AudioPlayer.jsx     # New stem player component
│       └── AnalysisResults.jsx # Enhanced with downloads
└── 📋 package.json             # Updated with lucide-react
```

## 🎯 **Performance Tips**

### **For Faster Testing:**
- Use **MP3 files** (smaller than WAV)
- Keep files **under 2 minutes** initially
- **Close other apps** to free up RAM

### **For Production:**
- Consider **GPU acceleration** for Demucs (requires CUDA setup)
- Use **SSD storage** for faster file I/O
- **Increase RAM** if processing large files

## 🆘 **Getting Help**

1. **Check logs:** Both frontend (browser console) and backend (terminal)
2. **Run tests:** `python backend/test_dependencies.py`
3. **Fresh install:** Delete `venv` and `node_modules`, run `./setup.sh`
4. **File issues:** Check file format (MP3, WAV, FLAC supported)

## 🎉 **Success Indicators**

When everything works, you should see:
- ✅ Both servers start without errors
- ✅ Upload works smoothly
- ✅ Progress bar shows realistic progression
- ✅ 4 audio stems appear and play
- ✅ Drum analysis results display
- ✅ Downloads work for both stems and JSON data

**Enjoy your integrated music analysis and source separation tool!** 🎵