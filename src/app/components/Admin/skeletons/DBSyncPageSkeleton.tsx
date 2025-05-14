// src/app/components/Admin/skeletons/DBSyncPageActualSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DBSyncPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-6 font-roboto-condensed">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section Skeleton */}
        <div className="bg-black text-white p-6">
          <Skeleton className="h-8 w-3/4 mb-2 bg-gray-700" /> {/* Title */}
          <Skeleton className="h-4 w-full bg-gray-600" />{" "}
          {/* Description line 1 */}
          <Skeleton className="h-4 w-2/3 bg-gray-600 mt-1" />{" "}
          {/* Description line 2 */}
        </div>

        <div className="p-6">
          {/* Current Database State & Sync Button Section Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Skeleton className="h-6 w-48 mb-1" />{" "}
              {/* "Current Database State" title */}
              <div className="text-gray-600 mt-1 flex gap-4">
                <Skeleton className="h-4 w-20" /> {/* Teams count */}
                <Skeleton className="h-4 w-24" /> {/* Projects count */}
                <Skeleton className="h-4 w-20" /> {/* Issues count */}
              </div>
            </div>
            <Skeleton className="h-12 w-48 rounded-lg" /> {/* Sync Button */}
          </div>

          {/* Placeholder for conditional syncStatus message (optional) */}
          {/* <Skeleton className="h-12 w-full mb-6 rounded-lg" /> */}

          {/* Tab Navigation Skeleton */}
          <div className="mb-6 border-b">
            <div className="flex overflow-x-auto">
              <Skeleton className="h-10 w-20 mr-2" /> {/* Teams Tab */}
              <Skeleton className="h-10 w-24 mr-2" /> {/* Projects Tab */}
              <Skeleton className="h-10 w-20 mr-2" /> {/* Issues Tab */}
              <Skeleton className="h-10 w-28" /> {/* Sync Details Tab */}
            </div>
          </div>

          {/* Tab Content Area Skeleton (simulating one tab's content) */}
          <div className="min-h-[400px]">
            <div className="border rounded-lg overflow-hidden h-full">
              <div className="bg-gray-100 px-4 py-3 border-b">
                <Skeleton className="h-5 w-32 mb-1" />{" "}
                {/* Tab Content Title (e.g., "Teams") */}
                <Skeleton className="h-4 w-24" />{" "}
                {/* Tab Content Subtitle (e.g., "Total: ...") */}
              </div>
              <div
                className="p-4 overflow-y-auto"
                style={{ maxHeight: "400px" }}
              >
                <div className="space-y-3">
                  {[...Array(4)].map(
                    (
                      _,
                      index // Simulate a few list items
                    ) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <Skeleton className="h-4 w-3/4 mb-1" />{" "}
                        {/* Item title/name */}
                        <Skeleton className="h-3 w-1/2" /> {/* Item details */}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBSyncPageSkeleton;
