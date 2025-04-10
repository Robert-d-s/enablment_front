import { formatISO } from "date-fns";
import type { TimerState, TimeEntry } from "../types";

interface HandlersConfig {
  timerState: TimerState & {
    initialStartTime: Date | null;
    pauseTimes: Date[];
    resumeTimes: Date[];
    calculateTotalActiveTime: () => number;
  };
  selectedProject: string;
  selectedRate: string;
  userId: string;
  createTimeEntry: (data: {
    startTime: string;
    projectId: string;
    userId: number;
    rateId: number;
    totalElapsedTime: number;
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
      console.log("Submission time:", submissionTime.toISOString());

      const totalElapsedTimeMs = timerState.calculateTotalActiveTime();
      console.log(
        "Total elapsed time calculated for submission (ms):",
        totalElapsedTimeMs
      );
      console.log(
        "Total elapsed time in seconds:",
        Math.floor(totalElapsedTimeMs / 1000)
      );

      if (currentEntryId) {
        console.log("Updating existing time entry with ID:", currentEntryId);
        await updateTime({
          timeInputUpdate: {
            id: currentEntryId,
            endTime: formatISO(submissionTime),
            totalElapsedTime: totalElapsedTimeMs,
          },
        });
        console.log("Updated existing time entry ID:", currentEntryId);
      } else {
        console.log("Creating new time entry with data:", {
          startTime: formatISO(timerState.initialStartTime),
          projectId: selectedProject,
          userId: parseFloat(userId),
          rateId: parseFloat(selectedRate),
          totalElapsedTime: totalElapsedTimeMs,
        });

        try {
          const result = await createTimeEntry({
            startTime: formatISO(timerState.initialStartTime),
            projectId: selectedProject,
            userId: parseFloat(userId),
            rateId: parseFloat(selectedRate),
            totalElapsedTime: totalElapsedTimeMs,
          });
          console.log(
            "Success creating time entry with minimal required fields:",
            JSON.stringify(result, null, 2)
          );

          if (result?.data?.createTime?.id) {
            setCurrentEntryId(result.data.createTime.id);
            console.log("Set current entry ID to:", result.data.createTime.id);
          }
        } catch (err) {
          console.error("Failed to create time entry:", err);
          throw err;
        }
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
