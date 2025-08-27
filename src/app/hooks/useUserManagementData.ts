import { useState, useEffect, useMemo } from "react";
import { NetworkStatus } from "@apollo/client";
import { useDebounce } from "use-debounce";
import { User as UserTableRowType } from "@/app/components/Admin/UserRow";
import { UserRole as LocalUserRole } from "@/app/components/Admin/UserRoleSelect";
import { useAuthStore } from "@/app/lib/authStore";
import {
  useGetManagementUsersQuery,
  useGetUsersManagementCountQuery,
  useGetAllSimpleTeamsQuery,
  UserRole,
} from "@/generated/graphql";

// Helper function to convert GraphQL UserRole to Local UserRole
const convertUserRole = (role: UserRole): LocalUserRole => {
  switch (role) {
    case UserRole.Admin:
      return LocalUserRole.ADMIN;
    case UserRole.Enabler:
      return LocalUserRole.ENABLER;
    case UserRole.Collaborator:
      return LocalUserRole.COLLABORATOR;
    case UserRole.Pending:
      return LocalUserRole.PENDING;
    default:
      return LocalUserRole.PENDING;
  }
};

// The Custom Hook
export const useUserManagementData = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const loggedInUser = useAuthStore((state) => state.user);

  const userQueryVariables = {
    page,
    pageSize,
    search: debouncedSearchTerm || null,
    role: roleFilter || null,
  };

  const countQueryVariables = {
    search: debouncedSearchTerm || undefined,
    role: roleFilter || undefined,
  };
  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
    networkStatus,
    refetch: refetchUsers,
  } = useGetManagementUsersQuery({
    variables: userQueryVariables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first", // Use cache-first for subsequent requests
  });
  const {
    data: countData,
    error: countError,
    refetch: refetchCount,
  } = useGetUsersManagementCountQuery({
    variables: countQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const {
    loading: loadingTeams,
    data: dataTeams,
    error: teamsError,
    refetch: refetchTeams,
  } = useGetAllSimpleTeamsQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const totalUsers = countData?.usersCount ?? 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, roleFilter, pageSize]);

  const isLoading = loadingUsers || loadingTeams;
  const isRefetching =
    networkStatus === NetworkStatus.refetch ||
    networkStatus === NetworkStatus.setVariables;
  const error = errorUsers || countError || teamsError;

  const users: UserTableRowType[] = (dataUsers?.users ?? []).map((user) => ({
    ...user,
    role: convertUserRole(user.role),
  }));

  const teams = useMemo(() => dataTeams?.getAllSimpleTeams || [], [dataTeams]);

  const refetchAll = async () => {
    try {
      await Promise.all([refetchUsers(), refetchCount(), refetchTeams()]);
    } catch (err) {
      console.error("Failed to refetch user management data:", err);
    }
  };

  return {
    // Data
    users,
    teams,
    totalUsers,
    totalPages,
    // State Values
    page,
    pageSize,
    searchTerm,
    roleFilter,
    loggedInUser,
    // State Setters
    setPage,
    setPageSize,
    setSearchTerm,
    setRoleFilter,
    // Status
    isLoading: isLoading && !isRefetching,
    isRefetching,
    error,
    refetch: refetchAll,
  };
};
