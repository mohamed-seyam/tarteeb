const { useState, useEffect } = React;
import { STORAGE_KEYS } from '../constants/index.js';
import { saveToStorage, loadFromStorage } from '../utils/helpers.js';

export const useTasks = () => {
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