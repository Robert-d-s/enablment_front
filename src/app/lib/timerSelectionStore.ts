import { create } from "zustand";

interface TimerSelectionState {
  selectedProjectId: string;
  selectedRateId: string;
  displayTime: string;
  totalTime: number;
  totalTimeLoading: boolean;
  ratesError: string | null;
  totalTimeError: string | null;
}

interface TimerSelectionActions {
  setSelectedProject: (projectId: string) => void;
  setSelectedRate: (rateId: string) => void;
  setDisplayTime: (time: string) => void;
  setTotalTime: (time: number) => void;
  setTotalTimeLoading: (loading: boolean) => void;
  setRatesError: (error: string | null) => void;
  setTotalTimeError: (error: string | null) => void;
  resetSelections: () => void;
}

const initialState: TimerSelectionState = {
  selectedProjectId: "",
  selectedRateId: "",
  displayTime: "00:00:00",
  totalTime: 0,
  totalTimeLoading: false,
  ratesError: null,
  totalTimeError: null,
};

export const useTimerSelectionStore = create<
  TimerSelectionState & TimerSelectionActions
>((set) => ({
  ...initialState,

  setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
  setSelectedRate: (rateId) => set({ selectedRateId: rateId }),
  setDisplayTime: (time) => set({ displayTime: time }),
  setTotalTime: (time) => set({ totalTime: time }),
  setTotalTimeLoading: (loading) => set({ totalTimeLoading: loading }),
  setRatesError: (error) => set({ ratesError: error }),
  setTotalTimeError: (error) => set({ totalTimeError: error }),

  resetSelections: () =>
    set({
      selectedProjectId: "",
      selectedRateId: "",
      displayTime: "00:00:00",
      totalTime: 0,
      ratesError: null,
      totalTimeError: null,
    }),
}));
