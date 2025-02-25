export interface TimeEntry {
  id: number; // <-- Added to match the backend response
  startTime: string;
  endTime: string;
  projectId: string;
  userId: string;
  rateId: number;
  totalElapsedTime: number;
}

export interface CreateTimeEntryVariables {
  timeInputCreate: Partial<TimeEntry>;
}

export interface UpdateTimeEntryVariables {
  timeInputUpdate: {
    id: number;
    endTime: string;
    totalElapsedTime: number;
  };
}

export interface Rate {
  id: string;
  name: string;
  rate: number;
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
