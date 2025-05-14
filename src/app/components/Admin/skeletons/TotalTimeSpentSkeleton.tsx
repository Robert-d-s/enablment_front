// src/app/components/Admin/skeletons/TotalTimeSpentSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const TotalTimeSpentSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-white rounded shadow">
      {/* Project Selector Skeleton */}
      <div className="w-full sm:w-64">
        <Skeleton className="h-9 w-full" />
      </div>

      {/* Date Filters Skeleton */}
      <div className="flex-grow flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="flex-1">
          <Skeleton className="h-9 w-full" /> {/* Start Date Picker */}
        </div>
        <div className="flex-1">
          <Skeleton className="h-9 w-full" /> {/* End Date Picker */}
        </div>
      </div>

      {/* Time Display Skeleton */}
      <div className="text-center md:text-right whitespace-nowrap min-h-[2.25rem] flex items-center">
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
};

export default TotalTimeSpentSkeleton;
