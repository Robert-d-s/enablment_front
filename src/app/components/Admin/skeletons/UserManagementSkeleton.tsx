import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const UserManagementSkeleton: React.FC = () => {
  const MOCK_ROWS = 3;

  return (
    <div className="mb-6 shadow-md p-4 border rounded-lg bg-white relative">
      {/* Title */}
      <Skeleton className="h-7 w-1/3 mb-4" />

      {/* UserManagementControls Skeleton */}
      <>
        <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-center">
          <div className="flex-grow w-full sm:w-auto">
            <Skeleton className="h-9 w-full" /> {/* Search Input */}
          </div>
          <div className="w-full sm:w-auto">
            <Skeleton className="h-9 w-full sm:w-[180px]" />{" "}
            {/* Role Filter Select */}
          </div>
          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
            <Skeleton className="h-5 w-12" /> {/* "Show:" text */}
            <Skeleton className="h-9 w-[70px]" /> {/* Page Size Select */}
            <Skeleton className="h-5 w-16" /> {/* "entries" text */}
          </div>
        </div>
        {/* Pagination Controls Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-muted-foreground border-t pt-4">
          <Skeleton className="h-5 w-1/3 mb-2 sm:mb-0" />{" "}
          {/* "Showing x to y..." text */}
          <div className="flex items-center space-x-2">
            {/* Use disabled Button components for better structural representation */}
            <Button variant="outline" size="sm" disabled className="opacity-50">
              <Skeleton className="h-4 w-10" />{" "}
              {/* Mimic button text "First" */}
            </Button>
            <Button variant="outline" size="sm" disabled className="opacity-50">
              <Skeleton className="h-4 w-16" />{" "}
              {/* Mimic button text "Previous" */}
            </Button>
            <Skeleton className="h-5 w-24" /> {/* "Page x of y" text */}
            <Button variant="outline" size="sm" disabled className="opacity-50">
              <Skeleton className="h-4 w-10" /> {/* Mimic button text "Next" */}
            </Button>
            <Button variant="outline" size="sm" disabled className="opacity-50">
              <Skeleton className="h-4 w-10" /> {/* Mimic button text "Last" */}
            </Button>
          </div>
        </div>
      </>

      {/* UserTable Skeleton (remains the same as your good version) */}
      <div className="relative mt-4">
        <Table>
          <TableCaption>
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">
                <Skeleton className="h-5 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-32" />
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-5 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(MOCK_ROWS)].map((_, i) => (
              <TableRow key={`skeleton-row-${i}`}>
                <TableCell className="font-medium">
                  <Skeleton className="h-5 w-3/4" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-[70px]" />
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-24 rounded-md" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[150px]">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementSkeleton;
