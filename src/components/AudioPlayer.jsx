import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw, Repeat } from 'lucide-react'
import './AudioPlayer.css'

function AudioPlayer({ tracks, originalFileName, onAnalyzeDrums, drumsAnalyzed = false, preloadedUrls = [] }) {
  // Log the tracks URLs for debugging
  console.log('AudioPlayer received tracks:', tracks)
  console.log('Preloaded tracks:', preloadedUrls)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volumes, setVolumes] = useState({
    vocals: 1,
    drums: 1,
    bass: 1,
    other: 1
  })
  const [mutedTracks, setMutedTracks] = useState({
    vocals: false,
    drums: false,
    bass: false,
    other: false
  })
  const [isDragging, setIsDragging] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    vocals: true,
    drums: true,
    bass: true,
    other: true
  })

  const audioRefs = useRef({})
  const progressRef = useRef(null)

  const trackInfo = {
    vocals: { name: 'Vocals', color: '#e74c3c', icon: '🎤' },
    drums: { name: 'Drums', color: '#f39c12', icon: '🥁' },
    bass: { name: 'Bass', color: '#9b59b6', icon: '🎸' },
    other: { name: 'Other', color: '#2ecc71', icon: '🎹' }
  }

  useEffect(() => {
    const eventListeners = []
    let timeUpdateThrottle = null

    const setupAudio = () => {
      const trackTypes = Object.keys(tracks)
      const primaryTrack = trackTypes[0] // Use first track as primary for time sync
      
      console.log('Setting up audio for tracks:', trackTypes)
      console.log('Primary track:', primaryTrack)

      trackTypes.forEach(trackType => {
        const audio = audioRefs.current[trackType]
        if (audio) {
          const handleLoadedMetadata = () => {
            const currentAudio = audioRefs.current[trackType]
            if (currentAudio) {
              console.log(`${trackType} metadata loaded, duration: ${currentAudio.duration}`)
              
              if (trackType === primaryTrack) {
                setDuration(currentAudio.duration)
              }
            }
          }

          const handleTimeUpdate = () => {
            // Only update time from the primary track and throttle updates
            // Don't update time while user is dragging the slider
            if (audioRefs.current[trackType] && trackType === primaryTrack && !isDragging) {
              if (timeUpdateThrottle) {
                clearTimeout(timeUpdateThrottle)
              }

              timeUpdateThrottle = setTimeout(() => {
                const currentAudio = audioRefs.current[trackType]
                if (currentAudio && !isNaN(currentAudio.currentTime) && !isDragging) {
                  setCurrentTime(currentAudio.currentTime)
                }
              }, 100) // Slightly slower throttle for smoother seeking
            }
          }

          const handleError = (e) => {
            console.error(`Audio error for ${trackType}:`, e)
            console.error(`Audio src: ${audio.src}`)
            console.error(`Audio readyState: ${audio.readyState}`)
            console.error(`Audio networkState: ${audio.networkState}`)
          }

          const handleEnded = () => {
            if (trackType === primaryTrack) {
              setIsPlaying(false)
            }
          }

          // Remove existing listeners
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
          audio.removeEventListener('timeupdate', handleTimeUpdate)
          audio.removeEventListener('error', handleError)
          audio.removeEventListener('ended', handleEnded)

          // Add new listeners
          audio.addEventListener('loadedmetadata', handleLoadedMetadata)
          audio.addEventListener('timeupdate', handleTimeUpdate)
          audio.addEventListener('error', handleError)
          audio.addEventListener('ended', handleEnded)

          eventListeners.push({
            audio,
            events: [
              { type: 'loadedmetadata', handler: handleLoadedMetadata },
              { type: 'timeupdate', handler: handleTimeUpdate },
              { type: 'error', handler: handleError },
              { type: 'ended', handler: handleEnded }
            ]
          })

          // If metadata is already loaded, set duration immediately
          if (audio.duration && !isNaN(audio.duration) && trackType === primaryTrack) {
            console.log(`${trackType} duration already available: ${audio.duration}`)
            setDuration(audio.duration)
          }
          
          // Set initial volume for each track  
          audio.volume = volumes[trackType]
          console.log(`${trackType} initial volume set to: ${volumes[trackType]}`)
          
          // Log audio element status
          console.log(`${trackType} audio setup:`, {
            src: audio.src,
            readyState: audio.readyState,
            networkState: audio.networkState,
            duration: audio.duration,
            volume: audio.volume
          })
        }
      })
    }

    const timeoutId = setTimeout(setupAudio, 100)

    return () => {
      clearTimeout(timeoutId)
      if (timeUpdateThrottle) {
        clearTimeout(timeUpdateThrottle)
      }

      eventListeners.forEach(({ audio, events }) => {
        if (audio) {
          events.forEach(({ type, handler }) => {
            audio.removeEventListener(type, handler)
          })
        }
      })

      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause()
        }
      })
    }
  }, [tracks]) // Only re-setup when tracks change, not volume/mute states

  const togglePlayPause = async () => {
    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)

    // Get all valid audio elements that are ready
    const audioElements = Object.values(audioRefs.current).filter(audio => audio && audio.readyState >= 2)
    
    console.log('Toggle play/pause:', newIsPlaying)
    console.log('Ready audio elements:', audioElements.length)
    audioElements.forEach((audio, index) => {
      const trackType = Object.keys(audioRefs.current).find(key => audioRefs.current[key] === audio)
      console.log(`${trackType}: volume=${audio.volume}, readyState=${audio.readyState}, currentTime=${audio.currentTime}`)
    })

    if (newIsPlaying) {
      // Synchronize all tracks to the same time before playing
      const primaryAudio = audioElements[0]
      if (primaryAudio) {
        const syncTime = primaryAudio.currentTime

        // Set all tracks to the same time
        audioElements.forEach(audio => {
          try {
            if (Math.abs(audio.currentTime - syncTime) > 0.1) {
              audio.currentTime = syncTime
            }
          } catch (error) {
            console.warn('Could not sync audio time:', error)
          }
        })

        // Wait a moment for sync
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Start all tracks as close to simultaneously as possible
      const playPromises = audioElements.map(audio => {
        return audio.play().catch(error => {
          console.warn('Could not start playback:', error)
          return null
        })
      })

      try {
        await Promise.all(playPromises)
      } catch (error) {
        console.warn('Some tracks failed to start:', error)
      }
    } else {
      // Pause all tracks immediately
      audioElements.forEach(audio => {
        audio.pause()
      })
    }
  }

  const restartSong = () => {
    seekToTime(0)
  }

  const seekToTime = async (newTime) => {
    const audioElements = Object.values(audioRefs.current).filter(audio => audio && audio.readyState >= 2)
    const wasPlaying = isPlaying

    // Immediately update the displayed time to prevent UI lag
    setCurrentTime(newTime)

    // Pause all tracks first if playing
    if (wasPlaying) {
      audioElements.forEach(audio => {
        audio.pause()
      })
      setIsPlaying(false)
    }

    // Wait a brief moment for pauses to register
    await new Promise(resolve => setTimeout(resolve, 50))

    // Seek all tracks simultaneously without waiting for events
    audioElements.forEach(audio => {
      try {
        audio.currentTime = newTime
      } catch (error) {
        console.warn('Could not set currentTime:', error)
      }
    })

    // Wait a moment for seeks to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Resume playback if it was playing before
    if (wasPlaying) {
      setIsPlaying(true)
      // Start all tracks as close to simultaneously as possible
      const playPromises = audioElements.map(audio => {
        return audio.play().catch(error => {
          console.warn('Could not resume playback:', error)
          return null
        })
      })

      // Don't wait for all promises, just start them
      Promise.all(playPromises).catch(() => {
        // Fallback: try starting them one by one
        audioElements.forEach(audio => {
          audio.play().catch(console.error)
        })
      })
    }
  }

  const getTimeFromPosition = (clientX) => {
    if (!progressRef.current || duration <= 0) return 0

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width))
    return Math.max(0, Math.min((clickX / rect.width) * duration, duration))
  }

  const handleProgressClick = (e) => {
    if (!isDragging) {
      const newTime = getTimeFromPosition(e.clientX)
      seekToTime(newTime)
    }
  }

  const handleProgressMouseDown = (e) => {
    e.preventDefault() // Prevent text selection during drag
    setIsDragging(true)
    const startTime = getTimeFromPosition(e.clientX)
    setCurrentTime(startTime) // Update UI immediately

    const handleMouseMove = (moveEvent) => {
      if (moveEvent.buttons === 1) { // Only if left mouse button is still pressed
        const newTime = getTimeFromPosition(moveEvent.clientX)
        setCurrentTime(newTime) // Update UI during drag
      }
    }

    const handleMouseUp = (upEvent) => {
      setIsDragging(false)
      const finalTime = getTimeFromPosition(upEvent.clientX)
      
      // Small delay to prevent conflicts with time updates
      setTimeout(() => {
        seekToTime(finalTime)
      }, 10)

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleVolumeChange = (trackType, volume) => {
    setVolumes(prev => ({ ...prev, [trackType]: volume }))
    const audio = audioRefs.current[trackType]
    if (audio) {
      audio.volume = mutedTracks[trackType] ? 0 : volume
    }
  }

  const toggleMute = (trackType) => {
    const newMuted = !mutedTracks[trackType]
    setMutedTracks(prev => ({ ...prev, [trackType]: newMuted }))

    const audio = audioRefs.current[trackType]
    if (audio) {
      audio.volume = newMuted ? 0 : volumes[trackType]
    }
  }

  const formatTime = (time) => {
    if (!time || !isFinite(time) || isNaN(time)) {
      return '0:00'
    }
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const downloadTrack = async (trackType) => {
    try {
      console.log(`Downloading ${trackType} track...`)
      
      // Fetch the audio file as a blob to force download
      const response = await fetch(tracks[trackType])
      if (!response.ok) {
        throw new Error(`Failed to fetch ${trackType} track`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${originalFileName}_${trackType}.mp3`
      document.body.appendChild(link) // Required for Firefox
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log(`${trackType} track downloaded successfully`)
    } catch (error) {
      console.error(`Failed to download ${trackType} track:`, error)
      // Fallback to direct link if blob download fails
      window.open(tracks[trackType], '_blank')
    }
  }

  return (
    <div className="player-container">
      <div className="player-header">
        <h2>Separated Tracks</h2>
        <p>Your music has been successfully separated into individual stems</p>
        {tracks.drums && !drumsAnalyzed && (
          <button onClick={onAnalyzeDrums} className="analyze-drums-button">
            🥁 Analyze Drums for Timestamps
          </button>
        )}
      </div>

      <div className="main-controls">
        <div className="playback-controls">
          <button 
            onClick={togglePlayPause} 
            className="play-button"
            disabled={Object.values(loadingStates).every(loading => loading)}
            title={Object.values(loadingStates).every(loading => loading) ? "Loading tracks..." : ""}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button onClick={restartSong} className="restart-button" title="Restart song">
            <Repeat size={24} />
          </button>
        </div>

        <div className="progress-container">
          <span className="time-display">{formatTime(currentTime)}</span>
          <div
            ref={progressRef}
            className="progress-bar"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          >
            <div
              className="progress-fill"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
            <div
              className="progress-handle"
              style={{
                left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                opacity: isDragging ? 1 : 0
              }}
            ></div>
          </div>
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="tracks-grid">
        {Object.entries(tracks).map(([trackType, trackUrl]) => (
          <div key={trackType} className={`track-card ${trackType === 'drums' && drumsAnalyzed ? 'analyzed' : ''}`}>
            <audio
              ref={el => audioRefs.current[trackType] = el}
              src={trackUrl}
              preload="auto"
              crossOrigin="anonymous"
              onCanPlay={() => {
                console.log(`${trackType} can start playing`);
                setLoadingStates(prev => ({ ...prev, [trackType]: false }));
              }}
              onCanPlayThrough={() => console.log(`${trackType} fully loaded`)}
              onLoadStart={() => {
                console.log(`${trackType} started loading`);
                setLoadingStates(prev => ({ ...prev, [trackType]: true }));
              }}
              onProgress={(e) => {
                if (e.target.buffered.length > 0) {
                  const buffered = e.target.buffered.end(0) / e.target.duration * 100;
                  console.log(`${trackType} buffered: ${buffered.toFixed(1)}%`);
                }
              }}
              onError={() => {
                console.error(`${trackType} failed to load`);
                setLoadingStates(prev => ({ ...prev, [trackType]: false }));
              }}
            />

            <div className="track-header">
              <div className="track-info">
                <span className="track-icon">{trackInfo[trackType].icon}</span>
                <h3 style={{ color: trackInfo[trackType].color }}>
                  {trackInfo[trackType].name}
                  {loadingStates[trackType] && (
                    <span className="loading-badge">
                      ⏳ {preloadedUrls.includes(trackType) ? 'Finalizing...' : 'Loading...'}
                    </span>
                  )}
                  {trackType === 'drums' && drumsAnalyzed && (
                    <span className="analyzed-badge">✓ Analyzed</span>
                  )}
                </h3>
              </div>

              <div className="track-actions">
                <button
                  onClick={() => toggleMute(trackType)}
                  className={`mute-button ${mutedTracks[trackType] ? 'muted' : ''}`}
                >
                  {mutedTracks[trackType] ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <button
                  onClick={() => downloadTrack(trackType)}
                  className="download-button"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volumes[trackType]}
                onChange={(e) => handleVolumeChange(trackType, parseFloat(e.target.value))}
                className="volume-slider"
                style={{
                  background: `linear-gradient(to right, ${trackInfo[trackType].color} 0%, ${trackInfo[trackType].color} ${volumes[trackType] * 100}%, #ddd ${volumes[trackType] * 100}%, #ddd 100%)`
                }}
              />
              <span className="volume-label">{Math.round(volumes[trackType] * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="download-all">
        <button
          onClick={() => Object.keys(tracks).forEach(trackType => downloadTrack(trackType))}
          className="download-all-button"
        >
          <Download size={20} />
          Download All Tracks
        </button>
      </div>
    </div>
  )
}

export default AudioPlayer