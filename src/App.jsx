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
    
    // More realistic progress simulation for combined workflow
    let currentProgress = 0
    let phase = 'upload'
    let phaseStartTime = Date.now()
    
    const progressInterval = setInterval(() => {
      if (currentProgress < 95 && isAnalyzing) {
        const elapsed = Date.now() - phaseStartTime
        
        // Different phases with different speeds and durations
        if (phase === 'upload' && elapsed > 1000) {
          // Upload phase: 0-10% in ~1 second
          const increment = Math.random() * 2 + 1
          currentProgress = Math.min(10, currentProgress + increment)
          setProgressText('Uploading audio file...')
          
          if (currentProgress >= 10) {
            phase = 'separation'
            phaseStartTime = Date.now()
            setCurrentPhase('separation')
          }
        } else if (phase === 'separation') {
          // Demucs separation: 10-60% - main processing time
          const increment = Math.random() * 0.8 + 0.3
          currentProgress = Math.min(60, currentProgress + increment)
          setProgressText('Separating audio into stems...')
          
          if (currentProgress >= 60) {
            phase = 'loading'
            phaseStartTime = Date.now()
            setCurrentPhase('analysis')
          }
        } else if (phase === 'loading' && elapsed > 1000) {
          // Model loading: 60-70% in ~1 second
          const increment = Math.random() * 1.5 + 0.5
          currentProgress = Math.min(70, currentProgress + increment)
          setProgressText('Loading percussion analysis model...')
          
          if (currentProgress >= 70) {
            phase = 'transcription'
            phaseStartTime = Date.now()
          }
        } else if (phase === 'transcription') {
          // Drum transcription: 70-85% - AI processing
          const increment = Math.random() * 0.6 + 0.2
          currentProgress = Math.min(85, currentProgress + increment)
          setProgressText('Analyzing drum patterns...')
          
          if (currentProgress >= 85) {
            phase = 'visualization'
            phaseStartTime = Date.now()
          }
        } else if (phase === 'visualization') {
          // Visualization: 85-95% - final steps
          const increment = Math.random() * 0.4 + 0.1
          currentProgress = Math.min(95, currentProgress + increment)
          setProgressText('Generating visualization...')
        }
        
        setProgress(currentProgress)
      }
    }, 150)
    
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
        }, 60000) // 60 second timeout per track
        
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
    
    // Update progress to show separation is done
    setProgress(60) // Separation is typically 60% of the work
    setProgressText('Tracks are preloading while analyzing drums...')
    setCurrentPhase('analysis')
  }

  const handleAnalysisComplete = (data) => {
    // Clear the progress interval
    if (window.analysisProgressInterval) {
      clearInterval(window.analysisProgressInterval)
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