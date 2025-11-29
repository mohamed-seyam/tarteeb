// Get React from window
const { React, ReactDOM } = window;
const { useState, useEffect, useRef } = React;

// ============= FIREBASE CONFIG =============
const firebaseConfig = {
    apiKey: "AIzaSyCFhNY1HHhUDfzZy9ze7Jd_VldGWRq_zuI",
    authDomain: "tarteeb-b6ab3.firebaseapp.com",
    projectId: "tarteeb-b6ab3",
    storageBucket: "tarteeb-b6ab3.firebasestorage.app",
    messagingSenderId: "227305151004",
    appId: "1:227305151004:web:0f85c13999599707701dd9",
    measurementId: "G-SG9TTZVV6B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ============= CONSTANTS =============
const TASK_STATUS = {
    WEEK: 'week',
    TODAY: 'today',
    PROGRESS: 'progress',
    DONE: 'done'
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

const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return 'An error occurred. Please try again.';
    }
};

// ============= HOOKS =============

// useAuth Hook
const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const result = await auth.createUserWithEmailAndPassword(email, password);
            return result.user;
        } catch (err) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const result = await auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (err) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await auth.signOut();
        } catch (err) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        }
    };

    return {
        user,
        loading,
        error,
        signup,
        login,
        logout
    };
};

// useTasks Hook with Firestore
const useTasks = (userId) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = db
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const tasksData = [];
                snapshot.forEach((doc) => {
                    tasksData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setTasks(tasksData);
                setLoading(false);
            }, (error) => {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            });

        return unsubscribe;
    }, [userId]);

    const addTask = async (taskData) => {
        if (!userId) return;

        try {
            const newTask = {
                name: taskData.name,
                estimatedMinutes: parseInt(taskData.estimatedMinutes),
                scheduledDate: taskData.scheduledDate,
                status: 'week',
                completed: false,
                timeSpent: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .add(newTask);
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    };

    const deleteTask = async (taskId) => {
        if (!userId) return;

        try {
            await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .doc(taskId)
                .delete();
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    };

    const moveTask = async (taskId, newStatus) => {
        if (!userId) return;

        try {
            await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .doc(taskId)
                .update({ status: newStatus });
        } catch (error) {
            console.error('Error moving task:', error);
            throw error;
        }
    };

    const completeTask = async (taskId, additionalTimeSpent) => {
        if (!userId) return;

        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            await db
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .doc(taskId)
                .update({
                    status: 'done',
                    completed: true,
                    timeSpent: task.timeSpent + Math.floor(additionalTimeSpent / 60)
                });
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
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
        loading,
        addTask,
        deleteTask,
        moveTask,
        completeTask,
        getTasksByStatus,
        getTaskStats
    };
};

// useTimer Hook
const useTimer = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(DEFAULTS.TIMER_SECONDS);
    const [timeSpent, setTimeSpent] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                setTimeSpent(prev => prev + 1);
            }, 1000);
        } else if (timeLeft === 0 && timeSpent > 0) {
            playCompletionSound();
            setIsRunning(false);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const startTimer = (seconds) => {
        setTimeLeft(seconds);
        setTimeSpent(0);
        setIsRunning(true);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(DEFAULTS.TIMER_SECONDS);
        setTimeSpent(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
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

// AuthForm Component
const AuthForm = ({ onLogin, onSignup, error, loading }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isLogin && password !== confirmPassword) {
            return;
        }

        if (isLogin) {
            onLogin(email, password);
        } else {
            onSignup(email, password);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Tarteeb</h1>
                    <p className="auth-subtitle">Organize Your Tasks Smartly</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="auth-form-title">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>

                    {!isLogin && (
                        <div className="auth-input-group">
                            <label className="auth-label">Confirm Password</label>
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            {password !== confirmPassword && confirmPassword && (
                                <span className="auth-error-text">Passwords don't match</span>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading || (!isLogin && password !== confirmPassword)}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>

                    <div className="auth-toggle">
                        <span className="auth-toggle-text">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        </span>
                        <button
                            type="button"
                            className="auth-toggle-btn"
                            onClick={toggleMode}
                            disabled={loading}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// TaskItem Component
const TaskItem = ({ task, onStart, onDelete, onDragStart, onDragEnd }) => {
    return (
        <div
            className="task-item"
            draggable="true"
            onDragStart={(e) => onDragStart(e, task)}
            onDragEnd={onDragEnd}
        >
            <div className="task-item-header">
                <span className="drag-handle">⋮⋮</span>
                <span className="task-name">{task.name}</span>
            </div>
            <div className="task-item-footer">
                <span className="task-time">⏱ {task.estimatedMinutes}m</span>
                {task.scheduledDate && (
                    <span className="task-date">{formatDate(task.scheduledDate)}</span>
                )}
                <div className="task-item-actions">
                    <button className="task-action-btn start" onClick={() => onStart(task)}>
                        ▶
                    </button>
                    <button className="task-action-btn delete" onClick={() => onDelete(task.id)}>
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

// TaskColumn Component
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
        <div
            className="task-column"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className="column-header">
                <span className="column-icon">{icon}</span>
                <span className="column-title">{title}</span>
                <span className="column-count">{tasks.length}</span>
            </div>
            <div className="column-tasks">
                {tasks.length === 0 ? (
                    <div className="empty-state">{emptyMessage}</div>
                ) : (
                    tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
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

// FocusPanel Component
const FocusPanel = ({ activeTask, timeLeft, isRunning, stats, onFocusNow, onToggleTimer, onCompleteTask }) => {
    return (
        <div className="focus-panel">
            <div className="panel-header">
                <span className="panel-icon">🎯</span>
                Focus Session
            </div>

            {activeTask ? (
                <div className="active-task-panel">
                    <div className="active-task-name">{activeTask.name}</div>
                    <div className="timer-display">{formatTime(timeLeft)}</div>
                    <div className="timer-controls">
                        <button className={`control-btn ${isRunning ? 'active' : ''}`} onClick={onToggleTimer}>
                            {isRunning ? '⏸ Pause' : '▶ Start'}
                        </button>
                        <button className="control-btn complete" onClick={onCompleteTask}>
                            ✓ Done
                        </button>
                    </div>
                    <button className="focus-now-btn" onClick={onFocusNow}>
                        FOCUS NOW
                    </button>
                </div>
            ) : (
                <div className="no-active-task">
                    <p>No active task</p>
                    <p className="hint">Drag a task to "In Progress" to start</p>
                </div>
            )}

            <div className="stats-section">
                <div className="stat-item">
                    <span className="stat-value">{stats.completed}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Tasks</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.totalTimeSpent}</span>
                    <span className="stat-label">Minutes</span>
                </div>
            </div>
        </div>
    );
};

// FocusMode Component
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

// AddTaskForm Component
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
    const { user, loading: authLoading, error: authError, login, signup, logout } = useAuth();

    const {
        tasks,
        loading: tasksLoading,
        addTask,
        deleteTask,
        moveTask,
        completeTask: completeTaskInStore,
        getTasksByStatus,
        getTaskStats
    } = useTasks(user?.uid);

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

    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleSignup = async (email, password) => {
        try {
            await signup(email, password);
        } catch (error) {
            console.error('Signup failed:', error);
        }
    };

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

        const taskId = e.dataTransfer.getData('taskId');
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

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Show auth form if user is not logged in
    if (!user) {
        return (
            <AuthForm
                onLogin={handleLogin}
                onSignup={handleSignup}
                error={authError}
                loading={authLoading}
            />
        );
    }

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
                        <div>
                            <h1 className="app-title">Tarteeb</h1>
                            <p className="app-subtitle">Organize Your Tasks Smartly</p>
                        </div>
                        <div className="user-info">
                            <span className="user-email">{user.email}</span>
                            <button className="logout-btn" onClick={logout}>
                                Logout
                            </button>
                        </div>
                    </header>

                    <AddTaskForm onAddTask={addTask} />

                    {tasksLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading tasks...</p>
                        </div>
                    ) : (
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
                    )}
                </>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TarteebApp />);
