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
    // --- Logging Start ---
    console.log(
      `\n--- Calculating Time (${isRunning ? "Running" : "Paused"}) ---`
    );
    console.log(`Now: ${now.toISOString()}`);
    console.log(`Initial Start: ${initialStartTime?.toISOString() ?? "null"}`);
    console.log(
      `Pause Times: [${pauseTimes.map((d) => d.toISOString()).join(", ")}]`
    );
    console.log(
      `Resume Times: [${resumeTimes.map((d) => d.toISOString()).join(", ")}]`
    );
    // --- Logging End ---
    if (!initialStartTime) {
      console.log(`Calc Result: No initial start time, returning 0ms`);
      return 0;
    }

    let totalMs = 0;
    let segmentStart = initialStartTime;

    for (let i = 0; i < pauseTimes.length; i++) {
      const pauseTime = pauseTimes[i];
      if (pauseTime.getTime() < segmentStart.getTime()) {
        console.warn(
          `Calc Warning: Pause time ${i} (${pauseTime.toISOString()}) is before segment start (${segmentStart.toISOString()}). Skipping segment calculation.`
        );
        if (i < resumeTimes.length) {
          const resumeTime = resumeTimes[i];
          if (resumeTime.getTime() >= pauseTime.getTime()) {
            segmentStart = resumeTime;
            console.log(
              `Calc Recovery: Advanced segmentStart to resume time ${i}: ${segmentStart.toISOString()}`
            );
          } else {
            console.error(
              `Calc Error: Resume time ${i} (${resumeTime.toISOString()}) is before pause time ${i} (${pauseTime.toISOString()}). State invalid.`
            );
            return Math.max(totalMs, 0);
          }
        } else {
          console.error(
            `Calc Error: Pause time ${i} (${pauseTime.toISOString()}) before segment start (${segmentStart.toISOString()}) with no corresponding resume. State invalid.`
          );
          return Math.max(totalMs, 0);
        }
        continue;
      }

      // Calculate duration for this valid segment
      const segmentDuration = pauseTime.getTime() - segmentStart.getTime();
      totalMs += segmentDuration;
      console.log(
        `Calc Segment ${i}: Start=${segmentStart.toISOString()}, Pause=${pauseTime.toISOString()}, Duration=${segmentDuration}ms, AccTotal=${totalMs}ms`
      );

      // Check if there's a corresponding resume time to start the next segment
      if (i < resumeTimes.length) {
        const resumeTime = resumeTimes[i];
        // Basic sanity check: Resume should happen after Pause
        if (resumeTime.getTime() < pauseTime.getTime()) {
          console.warn(
            `Calc Warning: Resume time ${i} (${resumeTime.toISOString()}) is before pause time ${i} (${pauseTime.toISOString()}). Calculation stops here as if still paused.`
          );
          // Treat as if still paused
          console.log(
            `Calc Result: Returning ${totalMs}ms (invalid resume time ${i})`
          );
          return Math.max(totalMs, 0);
        }
        // Set the start for the next potential segment
        segmentStart = resumeTime;
        console.log(
          `Calc: Next segment starts at resume time ${i}: ${segmentStart.toISOString()}`
        );
      } else {
        // This was the last pause, and we haven't resumed. Timer is currently paused.
        console.log(
          `Calc Result: Returning ${totalMs}ms (currently paused after pause ${i})`
        );
        return Math.max(totalMs, 0);
      }
    }

    if (isRunning) {
      if (now.getTime() >= segmentStart.getTime()) {
        const finalSegmentDuration = now.getTime() - segmentStart.getTime();
        totalMs += finalSegmentDuration;
        console.log(
          `Calc: Added final running segment duration: ${finalSegmentDuration}ms (from ${segmentStart.toISOString()} to ${now.toISOString()})`
        );
      } else {
        console.warn(
          `Calc Warning: 'Now' (${now.toISOString()}) is before last segment start (${segmentStart.toISOString()}). Final segment duration is 0. Check system clock or state logic.`
        );
      }
    } else {
      console.log(
        `Calc: Loop finished, timer is not running. Total calculated in loop: ${totalMs}ms`
      );
    }

    console.log(`Calc Final Result: ${totalMs}ms`);
    console.log(`-------------------------------------`);
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
      updateDisplay();
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
        timerRef.current = null;
      }
    };
  }, [isRunning, updateDisplay]);

  // --- Control Functions (Dispatch actions to the store) ---
  const start = () => {
    const now = new Date();
    // Check Zustand state directly for most up-to-date values before dispatching
    const {
      isRunning: currentlyRunning,
      initialStartTimeISO: currentInitialISO,
      pauseTimesISO: currentPausesISO,
      resumeTimesISO: currentResumesISO,
    } = useTimerStore.getState();

    if (!currentInitialISO) {
      console.log("useTimer start: Setting initial time in store.");
      setInitialStartTimeInStore(now);
    } else if (!currentlyRunning) {
      if (currentPausesISO.length > currentResumesISO.length) {
        console.log("useTimer start: Adding RESUME time to store.");
        addResumeTimeToStore(now);
      } else {
        console.log(
          "useTimer start: Starting timer (not resuming from a pause)."
        );
      }
    } else {
      console.log(
        "useTimer start: Called while already running. Doing nothing."
      );
      return;
    }
    console.log("useTimer start: Setting isRunning=true in store.");
    setTimerRunning(true);
  };

  const pause = () => {
    if (isRunning) {
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
    resetTimerStateInStore();
    setDisplayTime("00:00:00");
  };

  const handleManualSetStartTime = (date: Date | null) => {
    console.log("useTimer handleManualSetStartTime:", date?.toISOString());
    const currentlyRunning = useTimerStore.getState().isRunning;
    if (currentlyRunning) {
      // Need to pause first *before* resetting state
      console.log("Pausing before manual time set...");
      addPauseTimeToStore(new Date());
      setTimerRunning(false);
    }
    // Now reset the rest of the state and set the new start time
    console.log("Resetting state and setting new start time in store...");
    resetTimerStateInStore();
    setInitialStartTimeInStore(date);
    setDisplayTime("00:00:00");
  };

  return {
    isRunning,
    startTime: initialStartTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime: handleManualSetStartTime,
    initialStartTime: initialStartTime,
    pauseTimes: pauseTimes,
    resumeTimes: resumeTimes,
    calculateTotalActiveTime,
  };
};
