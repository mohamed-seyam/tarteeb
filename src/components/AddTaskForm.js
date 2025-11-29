const { React, useState, useEffect } = window;
import { DEFAULTS } from '../constants/index.js';
import { getTodayDate } from '../utils/helpers.js';

export const AddTaskForm = ({ onAddTask }) => {
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