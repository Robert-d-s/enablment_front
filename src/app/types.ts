// src/app/types.ts
export interface TimeEntry {
  startTime: string;
  endTime: string;
  projectId: string;
  userId: string;
  rateId: number;
  totalElapsedTime: number;
}

export interface CreateTimeEntryVariables {
  timeInputCreate: TimeEntry;
}

export interface FeedbackState {
  submissionSuccess: boolean;
  submissionError: string;
  dateAlertMessage: string | null;
  resetMessage: boolean;
}

export interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  displayTime: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setStartTime: (date: Date | null) => void;
}
