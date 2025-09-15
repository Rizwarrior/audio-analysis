import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './FileUpload.css'

function FileUpload({ onAnalysisStart, onAnalysisComplete, isAnalyzing, resetTrigger }) {
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

    try {
      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minute timeout for large files
        onUploadProgress: (progressEvent) => {
          // This will help with the initial upload phase
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload progress: ${percentCompleted}%`)
        }
      })
      onAnalysisComplete(response.data)
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