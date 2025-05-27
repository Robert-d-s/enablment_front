import React from "react";
import { Button } from "@/components/ui/button";
import { Rate } from "./types";

interface RatesListProps {
  rates: Rate[] | undefined;
  loading: boolean;
  error?: Error | null;
  processingDeleteId: number | null;
  isActionLoading: boolean;
  onDeleteRate: (rateId: number) => void;
}

export const RatesList: React.FC<RatesListProps> = ({
  rates,
  loading,
  error,
  processingDeleteId,
  isActionLoading,
  onDeleteRate,
}) => {
  if (loading) {
    return <p className="text-gray-500 italic">Loading rates...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error loading rates: {error.message}</p>;
  }

  if (!rates || rates.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No rates defined for this team yet.
      </p>
    );
  }

  return (
    <div className="border rounded-md max-h-60 overflow-y-auto bg-white">
      <ul className="divide-y divide-gray-200">
        {rates.map((rate: Rate) => {
          const isDeletingThisRate = processingDeleteId === rate.id;
          return (
            <li
              key={rate.id}
              className="flex justify-between items-center p-3 hover:bg-gray-50"
            >
              <div>
                <span className="font-medium mr-2">{rate.name}</span>
                <span className="text-gray-600">({rate.rate} DKK/h)</span>
              </div>
              <Button
                className="p-1 px-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                onClick={() => onDeleteRate(rate.id)}
                disabled={isActionLoading || isDeletingThisRate}
              >
                {isDeletingThisRate ? (
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
                {isDeletingThisRate ? "Deleting..." : "Delete"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
