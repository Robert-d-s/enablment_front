import { formatISO } from "date-fns";
import type { TimerState, TimeEntry } from "../types";

interface HandlersConfig {
  timerState: TimerState & {
    initialStartTime: Date | null;
    elapsedBeforePause: number;
    pauseTimes: Date[];
    resumeTimes: Date[];
    calculateTotalActiveTime: () => number; // Use the function from useTimer
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

      // Use the calculation function from timerState
      const totalElapsedTimeMs = timerState.calculateTotalActiveTime();
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
    setCurrentEntryId(null);
    showResetMessage();
  };

  return {
    handleDateChange,
    handleSubmit,
    handleReset,
  };
};
