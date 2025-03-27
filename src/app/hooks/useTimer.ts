import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import type { TimerState } from "../types";

export const useTimer = (): TimerState & {
  initialStartTime: Date | null;
  elapsedBeforePause: number;
  pauseTimes: Date[];
  resumeTimes: Date[];
  calculateTotalActiveTime: () => number; // Expose this function
} => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialStartTime, setInitialStartTime] = useState<Date | null>(null);
  const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");
  const [pauseTimes, setPauseTimes] = useState<Date[]>([]);
  const [resumeTimes, setResumeTimes] = useState<Date[]>([]);
  const timerRef = useRef<number | null>(null);

  // Function to calculate total active time
  const calculateTotalActiveTime = (): number => {
    const now = new Date();
    console.log("Calculating total active time at:", now.toISOString());

    // If timer has never started, return 0
    if (!initialStartTime) {
      console.log("No initial start time, returning 0");
      return 0;
    }

    console.log("Initial start time:", initialStartTime.toISOString());

    // Calculate total elapsed time since initial start
    let totalActiveTime = 0;

    // Add time from first segment (initial start to first pause, or now if no pauses)
    const firstPauseTime =
      pauseTimes.length > 0 ? pauseTimes[0] : isRunning ? now : null;

    if (firstPauseTime && initialStartTime) {
      const firstSegmentTime =
        firstPauseTime.getTime() - initialStartTime.getTime();
      console.log("First segment time (ms):", firstSegmentTime);
      totalActiveTime += firstSegmentTime;
    }

    // Add time from all resume-pause segments
    for (let i = 0; i < resumeTimes.length; i++) {
      const resumeTime = resumeTimes[i];
      // The end of this segment is either the next pause or now (if currently running)
      const endTime =
        i < pauseTimes.length - 1
          ? pauseTimes[i + 1]
          : isRunning && i === pauseTimes.length - 1
          ? now
          : null;

      if (endTime) {
        const segmentTime = endTime.getTime() - resumeTime.getTime();
        console.log(`Segment ${i + 1} time (ms):`, segmentTime);
        totalActiveTime += segmentTime;
      }
    }

    console.log("Total active time calculated (ms):", totalActiveTime);
    return Math.max(totalActiveTime, 0);
  };

  const updateDisplay = () => {
    const elapsedMs = calculateTotalActiveTime();
    // Convert milliseconds to seconds for formatting
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    // Format time as HH:MM:SS
    const formattedTime = format(
      new Date(0, 0, 0, 0, 0, elapsedSeconds),
      "HH:mm:ss"
    );

    console.log(
      "Updating display. Elapsed ms:",
      elapsedMs,
      "Formatted time:",
      formattedTime
    );

    setDisplayTime(formattedTime);
  };

  useEffect(() => {
    if (isRunning) {
      console.log("Timer started, setting interval");
      updateDisplay(); // Immediate update
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
  }, [isRunning, currentStartTime, pauseTimes, resumeTimes]);

  const start = () => {
    const now = new Date();

    if (!initialStartTime) {
      // First start
      console.log("Timer starting at:", now);
      setInitialStartTime(now);
      setCurrentStartTime(now);
    } else if (!isRunning) {
      // Resume after pause
      console.log("Resuming timer at:", now);
      setCurrentStartTime(now);
      // Record resume time
      setResumeTimes((prev) => [...prev, now]);
    }

    setIsRunning(true);
  };

  const pause = () => {
    if (isRunning) {
      const now = new Date();
      console.log("Pausing timer at:", now);

      // Record pause time
      setPauseTimes((prev) => [...prev, now]);

      setIsRunning(false);
    }
  };

  const reset = () => {
    console.log("Resetting timer");
    setIsRunning(false);
    setInitialStartTime(null);
    setCurrentStartTime(null);
    setElapsedBeforePause(0);
    setDisplayTime("00:00:00");
    setPauseTimes([]);
    setResumeTimes([]);
  };

  return {
    isRunning,
    startTime: currentStartTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime: (date: Date | null) => {
      if (date) {
        setCurrentStartTime(date);
        if (!initialStartTime) {
          setInitialStartTime(date);
        }
      }
    },
    initialStartTime,
    elapsedBeforePause,
    pauseTimes,
    resumeTimes,
    calculateTotalActiveTime, // Expose the calculation function
  };
};
