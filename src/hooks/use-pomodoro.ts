import { useState, useEffect, useCallback, useRef } from 'react';

export function usePomodoro(defaultMinutes = 25) {
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(defaultMinutes);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((mins?: number) => {
    const m = mins ?? totalMinutes;
    setTotalMinutes(m);
    setTimeLeft(m * 60);
    setIsRunning(false);
  }, [totalMinutes]);

  const progress = totalMinutes > 0 ? ((totalMinutes * 60 - timeLeft) / (totalMinutes * 60)) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return { minutes, seconds, isRunning, progress, start, pause, reset, timeLeft };
}
