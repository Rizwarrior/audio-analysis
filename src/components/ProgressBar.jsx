import './ProgressBar.css'

function ProgressBar({ progress, text }) {
  return (
    <div className="progress-container">
      <div className="progress-text">{text}</div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-percentage">{Math.round(progress)}%</div>
    </div>
  )
}

export default ProgressBar