import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TimerPersistedState {
  isRunning: boolean;
  initialStartTimeISO: string | null;
  pauseTimesISO: string[];
  resumeTimesISO: string[];
  currentEntryId: number | null;
  projectIdForTimer: string | null;
  rateIdForTimer: string | null;
}

interface TimerActions {
  setTimerRunning: (running: boolean) => void;
  setInitialStartTime: (date: Date | null) => void;
  addPauseTime: (date: Date) => void;
  addResumeTime: (date: Date) => void;
  setCurrentEntryId: (id: number | null) => void;
  setProjectAndRate: (projectId: string | null, rateId: string | null) => void;
  resetTimerState: () => void;
}

const initialState: TimerPersistedState = {
  isRunning: false,
  initialStartTimeISO: null,
  pauseTimesISO: [],
  resumeTimesISO: [],
  currentEntryId: null,
  projectIdForTimer: null,
  rateIdForTimer: null,
};

export const useTimerStore = create<TimerPersistedState & TimerActions>()(
  persist(
    (set) => ({
      ...initialState,
      setTimerRunning: (running) => set({ isRunning: running }),
      setInitialStartTime: (date) =>
        set({ initialStartTimeISO: date ? date.toISOString() : null }),
      addPauseTime: (date) =>
        set((state) => ({
          pauseTimesISO: [...state.pauseTimesISO, date.toISOString()],
        })),
      addResumeTime: (date) =>
        set((state) => ({
          resumeTimesISO: [...state.resumeTimesISO, date.toISOString()],
        })),
      setCurrentEntryId: (id) => set({ currentEntryId: id }),
      setProjectAndRate: (projectId, rateId) =>
        set({
          projectIdForTimer: projectId,
          rateIdForTimer: rateId,
        }),
      resetTimerState: () => {
        console.log("Resetting timer state in Zustand store");
        set({ ...initialState });
      },
    }),
    {
      name: "timer-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("Zustand timer state rehydrated from localStorage");
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating timer state:", error);
          }
        };
      },
    }
  )
);
