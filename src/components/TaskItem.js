const { React } = window;
import { formatDate } from '../utils/helpers.js';

export const TaskItem = ({ task, showDate, onStart, onDelete, onDragStart, onDragEnd }) => {
    return (
        <div
            className="task-item"
            draggable
            onDragStart={(e) => onDragStart(e, task)}
            onDragEnd={onDragEnd}
        >
            <div className="drag-handle">⋮⋮</div>
            <div className="task-content">
                <div className="task-name">{task.name}</div>
                <div className="task-meta">
                    <span className="task-time">{task.estimatedMinutes}m</span>
                    {showDate && <span className="task-date">{formatDate(task.scheduledDate)}</span>}
                </div>
            </div>
            <div className="task-actions">
                {task.status !== 'done' && task.status !== 'progress' && (
                    <button className="task-btn" onClick={() => onStart(task)}>
                        Start
                    </button>
                )}
                <button className="task-btn delete" onClick={() => onDelete(task.id)}>
                    ×
                </button>
            </div>
        </div>
    );
};