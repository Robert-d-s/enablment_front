export interface TimeEntry {
  id: number;
  startTime: string;
  endTime: string;
  totalElapsedTime: number;
}

export interface CreateTimeEntryVariables {
  timeInputCreate: {
    startTime: string;
    endTime?: string;
    projectId: string;
    userId: number;
    rateId: number;
    totalElapsedTime: number;
  };
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

// Added types for IssuesPage
export type Label = {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  __typename?: "Label"; // Apollo Client specific field
};

export type Issue = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  dueDate: string | null;
  projectId: string;
  priorityLabel: string;
  identifier: string;
  assigneeName: string | null;
  projectName: string;
  state: string;
  teamKey: string | null;
  teamName: string | null;
  labels: Label[];
  __typename?: "Issue"; // Apollo Client specific field
};

export type IssueUpdatePayload = {
  action: "create" | "update" | "remove";
  issue: Partial<Issue> & { id: string }; // Issue can be partial during updates
};
