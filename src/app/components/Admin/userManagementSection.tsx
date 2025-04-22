"use client";

import React from "react";
import UserTable from "./UserTable";
import UserManagementControls from "./UserManagementControls";
import { useUserManagementData } from "@/app/hooks/useUserManagementData";
import LoadingIndicator from "@/app/components/Admin/LoadingIndicator";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";
import { Loader2 } from "lucide-react";

const UserManagementSection: React.FC = () => {
  const {
    users,
    teams,
    totalUsers,
    page,
    pageSize,
    totalPages,
    isLoading,
    isRefetching,
    error,
    setPage,
    setPageSize,
    setSearchTerm,
    setRoleFilter,
    searchTerm,
    roleFilter,
    loggedInUser,
    refetch,
  } = useUserManagementData();

  if (isLoading) return <LoadingIndicator message="Loading User Data..." />;
  if (error)
    return (
      <ErrorMessage error={error} context="User Management" onRetry={refetch} />
    );
  return (
    <div className="mb-6 shadow-md p-4 border rounded-lg bg-white relative">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      <UserManagementControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={page}
        totalItems={totalUsers}
        totalPages={totalPages}
        setPage={setPage}
        isLoading={isRefetching || isLoading}
      />

      <div className="relative mt-4">
        {isRefetching && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <div
          className={`transition-opacity duration-150 ${
            isRefetching ? "opacity-60" : "opacity-100"
          }`}
        >
          <UserTable
            users={users}
            allTeams={teams}
            loggedInUserId={loggedInUser?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagementSection;
