import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const InvoiceSummarySkeleton: React.FC = () => {
  return (
    <Card className="bg-black border-none p-6 shadow-md rounded-lg">
      <CardHeader className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0 md:space-x-4 mb-4">
        {/* Card Title Skeleton */}
        <div className="pt-1">
          {" "}
          {/* Added div for alignment similar to CardTitle in original */}
          <Skeleton className="h-6 w-36 bg-gray-400" />{" "}
          {/* "Invoice Summary" */}
        </div>

        {/* Project Selector Skeleton */}
        <div className="flex-grow w-full md:w-auto">
          <Skeleton className="h-9 w-full bg-gray-300" />
        </div>

        {/* Date Pickers Skeleton */}
        <div className="flex-grow flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1">
            <Skeleton className="h-9 w-full bg-gray-300" />{" "}
            {/* Start Date Picker */}
          </div>
          <div className="flex-1">
            <Skeleton className="h-9 w-full bg-gray-300" />{" "}
            {/* End Date Picker */}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Placeholder for invoice details area */}
        <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
          {/* Project/Team Name Skeleton */}
          <Skeleton className="h-6 w-3/4 mb-3 bg-slate-200" />

          <div className="p-2 space-y-2">
            {/* Total Hours Skeleton */}
            <Skeleton className="h-5 w-1/2 mb-1" />
            {/* Total Cost Skeleton */}
            <Skeleton className="h-5 w-1/2 mb-3" />

            {/* Rates Applied Title Skeleton */}
            <Skeleton className="h-5 w-2/5 mb-2 mt-4 bg-slate-200" />
            <div className="list-disc list-inside pl-4 pt-1 space-y-2">
              {[...Array(2)].map(
                (
                  _,
                  i // Simulate 2 rate detail lines
                ) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-full" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummarySkeleton;
