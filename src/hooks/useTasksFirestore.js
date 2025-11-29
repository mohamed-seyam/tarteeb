const { React } = window;

export const useTasks = (userId) => {
    const [tasks, setTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Subscribe to user's tasks in Firestore
    React.useEffect(() => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Subscribe to Firestore collection for this user
        const unsubscribe = firebase.firestore()
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

    // Add a new task
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

            await firebase.firestore()
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .add(newTask);
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    };

    // Delete a task
    const deleteTask = async (taskId) => {
        if (!userId) return;

        try {
            await firebase.firestore()
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

    // Move task to different status
    const moveTask = async (taskId, newStatus) => {
        if (!userId) return;

        try {
            await firebase.firestore()
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

    // Complete a task
    const completeTask = async (taskId, additionalTimeSpent) => {
        if (!userId) return;

        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            await firebase.firestore()
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

    // Get tasks by status (from local state)
    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    // Get task statistics (from local state)
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
