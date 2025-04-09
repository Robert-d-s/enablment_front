"use client";
import { create } from "zustand";

type Store = {
  selectedProject: string;
  selectedRate: string;
  setSelectedProject: (selectedProject: string) => void;
  setSelectedRate: (selectedRate: string) => void;
};

const useStore = create<Store>((set) => ({
  selectedProject: "",
  selectedRate: "",
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setSelectedRate: (selectedRate) => set({ selectedRate }),
}));

export default useStore;
