import { formatISO, differenceInSeconds } from "date-fns";
import type { TimerState, TimeEntry } from "../types";

interface HandlersConfig {
  timerState: TimerState & {
    initialStartTime: Date | null;
    elapsedBeforePause: number;
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
  setCurrentEntryId: (id: number) => void;
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
      const additionalElapsed = timerState.startTime
        ? differenceInSeconds(submissionTime, timerState.startTime)
        : 0;
      const totalElapsedTime =
        timerState.elapsedBeforePause + additionalElapsed;

      if (currentEntryId) {
        // Update existing time entry
        await updateTime({
          timeInputUpdate: {
            id: currentEntryId,
            endTime: formatISO(submissionTime),
            totalElapsedTime,
          },
        });
      } else {
        // Create new time entry and store its ID
        const result = await createTimeEntry({
          timeInputCreate: {
            startTime: formatISO(timerState.initialStartTime),
            endTime: formatISO(submissionTime),
            projectId: selectedProject,
            userId,
            rateId: parseFloat(selectedRate),
            totalElapsedTime,
          },
        });
        setCurrentEntryId(result.data.createTime.id);
      }
      showSuccessMessage();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmissionError(`Error with time entry: ${error.message}`);
      } else {
        setSubmissionError("Unknown error");
      }
    }
  };

  const handleReset = (): void => {
    timerState.reset();
    showResetMessage();
  };

  return {
    handleDateChange,
    handleSubmit,
    handleReset,
  };
};
