// Task status constants
export const TASK_STATUS = {
    WEEK: 'week',
    TODAY: 'today',
    PROGRESS: 'progress',
    DONE: 'done'
};

// Local storage keys
export const STORAGE_KEYS = {
    TASKS: 'tarteeb-tasks-v1'
};

// Default values
export const DEFAULTS = {
    TIME_ESTIMATE: '25',
    TIMER_SECONDS: 0
};

// Task column configurations
export const TASK_COLUMNS = [
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