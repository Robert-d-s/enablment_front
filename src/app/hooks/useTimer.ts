import { useState, useEffect, useRef } from "react";
import { differenceInSeconds, format } from "date-fns";
import type { TimerState } from "../types";

export const useTimer = (): TimerState => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");
  const timerRef = useRef<number | null>(null);

  const updateDisplay = () => {
    if (!startTime) return;
    const now = new Date();
    const elapsedSeconds = differenceInSeconds(now, startTime);
    const formattedTime = format(
      new Date(0, 0, 0, 0, 0, elapsedSeconds),
      "HH:mm:ss"
    );
    setDisplayTime(formattedTime);
  };

  useEffect(() => {
    if (isRunning && startTime) {
      timerRef.current = window.setInterval(updateDisplay, 1000);
    } else if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, startTime]);

  const start = () => {
    if (!startTime) setStartTime(new Date());
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setStartTime(null);
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
};
