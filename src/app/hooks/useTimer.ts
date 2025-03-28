import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import type { TimerState } from "../types";
import { useTimerStore } from "@/app/lib/timerStore";

export const useTimer = (): TimerState & {
  initialStartTime: Date | null;
  pauseTimes: Date[];
  resumeTimes: Date[];
  calculateTotalActiveTime: () => number;
} => {
  // --- Get state and actions from the Zustand store ---
  const { isRunning, initialStartTimeISO, pauseTimesISO, resumeTimesISO } =
    useTimerStore();

  const {
    setTimerRunning,
    setInitialStartTime: setInitialStartTimeInStore,
    addPauseTime: addPauseTimeToStore,
    addResumeTime: addResumeTimeToStore,
    resetTimerState: resetTimerStateInStore,
  } = useTimerStore();

  // --- Local state for display only ---
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");
  const timerRef = useRef<number | null>(null);

  // --- Derive Date objects from ISO strings using useMemo ---
  const initialStartTime = useMemo(
    () => (initialStartTimeISO ? new Date(initialStartTimeISO) : null),
    [initialStartTimeISO]
  );

  const pauseTimes = useMemo(
    () => pauseTimesISO.map((iso) => new Date(iso)),
    [pauseTimesISO]
  );

  const resumeTimes = useMemo(
    () => resumeTimesISO.map((iso) => new Date(iso)),
    [resumeTimesISO]
  );

  // --- Calculation Logic (Timestamp-based) ---
  const calculateTotalActiveTime = useCallback((): number => {
    const now = new Date();
    if (!initialStartTime) {
      return 0;
    }

    let totalMs = 0;
    let segmentStart = initialStartTime;

    for (let i = 0; i < pauseTimes.length; i++) {
      const pauseTime = pauseTimes[i];
      if (pauseTime.getTime() < segmentStart.getTime()) continue;
      totalMs += pauseTime.getTime() - segmentStart.getTime();

      if (i < resumeTimes.length) {
        if (resumeTimes[i].getTime() < pauseTime.getTime()) continue;
        segmentStart = resumeTimes[i];
      } else {
        // Currently paused
        return Math.max(totalMs, 0);
      }
    }

    if (isRunning) {
      // Use isRunning from store
      if (now.getTime() >= segmentStart.getTime()) {
        totalMs += now.getTime() - segmentStart.getTime();
      }
    }
    return Math.max(totalMs, 0);
  }, [initialStartTime, pauseTimes, resumeTimes, isRunning]);

  // --- Update Display Logic ---
  const updateDisplay = useCallback(() => {
    const elapsedMs = calculateTotalActiveTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const formattedTime = format(
      new Date(0, 0, 0, 0, 0, elapsedSeconds),
      "HH:mm:ss"
    );
    setDisplayTime(formattedTime);
  }, [calculateTotalActiveTime]);

  // --- Effect for Initial Display pn Mount/Rehydration ---
  useEffect(() => {
    console.log("useTimer Mount Effect: Setting initial display time.");
    // Caslculate the time based on the state as it was loaded
    const initialElapsedMs = calculateTotalActiveTime();
    const initialElapsedSeconds = Math.floor(initialElapsedMs / 1000);
    const initialFormatedTime = format(
      new Date(0, 0, 0, 0, 0, initialElapsedSeconds),
      "HH:mm:ss"
    );
    setDisplayTime(initialFormatedTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Effect for Interval (Reads `isRunning` from store) ---
  useEffect(() => {
    if (isRunning) {
      console.log(
        "useTimer Effect: isRunning is true, starting/checking interval."
      );
      updateDisplay(); // Update display immediately on load if running
      // Ensure interval isn't already running before setting a new one
      if (timerRef.current === null) {
        timerRef.current = window.setInterval(updateDisplay, 1000);
        console.log(
          "useTimer Effect: Interval started with ID:",
          timerRef.current
        );
      }
    } else if (!isRunning && timerRef.current !== null) {
      console.log(
        "useTimer Effect: isRunning is false, clearing interval ID:",
        timerRef.current
      );
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cleanup interval on unmount or if isRunning becomes false
    return () => {
      if (timerRef.current !== null) {
        console.log(
          "useTimer Effect: Cleanup clearing interval ID:",
          timerRef.current
        );
        clearInterval(timerRef.current);
        timerRef.current = null; // Ensure ref is cleared on cleanup
      }
    };
  }, [isRunning, updateDisplay]); // Depend on isRunning from store and the memoized updateDisplay

  // --- Control Functions (Dispatch actions to the store) ---
  const start = () => {
    const now = new Date();
    // Use getState() for checking non-reactive state within an action if needed,
    // but here we can rely on the values from the hook selector.
    if (!initialStartTimeISO) {
      console.log("useTimer start: Setting initial time in store.");
      setInitialStartTimeInStore(now);
    } else if (!isRunning) {
      console.log("useTimer start: Adding resume time to store.");
      addResumeTimeToStore(now);
    }
    console.log("useTimer start: Setting isRunning=true in store.");
    setTimerRunning(true);
  };

  const pause = () => {
    if (isRunning) {
      // Check store value via hook selector
      console.log(
        "useTimer pause: Adding pause time and setting isRunning=false in store."
      );
      addPauseTimeToStore(new Date());
      setTimerRunning(false);
    } else {
      console.log("useTimer pause: Called when not running, doing nothing.");
    }
  };

  const reset = () => {
    console.log("useTimer reset: Calling resetTimerStateInStore.");
    resetTimerStateInStore(); // Resets store state: isRunning, times, ids, etc.
    setDisplayTime("00:00:00"); // Reset local display
  };

  // Handle manual setting via DatePicker
  const handleManualSetStartTime = (date: Date | null) => {
    console.log("useTimer handleManualSetStartTime:", date?.toISOString());
    if (isRunning) {
      // Check store value via hook selector
      pause(); // Dispatch pause action to store
    }
    // Reset store history and set new start time via store actions
    resetTimerStateInStore(); // Clear previous times/state in store
    setInitialStartTimeInStore(date); // Set new start time in store
    if (!isRunning) {
      // Check store value again after potential pause
      setDisplayTime("00:00:00");
    }
  };

  // --- Return the hook's public API ---
  return {
    isRunning, // From store
    startTime: initialStartTime, // Derived Date object
    displayTime, // Local display state
    start, // Dispatcher function
    pause, // Dispatcher function
    reset, // Dispatcher function
    setStartTime: handleManualSetStartTime, // Dispatcher function
    // Provide derived Date objects
    initialStartTime: initialStartTime,
    pauseTimes: pauseTimes,
    resumeTimes: resumeTimes,
    calculateTotalActiveTime, // The calculation function
  };
};
