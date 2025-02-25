import { useState, useEffect, useRef } from "react";
import { differenceInSeconds, format } from "date-fns";
import type { TimerState } from "../types";

export const useTimer = (): TimerState & {
  initialStartTime: Date | null;
  elapsedBeforePause: number;
} => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialStartTime, setInitialStartTime] = useState<Date | null>(null);
  const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");
  const timerRef = useRef<number | null>(null);

  const updateDisplay = () => {
    if (!currentStartTime) return;
    const now = new Date();
    const elapsedSeconds =
      elapsedBeforePause + differenceInSeconds(now, currentStartTime);
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
    if (isRunning && currentStartTime) {
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
  }, [isRunning, currentStartTime, elapsedBeforePause]);

  const start = () => {
    const now = new Date();
    if (!initialStartTime) {
      console.log("Timer starting at:", now);
      setInitialStartTime(now);
      setCurrentStartTime(now);
    } else if (!isRunning) {
      console.log(
        "Resuming timer; initialStartTime remains:",
        initialStartTime,
        "New currentStartTime:",
        now
      );
      setCurrentStartTime(now);
    }
    setIsRunning(true);
  };

  const pause = () => {
    if (isRunning && currentStartTime) {
      const now = new Date();
      const elapsed = differenceInSeconds(now, currentStartTime);
      console.log("Pausing timer. Elapsed this run:", elapsed, "seconds");
      setElapsedBeforePause((prev) => {
        const newTotal = prev + elapsed;
        console.log(
          "Total elapsedBeforePause updated to:",
          newTotal,
          "seconds"
        );
        return newTotal;
      });
    }
    setIsRunning(false);
  };

  const reset = () => {
    console.log("Resetting timer");
    setIsRunning(false);
    setInitialStartTime(null);
    setCurrentStartTime(null);
    setElapsedBeforePause(0);
    setDisplayTime("00:00:00");
  };

  return {
    isRunning,
    startTime: currentStartTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime: (date: Date | null) => {
      setCurrentStartTime(date);
      if (!initialStartTime) {
        setInitialStartTime(date);
      }
    },
    initialStartTime,
    elapsedBeforePause, // <-- Now returning this property
  };
};
