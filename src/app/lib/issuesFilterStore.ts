import { create } from "zustand";

interface IssuesFilterState {
  selectedTeam: string | null;
  selectedAssignee: string | null;
  isRefreshing: boolean;
  socketConnected: boolean;
  connectionStatusMessage: string;
}

interface IssuesFilterActions {
  setSelectedTeam: (team: string | null) => void;
  setSelectedAssignee: (assignee: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
  setSocketConnected: (connected: boolean) => void;
  setConnectionStatusMessage: (message: string) => void;
  clearFilters: () => void;
}

const initialState: IssuesFilterState = {
  selectedTeam: null,
  selectedAssignee: null,
  isRefreshing: false,
  socketConnected: false,
  connectionStatusMessage: "Disconnected",
};

export const useIssuesFilterStore = create<
  IssuesFilterState & IssuesFilterActions
>((set) => ({
  ...initialState,

  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setSelectedAssignee: (assignee) => set({ selectedAssignee: assignee }),
  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  setSocketConnected: (connected) =>
    set({
      socketConnected: connected,
      connectionStatusMessage: connected ? "Connected" : "Disconnected",
    }),
  setConnectionStatusMessage: (message) =>
    set({ connectionStatusMessage: message }),

  clearFilters: () =>
    set({
      selectedTeam: null,
      selectedAssignee: null,
    }),
}));
