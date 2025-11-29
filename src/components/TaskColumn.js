const { React } = window;
import { TaskItem } from './TaskItem.js';

export const TaskColumn = ({ 
    title, 
    icon, 
    tasks, 
    status, 
    showDate,
    emptyMessage,
    onDragOver,
    onDragLeave,
    onDrop,
    onStartTask,
    onDeleteTask,
    onDragStart,
    onDragEnd
}) => {
    return (
        <div className="task-column">
            <div className="column-header">
                <div className="column-title">
                    <span className="column-icon">{icon}</span>
                    {title}
                </div>
                <div className="column-count">{tasks.length}</div>
            </div>
            <div
                className="task-list"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, status)}
            >
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-text">{emptyMessage}</div>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            showDate={showDate}
                            onStart={onStartTask}
                            onDelete={onDeleteTask}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))
                )}
            </div>
        </div>
    );
};