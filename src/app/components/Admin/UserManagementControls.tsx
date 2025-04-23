"use client";

import React from "react";
import { UserRole } from "./UserRoleSelect";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-center">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="userSearchControl" className="sr-only">
            Search by email
          </label>
          <Input
            id="userSearchControl"
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
            disabled={isLoading}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select
            value={roleFilter === "" ? "all" : roleFilter}
            onValueChange={(value) =>
              setRoleFilter(value === "all" ? "" : (value as UserRole))
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground w-full sm:w-auto sm:ml-auto flex items-center gap-2">
          <span>Show:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>
      </div>
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-muted-foreground border-t pt-4">
          <div className="mb-2 sm:mb-0 flex-shrink-0 mr-4">
            Showing {Math.min(startItem, totalItems)} to {endItem} of{" "}
            {totalItems} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={currentPage === 1 || isLoading}
              aria-label="First Page"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              aria-label="Previous Page"
            >
              Previous
            </Button>
            <span className="font-medium px-2">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
              aria-label="Next Page"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
              aria-label="Last Page"
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementControls;
