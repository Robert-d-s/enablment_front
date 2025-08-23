import { create } from "zustand";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

interface UserManagementState {
  searchTerm: string;
  roleFilter: UserRole | "";
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isRefetching: boolean;
}

interface UserManagementActions {
  setSearchTerm: (term: string) => void;
  setRoleFilter: (role: UserRole | "") => void;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
  setTotalItems: (total: number) => void;
  setTotalPages: (pages: number) => void;
  setLoading: (loading: boolean) => void;
  setRefetching: (refetching: boolean) => void;
  resetFilters: () => void;
}

const initialState: UserManagementState = {
  searchTerm: "",
  roleFilter: "",
  pageSize: 10,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  isLoading: false,
  isRefetching: false,
};

export const useUserManagementStore = create<
  UserManagementState & UserManagementActions
>((set) => ({
  ...initialState,

  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }), // Reset to page 1 on search
  setRoleFilter: (role) => set({ roleFilter: role, currentPage: 1 }), // Reset to page 1 on filter
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }), // Reset to page 1 on page size change
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalItems: (total) => set({ totalItems: total }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setLoading: (loading) => set({ isLoading: loading }),
  setRefetching: (refetching) => set({ isRefetching: refetching }),

  resetFilters: () =>
    set({
      searchTerm: "",
      roleFilter: "",
      currentPage: 1,
    }),
}));
