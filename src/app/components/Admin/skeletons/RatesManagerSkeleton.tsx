import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RatesManagerSkeleton: React.FC = () => {
  return (
    <Card className="p-4 bg-gray-50 shadow-md rounded-lg border">
      <CardHeader className="border-b pb-2 mb-4">
        <CardTitle>
          <Skeleton className="h-6 w-32" /> {/* "Manage Rates" title */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Team Selector Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-20 mb-1" /> {/* Label */}
          <Skeleton className="h-9 w-full" /> {/* Select Trigger */}
        </div>

        {/* New Rate Form Skeleton (simplified) */}
        <div className="mb-4 p-4 border rounded-md bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Skeleton className="h-4 w-24 mb-1" /> {/* Label */}
            <Skeleton className="h-9 w-full" /> {/* Rate Name Input */}
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" /> {/* Label */}
            <Skeleton className="h-9 w-full" /> {/* Rate Value Input */}
          </div>
          <div>
            <Skeleton className="h-9 w-full" /> {/* Create Rate Button */}
          </div>
        </div>

        {/* Existing Rates Skeleton */}
        <div className="mt-4">
          <Skeleton className="h-5 w-48 mb-2" />{" "}
          {/* "Existing Rates for Team:" title */}
          <div className="border rounded-md max-h-60 overflow-y-auto bg-white p-3 space-y-3">
            {[...Array(3)].map(
              (
                _,
                i // Show a few skeleton list items
              ) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex-grow">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-7 w-16" /> {/* Delete Button */}
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatesManagerSkeleton;
