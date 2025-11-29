const { React } = window;
import { formatTime } from '../utils/helpers.js';

export const FocusPanel = ({ 
    activeTask, 
    timeLeft, 
    isRunning,
    stats,
    onFocusNow,
    onToggleTimer,
    onCompleteTask
}) => {
    return (
        <div className="focus-panel">
            <div className="focus-header">
                <div className="focus-label">Active Focus</div>
                {activeTask ? (
                    <div className="current-task-name">{activeTask.name}</div>
                ) : (
                    <div className="current-task-name" style={{color: 'var(--text-muted)'}}>
                        Start a task
                    </div>
                )}
            </div>

            {activeTask && (
                <button className="blitz-now-btn" onClick={onFocusNow}>
                    🎯 FOCUS NOW
                </button>
            )}

            <div className="timer-display">
                <div className="timer-time">
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="timer-controls">
                {activeTask && (
                    <>
                        <button
                            className={`control-btn ${isRunning ? 'active' : ''}`}
                            onClick={onToggleTimer}
                        >
                            {isRunning ? '⏸' : '▶'}
                        </button>
                        <button
                            className="control-btn complete"
                            onClick={onCompleteTask}
                        >
                            ✓
                        </button>
                    </>
                )}
            </div>

            <div className="progress-section">
                <div className="progress-label">Overall Progress</div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: stats.total > 0
                                ? `${(stats.completed / stats.total) * 100}%`
                                : '0%'
                        }}
                    />
                </div>
                <div className="progress-stats">
                    <div className="stat">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">DONE</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">TOTAL</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{stats.totalTimeSpent}</span>
                        <span className="stat-label">MIN</span>
                    </div>
                </div>
            </div>
        </div>
    );
};