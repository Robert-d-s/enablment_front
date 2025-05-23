import { formatISO } from "date-fns/formatISO";
import type { TimerState, TimeEntry } from "../types";

interface HandlersConfig {
  timerState: TimerState & {
    initialStartTime: Date | null;
    pauseTimes: Date[];
    resumeTimes: Date[];
    calculateTotalActiveTime: () => number;
  };
  timerProjectId: string;
  timerRateId: string;
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
  timerProjectId,
  timerRateId,
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
    if (timerState.isRunning) {
      console.warn("Timer is active. Date/time change blocked.");
      showDateAlert("Pause or submit timer to change start time.");
      return;
    }
    const now = new Date();
    if (date && date > now) {
      showDateAlert("Please select a current or past date/time.");
    } else {
      timerState.setStartTime(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError("");
    if (
      !timerState.initialStartTime ||
      !timerProjectId ||
      !userId ||
      !timerRateId
    ) {
      const errorMsg =
        "Timer session data (Project/Rate) is incomplete. Cannot submit.";
      console.error(errorMsg, {
        start: timerState.initialStartTime,
        proj: timerProjectId,
        rate: timerRateId,
        user: userId,
      });
      setSubmissionError(errorMsg);
      return;
    }

    try {
      const submissionTime = new Date();
      const totalElapsedTimeMs = timerState.calculateTotalActiveTime();

      if (totalElapsedTimeMs < 0) {
        console.error("Calculated negative elapsed time, resetting timer.", {
          totalElapsedTimeMs,
        });
        setSubmissionError(
          "Timer error: Invalid elapsed time calculated. Please reset."
        );
        handleReset();
        return;
      }

      if (currentEntryId) {
        console.log(`Updating time entry ID ${currentEntryId}.`);
        await updateTime({
          timeInputUpdate: {
            id: currentEntryId,
            endTime: formatISO(submissionTime),
            totalElapsedTime: totalElapsedTimeMs,
          },
        });
        console.log("Successfully updated time entry ID:", currentEntryId);
      } else {
        console.log(
          `Creating new time entry for project ${timerProjectId}, rate ${timerRateId}`
        );
        const result = await createTimeEntry({
          startTime: formatISO(timerState.initialStartTime),
          projectId: timerProjectId,
          userId: parseFloat(userId),
          rateId: parseFloat(timerRateId),
          totalElapsedTime: totalElapsedTimeMs,
        });

        if (result?.data?.createTime?.id) {
          const newEntryId = result.data.createTime.id;
          setCurrentEntryId(newEntryId);
          console.log("Successfully created time entry, new ID:", newEntryId);
        } else {
          throw new Error(
            "Time entry created, but no ID was returned from the server."
          );
        }
      }

      showSuccessMessage();
      if (timerState.isRunning) {
        timerState.pause();
      }
    } catch (error: unknown) {
      console.error("Error during time entry submission:", error);
      if (error instanceof Error) {
        setSubmissionError(`Submit Failed: ${error.message}`);
      } else {
        setSubmissionError("An unknown error occurred during submission.");
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
