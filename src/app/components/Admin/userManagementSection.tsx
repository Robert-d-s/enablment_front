// src/app/components/Admin/UserManagementSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQuery, gql, NetworkStatus, ApolloError } from "@apollo/client";
import { useDebounce } from "use-debounce";
import UserTable from "@/app/components/Admin/UserTable";
import { User as UserTableRowType } from "@/app/components/Admin/UserRow";
import { UserRole } from "@/app/components/Admin/UserRoleSelect";
import { GET_SIMPLE_TEAMS } from "@/app/graphql/adminOperations"; // Keep this for team dropdowns
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

// --- Interfaces ---
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

// --- Component ---
const UserManagementSection: React.FC = () => {
  // State for UI controls
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">(""); // Use '' for "All Roles" option

  // Debounce search term
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Other state
  const [users, setUsers] = useState<GetUsersQueryData["users"]>([]);
  const loggedInUser = useAuthStore((state) => state.user);

  const userQueryVariables = {
    page: page || null,
    pageSize: pageSize || null,
    search: debouncedSearchTerm || null,
    role: roleFilter || null,
  };

  // Variables for the count query (filters only)
  const countQueryVariables = {
    search: debouncedSearchTerm || undefined,
    role: roleFilter || undefined,
  };

  // --- Queries ---

  // Fetch Paginated/Filtered Users
  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
    networkStatus,
  } = useQuery<GetUsersQueryData>(GET_MANAGEMENT_USERS, {
    variables: userQueryVariables,
    notifyOnNetworkStatusChange: true,
    // fetchPolicy: "cache-and-network" // Consider this if cache updates aren't reliable enough
  });

  // Fetch Total User Count (matching filters)
  const { data: countData, error: countError } =
    useQuery<GetUsersCountQueryData>(GET_USERS_COUNT, {
      variables: countQueryVariables,
      fetchPolicy: "cache-and-network", // Count should reflect current filters
    });

  // Fetch All Teams (for dropdowns in rows)
  const {
    loading: loadingTeams,
    data: dataTeams,
    error: teamsError,
  } = useQuery<GetSimpleTeamsQueryData>(GET_SIMPLE_TEAMS);

  // Calculate total pages
  const totalUsers = countData?.usersCount ?? 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  // --- Effects ---

  // Update local users state when data arrives/changes
  useEffect(() => {
    if (dataUsers?.users) {
      setUsers(dataUsers.users);
    }
  }, [dataUsers]);

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, roleFilter, pageSize]);

  // --- Loading/Error Handling ---
  const isLoading =
    loadingUsers &&
    networkStatus !== NetworkStatus.refetch &&
    networkStatus !== NetworkStatus.setVariables;
  const isRefetching =
    networkStatus === NetworkStatus.refetch ||
    networkStatus === NetworkStatus.setVariables;
  const combinedError = errorUsers || countError || teamsError; // Combine potential errors

  if (isLoading || loadingTeams) return <p>Loading User Data...</p>; // Initial load for users or teams

  if (combinedError) {
    const error = combinedError as ApolloError; // Cast for accessing details
    console.error("Data loading error:", error);
    const graphQLError = error.graphQLErrors?.[0];
    if (graphQLError?.extensions?.code === "FORBIDDEN") {
      return <p>You do not have permission to view users.</p>;
    }
    return <p>Error loading data: {error.message}</p>;
  }

  // Prepare data for table (casting role string to enum)
  const usersForTable: UserTableRowType[] = users.map((user) => ({
    ...user,
    role: user.role as UserRole, // Cast role string to enum for UserRow prop type
  }));

  // --- Render ---
  return (
    <div className="mb-6 shadow-md p-4 border rounded-lg bg-white">
      {" "}
      {/* Added bg-white */}
      <h2 className="text-xl font-semibold mb-4">User Management</h2>{" "}
      {/* Added Title */}
      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-center">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="userSearch" className="sr-only">
            Search by email
          </label>
          <input
            id="userSearch"
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="roleFilter" className="sr-only">
            Filter by role
          </label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            className="w-full p-2 border rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        {/* Page Size Selector */}
        <div className="text-sm text-gray-700 w-full sm:w-auto sm:ml-auto">
          <label htmlFor="pageSizeSelect" className="mr-1">
            Show:
          </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 mx-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>entries</span>
        </div>
      </div>
      {/* Table Area */}
      {/* Render table only when initial load is complete and no critical errors */}
      {!isLoading && !combinedError && (
        <>
          {/* Table with Opacity for Refetching state */}
          <div
            className={`transition-opacity duration-300 ${
              isRefetching ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            <UserTable
              users={usersForTable}
              allTeams={dataTeams?.getAllSimpleTeams || []}
              loggedInUserId={loggedInUser?.id}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-700">
            <div className="mb-2 sm:mb-0">
              Showing{" "}
              {Math.min(
                totalUsers > 0 ? (page - 1) * pageSize + 1 : 0,
                totalUsers
              )}{" "}
              to {Math.min(page * pageSize, totalUsers)} of {totalUsers} entries
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isRefetching}
                className="px-3 py-1 border rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Previous Page"
              >
                {" "}
                Previous{" "}
              </button>
              <span className="mx-2 font-medium">
                Page {page} of {totalPages > 0 ? totalPages : 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={
                  page === totalPages || totalPages === 0 || isRefetching
                }
                className="px-3 py-1 border rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Next Page"
              >
                {" "}
                Next{" "}
              </button>
            </div>
          </div>
        </>
      )}
      {/* Show loading indicator specifically during refetch */}
      {isRefetching && !isLoading && (
        <p className="text-center text-gray-500 mt-4">Updating list...</p>
      )}
    </div>
  );
};

export default UserManagementSection;
