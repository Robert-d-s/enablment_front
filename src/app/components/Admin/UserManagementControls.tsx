"use client";

import React from "react";
import { UserRole } from "./UserRoleSelect";

interface UserManagementControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: UserRole | "";
  setRoleFilter: (role: UserRole | "") => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  setPage: (page: number) => void;
  isLoading: boolean;
}

const UserManagementControls: React.FC<UserManagementControlsProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  pageSize,
  setPageSize,
  currentPage,
  totalItems,
  totalPages,
  setPage,
  isLoading,
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-center">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="userSearchControl" className="sr-only">
            Search by email
          </label>
          <input
            id="userSearchControl"
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="roleFilterControl" className="sr-only">
            Filter by role
          </label>
          <select
            id="roleFilterControl"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            className="w-full p-2 border rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="">All Roles</option>
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-700 w-full sm:w-auto sm:ml-auto">
          <label htmlFor="pageSizeSelectControl" className="mr-1">
            Show:
          </label>
          <select
            id="pageSizeSelectControl"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 mx-1 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>entries</span>
        </div>
      </div>
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-700 border-t pt-4">
          <div className="mb-2 sm:mb-0">
            Showing {Math.min(startItem, totalItems)} to {endItem} of{" "}
            {totalItems} entries
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 border rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Previous Page"
            >
              Previous
            </button>
            <span className="mx-2 font-medium">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
              className="px-3 py-1 border rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Next Page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementControls;
