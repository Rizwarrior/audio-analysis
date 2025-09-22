import { useState } from 'react'
import FileUpload from './components/FileUpload'
import AnalysisResults from './components/AnalysisResults'
import AudioPlayer from './components/AudioPlayer'
import ProgressBar from './components/ProgressBar'
import './App.css'

function App() {
  const [analysisData, setAnalysisData] = useState(null)
  const [separationData, setSeparationData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [currentPhase, setCurrentPhase] = useState('upload')
 // 'upload', 'separation', 'analysis'
  const [resetTrigger, setResetTrigger] = useState(0)

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setAnalysisData(null)
    setSeparationData(null)
    setProgress(0)
    setCurrentPhase('upload')
    setProgressText('Starting analysis...')
    
    // Smooth animated progress from 0-50% during separation phase
    let currentProgress = 0
    
    const progressInterval = setInterval(() => {
      if (currentProgress < 50) {
        // Smooth continuous animation from 0-50%
        const increment = 0.12 + Math.random() * 0.15 // 0.12-0.27% per 80ms
        currentProgress = Math.min(50, currentProgress + increment)
        
        // Update text based on progress ranges
        if (currentProgress < 8) {
          setProgressText('Uploading audio file...')
          setCurrentPhase('upload')
        } else if (currentProgress < 20) {
          setProgressText('Preparing audio for separation...')
          setCurrentPhase('separation')
        } else if (currentProgress < 35) {
          setProgressText('Separating audio into stems...')
        } else {
          setProgressText('Finalizing audio separation...')
        }
        
        setProgress(currentProgress)
      } else {
        // Stop at 50% and wait for separation to complete
        setProgress(50)
        setProgressText('Audio separation completing...')
        clearInterval(progressInterval)
        window.analysisProgressInterval = null
      }
    }, 80) // Update every 80ms for very smooth animation
    
    // Store interval ID to clear it later
    window.analysisProgressInterval = progressInterval
  }

  const handleSeparationComplete = (separationData) => {
    console.log('Separation complete, starting parallel track preloading:', separationData)
    
    // Store separation data but DON'T show the player yet
    // Just start preloading the audio tracks in the background
    const tempSeparationData = {
      tracks: separationData.tracks,
      session_id: separationData.session_id,
      available_stems: separationData.available_stems
    }
    
    // Start parallel preloading of all tracks simultaneously
    const preloadedAudio = {}
    const trackLoadingPromises = []
    
    Object.entries(separationData.tracks).forEach(([trackType, trackUrl]) => {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.src = trackUrl
      audio.crossOrigin = 'anonymous'
      
      // Create a promise that resolves when track is ready
      const loadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`${trackType} track loading timeout`))
        }, 120000) // 2 minute timeout per track (more generous for large files)
        
        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout)
          console.log(`✅ ${trackType} fully loaded and ready to play`)
          resolve(trackType)
        })
        
        audio.addEventListener('error', (e) => {
          clearTimeout(timeout)
          console.error(`❌ ${trackType} loading failed:`, e)
          reject(new Error(`${trackType} loading failed`))
        })
        
        // Track loading progress for console logging
        audio.addEventListener('progress', () => {
          if (audio.buffered.length > 0 && audio.duration > 0) {
            const buffered = Math.min(100, (audio.buffered.end(0) / audio.duration) * 100)
            console.log(`📊 ${trackType} buffered: ${buffered.toFixed(1)}%`)
          }
        })
      })
      
      // Start loading immediately - this triggers parallel downloads
      audio.load()
      preloadedAudio[trackType] = audio
      trackLoadingPromises.push(loadPromise)
      console.log(`🚀 Starting parallel download for ${trackType}: ${trackUrl}`)
    })
    
    // Monitor overall loading progress
    Promise.allSettled(trackLoadingPromises).then((results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      console.log(`📈 Parallel loading complete: ${successful} successful, ${failed} failed`)
      
      if (failed > 0) {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`Track loading failed:`, result.reason)
          }
        })
      }
    })
    
    // Store both data and preloaded audio elements
    window.pendingSeparationData = tempSeparationData
    window.preloadedAudioElements = preloadedAudio
    
    // Start second phase of animation (50-100%) for track loading + drum analysis
    setProgress(50)
    setProgressText('Tracks preloading while analyzing drums...')
    setCurrentPhase('analysis')
    
    // Start second animation phase from 50% to 100%
    let currentProgress = 50
    const secondPhaseInterval = setInterval(() => {
      if (currentProgress < 95) {
        // Slower animation for analysis phase
        const increment = 0.08 + Math.random() * 0.12 // 0.08-0.20% per 100ms
        currentProgress = Math.min(95, currentProgress + increment)
        
        // Update text based on progress ranges
        if (currentProgress < 65) {
          setProgressText('Loading audio tracks in parallel...')
        } else if (currentProgress < 80) {
          setProgressText('Analyzing drum patterns with AI...')
        } else {
          setProgressText('Generating percussion timestamps...')
        }
        
        setProgress(currentProgress)
      } else {
        // Stop at 95% and wait for actual completion
        setProgress(95)
        setProgressText('Finalizing analysis...')
        clearInterval(secondPhaseInterval)
        window.secondPhaseProgressInterval = secondPhaseInterval
      }
    }, 100) // Update every 100ms
    
    window.secondPhaseProgressInterval = secondPhaseInterval
  }

  const handleAnalysisComplete = (data) => {
    // Clear both progress intervals
    if (window.analysisProgressInterval) {
      clearInterval(window.analysisProgressInterval)
      window.analysisProgressInterval = null
    }
    if (window.secondPhaseProgressInterval) {
      clearInterval(window.secondPhaseProgressInterval)
      window.secondPhaseProgressInterval = null
    }
    
    if (!data) {
      // Handle error case
      setIsAnalyzing(false)
      setProgress(0)
      setProgressText('')
      setCurrentPhase('upload')
      return
    }
    
    // Smoothly complete the progress bar from current position to 100%
    let currentProgress = progress
    setProgressText('Analysis complete!')
    
    const completionInterval = setInterval(() => {
      currentProgress += 2 // Fast but smooth completion
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(completionInterval)
        
        // Show results after a brief pause
        setTimeout(() => {
          // Use pending separation data (which has been preloading) or fallback to combined data
          const finalSeparationData = window.pendingSeparationData || (data.separation ? {
            tracks: data.separation.tracks,
            session_id: data.separation.session_id,
            available_stems: data.separation.available_stems
          } : null)
          
          if (finalSeparationData) {
            setSeparationData(finalSeparationData)
          }
          
          // Set analysis data (everything except separation)
          const { separation, ...analysisResults } = data
          setAnalysisData(analysisResults)
          
          // Clean up
          window.pendingSeparationData = null
          window.preloadedAudioElements = null
          
          setIsAnalyzing(false)
          setProgress(0)
          setProgressText('')
          setCurrentPhase('upload')
        }, 600)
      }
    }, 50)
  }

  const handleReset = async () => {
    // Clean up separation session if it exists
    const sessionToCleanup = separationData?.session_id || window.pendingSeparationData?.session_id
    if (sessionToCleanup) {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || 'https://rizwankuwait--perc-analysis-backend-v3-fastapi-app.modal.run').replace(/\/$/, '')
        await fetch(`${baseUrl}/api/cleanup/${sessionToCleanup}`, {
          method: 'POST'
        })
      } catch (error) {
        console.warn('Failed to cleanup session:', error)
      }
    }
    
    // Clean up pending data
    window.pendingSeparationData = null
    window.preloadedAudioElements = null
    
    // Reset all state including track loading progress
    setAnalysisData(null)
    setSeparationData(null)
    setIsAnalyzing(false)
    setProgress(0)
    setProgressText('')
    setCurrentPhase('upload')
    
    // Trigger FileUpload reset by incrementing resetTrigger
    setResetTrigger(prev => prev + 1)
    
    // Clear any running intervals
    if (window.analysisProgressInterval) {
      clearInterval(window.analysisProgressInterval)
      window.analysisProgressInterval = null
    }
    if (window.secondPhaseProgressInterval) {
      clearInterval(window.secondPhaseProgressInterval)
      window.secondPhaseProgressInterval = null
    }
  }

  const handleAnalyzeDrums = () => {
    // This function is called when user wants to see drum analysis
    // The analysis is already done, just show it
    // In a more advanced version, this could trigger additional analysis
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Percussion Analysis</h1>
        <p className="subtitle">AI-powered drum transcription</p>
      </header>
      
      <main className="main">
        <FileUpload 
          onAnalysisStart={handleAnalysisStart}
          onSeparationComplete={handleSeparationComplete}
          onAnalysisComplete={handleAnalysisComplete}
          isAnalyzing={isAnalyzing}
          resetTrigger={resetTrigger}
        />
        
        {isAnalyzing && (
          <div className="analysis-section">
            <ProgressBar 
              progress={progress} 
              text={progressText} 
            />
          </div>
        )}
        
        {separationData && (
          <div className="separation-section">
            <AudioPlayer 
              tracks={separationData.tracks}
              originalFileName="separated_track"
              onAnalyzeDrums={handleAnalyzeDrums}
              drumsAnalyzed={!!analysisData}
              preloadedUrls={window.preloadedAudioElements ? Object.keys(window.preloadedAudioElements) : []}
            />
          </div>
        )}

        {analysisData && (
          <div className="results-section">
            <AnalysisResults data={analysisData} onReset={handleReset} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App