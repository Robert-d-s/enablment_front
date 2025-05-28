import { useState, useEffect, useMemo } from "react";
import { useQuery, gql, NetworkStatus } from "@apollo/client";
import { useDebounce } from "use-debounce";
import { User as UserTableRowType } from "@/app/components/Admin/UserRow";
import { UserRole } from "@/app/components/Admin/UserRoleSelect";
import { GET_SIMPLE_TEAMS } from "@/app/graphql/adminOperations";
import { useAuthStore } from "@/app/lib/authStore";

const GET_MANAGEMENT_USERS = gql`
  query GetManagementUsers(
    $page: Int
    $pageSize: Int
    $search: String
    $role: UserRole
  ) {
    users(
      args: { page: $page, pageSize: $pageSize, search: $search, role: $role }
    ) {
      id
      email
      role
      teams {
        id
        name
        __typename
      }
      __typename
    }
  }
`;

const GET_USERS_COUNT = gql`
  query GetUsersManagementCount($search: String, $role: UserRole) {
    usersCount(search: $search, role: $role)
  }
`;

// Keep interfaces
interface GetUsersQueryData {
  users: Array<{
    id: number;
    email: string;
    role: string;
    teams: Array<{ id: string; name: string; __typename: "Team" }>;
    __typename: "User";
  }>;
}

interface GetSimpleTeamsQueryData {
  getAllSimpleTeams: Array<{
    id: string;
    name: string;
    __typename: "SimpleTeamDTO";
  }>;
}

interface GetUsersCountQueryData {
  usersCount: number;
}

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
  } = useQuery<GetUsersQueryData>(GET_MANAGEMENT_USERS, {
    variables: userQueryVariables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first", // Use cache-first for subsequent requests
  });
  const {
    data: countData,
    error: countError,
    refetch: refetchCount,
  } = useQuery<GetUsersCountQueryData>(GET_USERS_COUNT, {
    variables: countQueryVariables,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const {
    loading: loadingTeams,
    data: dataTeams,
    error: teamsError,
    refetch: refetchTeams,
  } = useQuery<GetSimpleTeamsQueryData>(GET_SIMPLE_TEAMS, {
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
    role: user.role as UserRole,
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
