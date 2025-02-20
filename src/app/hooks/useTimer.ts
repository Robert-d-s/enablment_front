"use client";

import { useState, useEffect, useRef } from "react";
import { differenceInSeconds, format, isValid } from "date-fns";

export interface UseTimerReturn {
  isRunning: boolean;
  startTime: Date | null;
  displayTime: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setStartTime: (date: Date | null) => void;
}

export function useTimer(initialStartTime: Date | null = null): UseTimerReturn {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(initialStartTime);
  const [pauseTimes, setPauseTimes] = useState<Date[]>([]);
  const [resumeTimes, setResumeTimes] = useState<Date[]>([]);
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");

  // In browsers, setInterval returns a number.
  const timerIntervalRef = useRef<number | null>(null);

  const calculateElapsedTime = (): number => {
    const now = new Date();
    if (!startTime || !isValid(startTime)) return 0;
    let elapsedSeconds = differenceInSeconds(now, startTime);
    pauseTimes.forEach((pauseTime, index) => {
      const resumeTime = resumeTimes[index] ?? now;
      if (isValid(pauseTime) && isValid(resumeTime)) {
        elapsedSeconds -= differenceInSeconds(resumeTime, pauseTime);
      }
    });
    return Math.max(elapsedSeconds, 0);
  };

  const updateDisplay = (): void => {
    const elapsedSeconds = calculateElapsedTime();
    const formattedTime = format(
      new Date(0, 0, 0, 0, 0, elapsedSeconds),
      "HH:mm:ss"
    );
    setDisplayTime(formattedTime);
  };

  useEffect(() => {
    if (isRunning && startTime && isValid(startTime)) {
      updateDisplay();
      timerIntervalRef.current = window.setInterval(updateDisplay, 1000);
      return () => {
        if (timerIntervalRef.current !== null) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [isRunning, startTime, pauseTimes, resumeTimes]);

  const start = (): void => {
    const now = new Date();
    if (!startTime) {
      setStartTime(now);
    }
    setIsRunning(true);
    if (pauseTimes.length !== resumeTimes.length) {
      setResumeTimes((prev) => [...prev, now]);
    }
  };

  const pause = (): void => {
    const now = new Date();
    if (startTime && isValid(startTime)) {
      setPauseTimes((prev) => [...prev, now]);
    }
    setIsRunning(false);
  };

  const reset = (): void => {
    setIsRunning(false);
    setStartTime(null);
    setPauseTimes([]);
    setResumeTimes([]);
    setDisplayTime("00:00:00");
  };

  return {
    isRunning,
    startTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime,
  };
}
