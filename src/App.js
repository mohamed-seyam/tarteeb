const { React, useState } = window;
import { useTasks } from './hooks/useTasks.js';
import { useTimer } from './hooks/useTimer.js';
import { TASK_COLUMNS, TASK_STATUS } from './constants/index.js';
import { AddTaskForm } from './components/AddTaskForm.js';
import { TaskColumn } from './components/TaskColumn.js';
import { FocusPanel } from './components/FocusPanel.js';
import { FocusMode } from './components/FocusMode.js';

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

ReactDOM.render(<TarteebApp />, document.getElementById('root'));