const { React } = window;
import { formatTime } from '../utils/helpers.js';

export const FocusMode = ({ 
    task, 
    timeLeft, 
    isRunning,
    onToggleTimer,
    onComplete,
    onExit
}) => {
    return (
        <div className="focus-mode-container">
            <div className="focus-mode-header">
                <button className="exit-focus-btn" onClick={onExit}>
                    ← Exit
                </button>
            </div>

            <div className="focus-mode-content">
                <div className="focus-task-name">{task.name}</div>

                <div className="focus-timer-display">
                    <div className="focus-timer-time">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="focus-timer-controls">
                    <button
                        className={`focus-control-btn ${isRunning ? 'active' : ''}`}
                        onClick={onToggleTimer}
                    >
                        {isRunning ? '⏸ Pause' : '▶ Start'}
                    </button>
                    <button
                        className="focus-control-btn complete"
                        onClick={onComplete}
                    >
                        ✓ Complete
                    </button>
                </div>
            </div>
        </div>
    );
};