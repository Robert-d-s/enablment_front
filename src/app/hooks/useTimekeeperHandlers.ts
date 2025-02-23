// src/app/hooks/useTimeKeeperHandlers.ts
import { formatISO } from "date-fns";
import type { TimerState, TimeEntry } from "../types";

interface HandlersConfig {
  timerState: TimerState;
  selectedProject: string;
  selectedRate: string;
  userId: string;
  createTimeEntry: (variables: {
    timeInputCreate: Partial<TimeEntry>;
  }) => Promise<void>;
  showSuccessMessage: () => void;
  setSubmissionError: (error: string) => void;
  showDateAlert: (message: string) => void;
}

export const useTimeKeeperHandlers = ({
  timerState,
  selectedProject,
  selectedRate,
  userId,
  createTimeEntry,
  showSuccessMessage,
  setSubmissionError,
  showDateAlert,
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
    if (!timerState.startTime || !selectedProject || !userId || !selectedRate) {
      console.error("Missing required data for time entry.");
      return;
    }

    try {
      const submissionTime = new Date();
      const totalElapsedTime =
        submissionTime.getTime() - timerState.startTime.getTime();

      await createTimeEntry({
        timeInputCreate: {
          startTime: formatISO(timerState.startTime),
          endTime: formatISO(submissionTime),
          projectId: selectedProject,
          userId,
          rateId: parseFloat(selectedRate),
          totalElapsedTime,
        },
      });

      showSuccessMessage();
    } catch (error) {
      setSubmissionError(
        `Error with time entry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return {
    handleDateChange,
    handleSubmit,
  };
};
