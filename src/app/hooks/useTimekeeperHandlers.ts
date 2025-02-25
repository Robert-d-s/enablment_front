import { formatISO } from "date-fns";
import type { TimerState, TimeEntry } from "../types";

interface HandlersConfig {
  timerState: TimerState & {
    initialStartTime: Date | null;
    elapsedBeforePause: number;
    pauseTimes: Date[];
    resumeTimes: Date[];
  };
  selectedProject: string;
  selectedRate: string;
  userId: string;
  createTimeEntry: (options: {
    timeInputCreate: Partial<TimeEntry>;
  }) => Promise<{ data: { createTime: TimeEntry } }>;
  updateTime: (options: {
    timeInputUpdate: { id: number; endTime: string; totalElapsedTime: number };
  }) => Promise<{ data: { updateTime: TimeEntry } }>;
  currentEntryId: number | null;
  setCurrentEntryId: (id: number | null) => void;
  showSuccessMessage: () => void;
  setSubmissionError: (error: string) => void;
  showDateAlert: (message: string) => void;
  showResetMessage: () => void;
}

export const useTimeKeeperHandlers = ({
  timerState,
  selectedProject,
  selectedRate,
  userId,
  createTimeEntry,
  updateTime,
  currentEntryId,
  setCurrentEntryId,
  showSuccessMessage,
  setSubmissionError,
  showDateAlert,
  showResetMessage,
}: HandlersConfig) => {
  const handleDateChange = (date: Date | null): void => {
    const now = new Date();
    if (date && date > now) {
      showDateAlert("Please select a current or past date/time.");
    } else {
      timerState.setStartTime(date);
    }
  };

  // Function to calculate total active time for submission
  const calculateTotalActiveTime = (): number => {
    const now = new Date();

    // If timer has never started, return 0
    if (!timerState.initialStartTime) {
      return 0;
    }

    // Calculate total elapsed time since initial start
    let totalActiveTime = 0;

    // Add time from first segment (initial start to first pause, or now if no pauses)
    const firstPauseTime =
      timerState.pauseTimes.length > 0
        ? timerState.pauseTimes[0]
        : timerState.isRunning
        ? now
        : null;

    if (firstPauseTime && timerState.initialStartTime) {
      totalActiveTime +=
        firstPauseTime.getTime() - timerState.initialStartTime.getTime();
    }

    // Add time from all resume-pause segments
    for (let i = 0; i < timerState.resumeTimes.length; i++) {
      const resumeTime = timerState.resumeTimes[i];
      // The end of this segment is either the next pause or now (if currently running)
      const endTime =
        i < timerState.pauseTimes.length - 1
          ? timerState.pauseTimes[i + 1]
          : timerState.isRunning && i === timerState.pauseTimes.length - 1
          ? now
          : null;

      if (endTime) {
        totalActiveTime += endTime.getTime() - resumeTime.getTime();
      }
    }

    console.log("Total active time for submission:", totalActiveTime);
    return Math.max(totalActiveTime, 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !timerState.initialStartTime ||
      !selectedProject ||
      !userId ||
      !selectedRate
    ) {
      console.error("Missing required data for time entry.");
      return;
    }

    try {
      const submissionTime = new Date();

      // Calculate total elapsed time in milliseconds
      const totalElapsedTimeMs = calculateTotalActiveTime();
      console.log(
        "Total elapsed time calculated for submission (ms):",
        totalElapsedTimeMs
      );

      if (currentEntryId) {
        // Update existing time entry
        await updateTime({
          timeInputUpdate: {
            id: currentEntryId,
            endTime: formatISO(submissionTime),
            totalElapsedTime: totalElapsedTimeMs,
          },
        });
        console.log("Updated existing time entry ID:", currentEntryId);
      } else {
        // Create new time entry and store its ID
        const result = await createTimeEntry({
          timeInputCreate: {
            startTime: formatISO(timerState.initialStartTime),
            endTime: formatISO(submissionTime),
            projectId: selectedProject,
            userId,
            rateId: parseFloat(selectedRate),
            totalElapsedTime: totalElapsedTimeMs,
          },
        });
        setCurrentEntryId(result.data.createTime.id);
        console.log("Created new time entry ID:", result.data.createTime.id);
      }

      showSuccessMessage();

      // IMPORTANT: Don't reset the timer after submission!
      // Just pause it if it's running
      if (timerState.isRunning) {
        timerState.pause();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmissionError(`Error with time entry: ${error.message}`);
      } else {
        setSubmissionError("Unknown error");
      }
      console.error("Error submitting time entry:", error);
    }
  };

  const handleReset = (): void => {
    timerState.reset();
    setCurrentEntryId(null); // Clear the current entry ID on reset
    showResetMessage();
  };

  return {
    handleDateChange,
    handleSubmit,
    handleReset,
  };
};
