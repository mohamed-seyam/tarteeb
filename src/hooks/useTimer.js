const { useState, useEffect, useRef } = React;
import { playCompletionSound } from '../utils/helpers.js';

export const useTimer = () => {
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