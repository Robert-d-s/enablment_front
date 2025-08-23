"use client";

import React, { useEffect } from "react";
import UserTable from "./UserTable";
import UserManagementControls from "./UserManagementControls";
import { useUserManagementData } from "@/app/hooks/useUserManagementData";
import { useUserManagementStore } from "@/app/lib/userManagementStore";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";
import UserManagementSkeleton from "./skeletons/UserManagementSkeleton";

const UserManagementSection: React.FC = () => {
  const { setTotalItems, setTotalPages, setLoading, setRefetching } =
    useUserManagementStore();

  const {
    users,
    teams,
    totalUsers,
    totalPages,
    isLoading,
    isRefetching,
    error,
    loggedInUser,
    refetch,
  } = useUserManagementData();

  // Sync data from hook to store
  useEffect(() => {
    setTotalItems(totalUsers);
  }, [totalUsers, setTotalItems]);

  useEffect(() => {
    setTotalPages(totalPages);
  }, [totalPages, setTotalPages]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setRefetching(isRefetching);
  }, [isRefetching, setRefetching]);

  if (isLoading && !isRefetching) {
    return <UserManagementSkeleton />;
  }
  if (error)
    return (
      <ErrorMessage error={error} context="User Management" onRetry={refetch} />
    );
  return (
    <div className="mb-6 shadow-md p-4 border rounded-lg bg-white relative">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      <UserManagementControls />

      <div className="relative mt-4">
        {isRefetching && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-md">
            <UserManagementSkeleton />
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
