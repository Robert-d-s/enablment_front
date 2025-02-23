import { useState, useEffect, useRef } from "react";
import { differenceInSeconds, format } from "date-fns";
import type { TimerState } from "../types";

export const useTimer = (): TimerState => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  // We'll keep the "official" start time in both state and a ref.
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");
  const startTimeRef = useRef<Date | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState<number>(0); // accumulated paused time in seconds
  const timerRef = useRef<number | null>(null);

  // We still store startTime in state for dependency tracking if needed.
  const [startTime, setStartTime] = useState<Date | null>(null);

  const updateDisplay = () => {
    if (!startTimeRef.current) return;
    const now = new Date();
    const elapsedSeconds =
      elapsedBeforePause + differenceInSeconds(now, startTimeRef.current);
    const formattedTime = format(
      new Date(0, 0, 0, 0, 0, elapsedSeconds),
      "HH:mm:ss"
    );
    console.log(
      "Updating display. Elapsed seconds:",
      elapsedSeconds,
      "Formatted time:",
      formattedTime
    );
    setDisplayTime(formattedTime);
  };

  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      console.log("Timer started, setting interval");
      timerRef.current = window.setInterval(updateDisplay, 1000);
    } else if (!isRunning && timerRef.current) {
      console.log("Timer paused or stopped, clearing interval");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log("Cleaning up interval");
      }
    };
  }, [isRunning, elapsedBeforePause]);

  const start = () => {
    // When resuming, set the new start time immediately in the ref.
    const newStartTime = new Date();
    console.log("Starting/resuming timer, new startTime:", newStartTime);
    startTimeRef.current = newStartTime;
    setStartTime(newStartTime);
    setIsRunning(true);
  };

  const pause = () => {
    if (isRunning && startTimeRef.current) {
      const now = new Date();
      const elapsed = differenceInSeconds(now, startTimeRef.current);
      console.log("Pausing timer. Elapsed this run:", elapsed, "seconds");
      setElapsedBeforePause((prev) => {
        const newElapsed = prev + elapsed;
        console.log(
          "Total elapsedBeforePause updated to:",
          newElapsed,
          "seconds"
        );
        return newElapsed;
      });
    }
    setIsRunning(false);
  };

  const reset = () => {
    console.log("Resetting timer");
    setIsRunning(false);
    startTimeRef.current = null;
    setStartTime(null);
    setElapsedBeforePause(0);
    setDisplayTime("00:00:00");
  };

  return {
    isRunning,
    startTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime, // Although now startTimeRef is used, you may still want to expose the setter if needed.
  };
};
