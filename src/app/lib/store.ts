"use client";

import { create } from "zustand";
import type { Project } from "@/app/hooks/useTimeKeeperData";
import type { Rate } from "@/app/types";

interface StoreUser {
  id: string;
  email: string;
  teams?: { name: string; projects: Project[] }[];
}

type Store = {
  users: StoreUser[];
  projects: Project[];
  rates: Rate[];
  selectedUser: string;
  selectedProject: string;
  selectedRate: string;
  setUsers: (users: StoreUser[]) => void;
  setProjects: (projects: Project[]) => void;
  setRates: (rates: Rate[]) => void;
  setSelectedUser: (selectedUser: string) => void;
  setSelectedProject: (selectedProject: string) => void;
  setSelectedRate: (selectedRate: string) => void;

  teamId: string | null;
  setTeamId: (teamId: string | null) => void;
};

const useStore = create<Store>((set) => ({
  users: [],
  projects: [],
  rates: [],
  selectedUser: "",
  selectedProject: "",
  selectedRate: "",
  setUsers: (users) => set({ users }),
  setProjects: (projects) => set({ projects }),
  setRates: (rates) => set({ rates }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setSelectedRate: (selectedRate) => set({ selectedRate }),

  teamId: null,
  setTeamId: (teamId) => set({ teamId }),
}));

export default useStore;
