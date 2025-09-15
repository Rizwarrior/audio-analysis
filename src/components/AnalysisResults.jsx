import { useState } from 'react'
import './AnalysisResults.css'

function AnalysisResults({ data, onReset }) {
  const [showAllDrums, setShowAllDrums] = useState(false)

  if (!data) return null

  if (data.error) {
    return (
      <div className="results error">
        <h3>Analysis Error</h3>
        <p>{data.error}</p>
      </div>
    )
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(3)
    return `${mins}:${secs.padStart(6, '0')}`
  }

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadKickSnare = () => {
    const finalBpm = data.timing_analysis?.tempo_analysis?.final_bpm || data.timing_analysis?.kick_stats?.bpm_estimate || 0
    const kickSnareData = {
      kicks: data.kicks || [],
      snares: data.snares || [],
      metadata: {
        total_kicks: (data.kicks || []).length,
        total_snares: (data.snares || []).length,
        bpm: finalBpm,
        bpm_detection_method: data.timing_analysis?.tempo_analysis?.detection_method || 'kick_intervals',
        librosa_bpm: data.timing_analysis?.tempo_analysis?.librosa_bpm || null,
        tempo_confidence: data.timing_analysis?.tempo_analysis?.tempo_confidence || null,
        exported_at: new Date().toISOString()
      }
    }
    downloadJSON(kickSnareData, 'kick-snare-timestamps.json')
  }

  const downloadAllDrums = () => {
    const finalBpm = data.timing_analysis?.tempo_analysis?.final_bpm || data.timing_analysis?.kick_stats?.bpm_estimate || 0
    const allDrumsData = {
      drums_by_type: data.drums_by_type || {},
      all_drums: data.all_drums || [],
      metadata: {
        total_drums: data.total_drums || 0,
        bpm: finalBpm,
        bpm_detection_method: data.timing_analysis?.tempo_analysis?.detection_method || 'kick_intervals',
        timing_analysis: data.timing_analysis || {},
        exported_at: new Date().toISOString()
      }
    }
    downloadJSON(allDrumsData, 'all-drums-timestamps.json')
  }

  const kickTimes = data.kicks || []
  const snareTimes = data.snares || []
  const allDrums = data.all_drums || []
  const drumsByType = data.drums_by_type || {}

  return (
    <div className="results">
      <h2 className="results-title">Analysis Results</h2>

      {/* Visualization */}
      {data.visualization && (
        <div className="visualization-section">
          <img
            src={`data:image/png;base64,${data.visualization}`}
            alt="Drum Analysis Visualization"
            className="visualization-image"
          />
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card kick">
          <div className="stat-number">{kickTimes.length}</div>
          <div className="stat-label">Kicks</div>
        </div>
        <div className="stat-card snare">
          <div className="stat-number">{snareTimes.length}</div>
          <div className="stat-label">Snares</div>
        </div>
        <div className="stat-card total">
          <div className="stat-number">{data.total_drums || allDrums.length}</div>
          <div className="stat-label">Total Drums</div>
        </div>
        {(data.timing_analysis?.tempo_analysis?.final_bpm > 0 || data.timing_analysis?.kick_stats?.bpm_estimate > 0) && (
          <div className="stat-card bpm">
            <div className="stat-number">
              {Math.round(data.timing_analysis?.tempo_analysis?.final_bpm || data.timing_analysis?.kick_stats?.bpm_estimate || 0)}
            </div>
            <div className="stat-label">BPM</div>
          </div>
        )}
      </div>

      {/* Drum Types Breakdown */}
      {data.drums_by_type && Object.keys(data.drums_by_type).length > 2 && (
        <div className="drum-types-section">
          <h4>Drum Types Detected</h4>
          <div className="drum-types-grid">
            {Object.entries(data.drums_by_type).map(([type, times]) => (
              <div key={type} className={`drum-type-card ${type}`}>
                <div className="drum-type-count">{times.length}</div>
                <div className="drum-type-name">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Buttons */}
      <div className="download-section">
        <h4>Export Timestamps</h4>
        <div className="download-buttons">
          <button
            onClick={downloadKickSnare}
            className="download-button kick-snare"
            title="Download kick and snare timestamps as JSON"
          >
            📥 Download Kick & Snare JSON
          </button>
          <button
            onClick={downloadAllDrums}
            className="download-button all-drums"
            title="Download all drum types and timestamps as JSON"
          >
            📥 Download All Drums JSON
          </button>
        </div>
      </div>

      {/* BPM Information */}
      {(data.timing_analysis?.tempo_analysis?.final_bpm > 0 || data.timing_analysis?.kick_stats?.bpm_estimate > 0) && (
        <div className="bpm-info">
          <h4>BPM Analysis</h4>
          {data.timing_analysis?.tempo_analysis ? (
            <div>
              <p>
                <strong>Detected BPM:</strong> {Math.round(data.timing_analysis.tempo_analysis.final_bpm)}
                <span className="bpm-method">
                  (using {data.timing_analysis.tempo_analysis.detection_method === 'librosa' ? 'Librosa tempo detection' : 'kick drum intervals'})
                </span>
              </p>
              {data.timing_analysis.tempo_analysis.detection_method === 'librosa' && (
                <div className="bpm-details">
                  <p>
                    <strong>Librosa BPM:</strong> {data.timing_analysis.tempo_analysis.librosa_bpm?.toFixed(1)}
                    (confidence: {(data.timing_analysis.tempo_analysis.tempo_confidence * 100)?.toFixed(0)}%)
                  </p>
                  {data.timing_analysis.tempo_analysis.kick_based_bpm > 0 && (
                    <p>
                      <strong>Kick-based BPM:</strong> {data.timing_analysis.tempo_analysis.kick_based_bpm?.toFixed(1)}
                    </p>
                  )}
                </div>
              )}
              {data.timing_analysis.tempo_analysis.detection_method === 'kick_intervals' && (
                <span className="bpm-explanation">
                  (calculated from average kick drum intervals: 60 ÷ {data.timing_analysis.kick_stats.avg_interval?.toFixed(3)}s)
                </span>
              )}
            </div>
          ) : (
            <p>
              <strong>Estimated BPM:</strong> {Math.round(data.timing_analysis.kick_stats.bpm_estimate)}
              <span className="bpm-explanation">
                (calculated from average kick drum intervals: 60 ÷ {data.timing_analysis.kick_stats.avg_interval?.toFixed(3)}s)
              </span>
            </p>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="controls">
        <button
          onClick={() => setShowAllDrums(!showAllDrums)}
          className="toggle-button"
        >
          {showAllDrums ? 'Hide Timestamps' : 'Show Timestamps'}
        </button>
        <button
          onClick={onReset}
          className="reset-button"
        >
          Analyse Another Song
        </button>
      </div>

      {/* Timestamps */}
      {showAllDrums && (
        <div className="timestamps-section">
          <h4>All Drum Timestamps</h4>
          <div className="timestamp-grid-all">
            {Object.entries(drumsByType).map(([drumType, times]) => (
              <div key={drumType} className="timestamp-column">
                <h5 className={`drum-type-header ${drumType}`}>
                  {drumType.charAt(0).toUpperCase() + drumType.slice(1)} ({times.length})
                </h5>
                <div className="timestamp-list">
                  {times.map((time, index) => (
                    <span key={index} className={`timestamp ${drumType}`}>
                      {formatTime(time)}
                    </span>
                  ))}
                  {times.length === 0 && (
                    <div className="no-hits">No {drumType}s detected</div>
                  )}
                </div>
              </div>
            ))}

            {/* Fallback to kick/snare if drums_by_type is not available */}
            {Object.keys(drumsByType).length === 0 && (
              <>
                <div className="timestamp-column">
                  <h5 className="drum-type-header kick">Kick ({kickTimes.length})</h5>
                  <div className="timestamp-list">
                    {kickTimes.map((time, index) => (
                      <span key={index} className="timestamp kick">
                        {formatTime(time)}
                      </span>
                    ))}
                    {kickTimes.length === 0 && (
                      <div className="no-hits">No kicks detected</div>
                    )}
                  </div>
                </div>

                <div className="timestamp-column">
                  <h5 className="drum-type-header snare">Snare ({snareTimes.length})</h5>
                  <div className="timestamp-list">
                    {snareTimes.map((time, index) => (
                      <span key={index} className="timestamp snare">
                        {formatTime(time)}
                      </span>
                    ))}
                    {snareTimes.length === 0 && (
                      <div className="no-hits">No snares detected</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisResults