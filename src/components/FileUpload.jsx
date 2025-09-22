import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './FileUpload.css'

function FileUpload({ onAnalysisStart, onAnalysisComplete, onSeparationComplete, isAnalyzing, resetTrigger }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  // Reset file selection when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setSelectedFile(null)
      setDragActive(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [resetTrigger])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('audio/')) {
      setSelectedFile(file)
    } else {
      alert('Please select an audio file')
    }
  }

  const analyzeFile = async () => {
    if (!selectedFile) return

    onAnalysisStart()
    
    const formData = new FormData()
    formData.append('audio', selectedFile)
    const baseUrl = (import.meta.env.VITE_API_URL || 'https://rizwankuwait--perc-analysis-backend-v3-fastapi-app.modal.run').replace(/\/$/, '')

    try {
      // Stage 1: Separate audio and get track URLs immediately
      console.log('Stage 1: Starting separation...')
      const separationResponse = await axios.post(`${baseUrl}/api/separate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minute timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload progress: ${percentCompleted}%`)
        }
      })
      
      const separationData = separationResponse.data
      console.log('Stage 1 complete: Separation data received', separationData)
      
      // Immediately provide track URLs to start preloading
      if (onSeparationComplete) {
        onSeparationComplete(separationData)
      }
      
      // Stage 2: Analyze drums in background while tracks preload
      console.log('Stage 2: Starting drum analysis...')
      const analysisResponse = await axios.post(`${baseUrl}/api/analyze/${separationData.session_id}`, {}, {
        timeout: 1000000, // 16+ minute timeout for analysis (allows for 15min Magenta + buffer)
      })
      
      console.log('Stage 2 complete: Analysis data received', analysisResponse.data)
      
      // Combine separation and analysis data
      const combinedData = {
        ...analysisResponse.data,
        separation: {
          session_id: separationData.session_id,
          tracks: separationData.tracks,
          available_stems: separationData.available_stems
        }
      }
      
      onAnalysisComplete(combinedData)
    } catch (error) {
      console.error('Analysis failed:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed'
      alert(`Analysis failed: ${errorMessage}. Please try again.`)
      onAnalysisComplete(null)
    }
  }

  return (
    <div className="upload-section">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div className="file-selected">
            <div className="file-icon">🎵</div>
            <div className="file-info">
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <div>Drop audio file here or click to browse</div>
              <div className="upload-subtext">Supports WAV, MP3, FLAC, and more</div>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <button 
          className="analyze-btn"
          onClick={analyzeFile}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analysing...' : 'Separate Audio Sources and Analyse Percussion'}
        </button>
      )}
    </div>
  )
}

export default FileUpload