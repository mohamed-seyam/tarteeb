// Get React from window
const { React, ReactDOM } = window;
const { useState, useEffect, useRef } = React;

// ============= CONSTANTS =============
const TASK_STATUS = {
    WEEK: 'week',
    TODAY: 'today',
    PROGRESS: 'progress',
    DONE: 'done'
};

const STORAGE_KEYS = {
    TASKS: 'tarteeb-tasks-v1'
};

const DEFAULTS = {
    TIME_ESTIMATE: '25',
    TIMER_SECONDS: 0
};

const TASK_COLUMNS = [
    {
        id: TASK_STATUS.WEEK,
        title: 'Week',
        icon: '📅',
        showDate: true,
        emptyMessage: 'Add tasks for the week'
    },
    {
        id: TASK_STATUS.TODAY,
        title: 'Today',
        icon: '☀️',
        showDate: false,
        emptyMessage: 'Drag tasks here'
    },
    {
        id: TASK_STATUS.PROGRESS,
        title: 'In Progress',
        icon: '⚡',
        showDate: false,
        emptyMessage: 'Start a task'
    },
    {
        id: TASK_STATUS.DONE,
        title: 'Done',
        icon: '✓',
        showDate: false,
        emptyMessage: 'Completed tasks'
    }
];

// ============= HELPERS =============
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

const playCompletionSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error('Failed to play sound:', error);
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
};

const loadFromStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
};

// ============= HOOKS =============
const useTasks = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const savedTasks = loadFromStorage(STORAGE_KEYS.TASKS);
        if (savedTasks) {
            setTasks(savedTasks);
        }
    }, []);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.TASKS, tasks);
    }, [tasks]);

    const addTask = (taskData) => {
        const newTask = {
            id: Date.now(),
            name: taskData.name,
            estimatedMinutes: parseInt(taskData.estimatedMinutes),
            scheduledDate: taskData.scheduledDate,
            status: 'week',
            completed: false,
            timeSpent: 0,
            createdAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, newTask]);
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const moveTask = (taskId, newStatus) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    const completeTask = (taskId, additionalTimeSpent) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId
                ? {
                    ...task,
                    status: 'done',
                    completed: true,
                    timeSpent: task.timeSpent + Math.floor(additionalTimeSpent / 60)
                  }
                : task
        ));
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const getTaskStats = () => {
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            totalTimeSpent: tasks.reduce((sum, t) => sum + t.timeSpent, 0)
        };
    };

    return {
        tasks,
        addTask,
        deleteTask,
        moveTask,
        completeTask,
        getTasksByStatus,
        getTaskStats
    };
};

const useTimer = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        playCompletionSound();
                        return 0;
                    }
                    return prev - 1;
                });
                setTimeSpent(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft]);

    const startTimer = (seconds) => {
        setTimeLeft(seconds);
        setTimeSpent(0);
        setIsRunning(false);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(0);
        setTimeSpent(0);
    };

    return {
        isRunning,
        timeLeft,
        timeSpent,
        startTimer,
        toggleTimer,
        resetTimer,
        setIsRunning
    };
};

// ============= COMPONENTS =============
const TaskItem = ({ task, showDate, onStart, onDelete, onDragStart, onDragEnd }) => {
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

const TaskColumn = ({
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

const FocusPanel = ({
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

const FocusMode = ({
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

const AddTaskForm = ({ onAddTask }) => {
    const [taskInput, setTaskInput] = useState('');
    const [timeInput, setTimeInput] = useState(DEFAULTS.TIME_ESTIMATE);
    const [dateInput, setDateInput] = useState('');

    useEffect(() => {
        setDateInput(getTodayDate());
    }, []);

    const handleSubmit = () => {
        if (taskInput.trim() && timeInput && dateInput) {
            onAddTask({
                name: taskInput.trim(),
                estimatedMinutes: timeInput,
                scheduledDate: dateInput
            });
            setTaskInput('');
            setTimeInput(DEFAULTS.TIME_ESTIMATE);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="add-task-section">
            <div className="add-task-header">
                <span className="add-task-icon">➕</span>
                Add New Task
            </div>
            <input
                type="text"
                className="task-input"
                placeholder="What needs to be done?"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <div className="input-row">
                <input
                    type="number"
                    className="time-input"
                    placeholder="25"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    min="1"
                    max="999"
                />
                <input
                    type="date"
                    className="date-input"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                />
                <button className="add-btn" onClick={handleSubmit}>
                    Add Task
                </button>
            </div>
        </div>
    );
};

// ============= MAIN APP =============
function TarteebApp() {
    const {
        tasks,
        addTask,
        deleteTask,
        moveTask,
        completeTask: completeTaskInStore,
        getTasksByStatus,
        getTaskStats
    } = useTasks();

    const {
        isRunning,
        timeLeft,
        timeSpent,
        startTimer,
        toggleTimer,
        resetTimer,
        setIsRunning
    } = useTimer();

    const [activeTask, setActiveTask] = useState(null);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData('taskId', task.id.toString());
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e, targetStatus) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const taskId = parseInt(e.dataTransfer.getData('taskId'));
        const task = tasks.find(t => t.id === taskId);

        if (targetStatus === TASK_STATUS.PROGRESS && task) {
            handleStartTask(task);
        } else {
            moveTask(taskId, targetStatus);
        }
    };

    const handleStartTask = (task) => {
        if (task.status !== TASK_STATUS.PROGRESS) {
            moveTask(task.id, TASK_STATUS.PROGRESS);
        }
        setActiveTask(task);
        startTimer(task.estimatedMinutes * 60);
    };

    const handleCompleteTask = () => {
        if (activeTask) {
            completeTaskInStore(activeTask.id, timeSpent);
            setActiveTask(null);
            resetTimer();
            setIsFocusMode(false);
        }
    };

    const handleDeleteTask = (id) => {
        deleteTask(id);
        if (activeTask?.id === id) {
            setActiveTask(null);
            resetTimer();
            setIsFocusMode(false);
        }
    };

    const handleEnterFocusMode = () => {
        if (activeTask) {
            setIsFocusMode(true);
            if (!isRunning) {
                setIsRunning(true);
            }
        }
    };

    const handleExitFocusMode = () => {
        setIsFocusMode(false);
    };

    const tasksByStatus = {};
    TASK_COLUMNS.forEach(column => {
        tasksByStatus[column.id] = getTasksByStatus(column.id);
    });

    const stats = getTaskStats();

    return (
        <div className="app-container">
            {isFocusMode && activeTask && (
                <FocusMode
                    task={activeTask}
                    timeLeft={timeLeft}
                    isRunning={isRunning}
                    onToggleTimer={toggleTimer}
                    onComplete={handleCompleteTask}
                    onExit={handleExitFocusMode}
                />
            )}

            {!isFocusMode && (
                <>
                    <header className="app-header">
                        <h1 className="app-title">Tarteeb</h1>
                        <p className="app-subtitle">Organize Your Tasks Smartly</p>
                    </header>

                    <AddTaskForm onAddTask={addTask} />

                    <div className="main-layout">
                        {TASK_COLUMNS.map(column => (
                            <TaskColumn
                                key={column.id}
                                title={column.title}
                                icon={column.icon}
                                tasks={tasksByStatus[column.id]}
                                status={column.id}
                                showDate={column.showDate}
                                emptyMessage={column.emptyMessage}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onStartTask={handleStartTask}
                                onDeleteTask={handleDeleteTask}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            />
                        ))}

                        <FocusPanel
                            activeTask={activeTask}
                            timeLeft={timeLeft}
                            isRunning={isRunning}
                            stats={stats}
                            onFocusNow={handleEnterFocusMode}
                            onToggleTimer={toggleTimer}
                            onCompleteTask={handleCompleteTask}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// ============= RENDER =============
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TarteebApp />);
