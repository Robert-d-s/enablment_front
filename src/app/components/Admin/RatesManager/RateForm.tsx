import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RateFormProps {
  rateName: string;
  rateValue: number | string;
  formError: string | null;
  isActionLoading: boolean;
  creatingRate: boolean;
  onRateNameChange: (value: string) => void;
  onRateValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateRate: () => void;
}

export const RateForm: React.FC<RateFormProps> = ({
  rateName,
  rateValue,
  formError,
  isActionLoading,
  creatingRate,
  onRateNameChange,
  onRateValueChange,
  onCreateRate,
}) => {
  return (
    <div className="mb-4 p-4 border rounded-md bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="md:col-span-2">
        <Label
          htmlFor="rateName"
          className="block text-sm font-medium text-gray-700"
        >
          New Rate Name
        </Label>
        <Input
          id="rateName"
          type="text"
          className="w-full p-2 mt-1 border border-gray-300 rounded disabled:bg-gray-100"
          value={rateName}
          onChange={(e) => onRateNameChange(e.target.value)}
          placeholder="e.g., Standard Rate"
          disabled={isActionLoading}
        />
      </div>
      <div>
        <Label
          htmlFor="rateValue"
          className="block text-sm font-medium text-gray-700"
        >
          Rate Value (DKK)
        </Label>
        <Input
          id="rateValue"
          type="number"
          className="w-full p-2 mt-1 border border-gray-300 rounded disabled:bg-gray-100"
          value={rateValue}
          onChange={onRateValueChange}
          placeholder="e.g., 800"
          min="0"
          step="1"
          disabled={isActionLoading}
        />
      </div>
      <div>
        <Button
          className="w-full p-2 bg-black text-white rounded hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={onCreateRate}
          disabled={isActionLoading || !!formError}
        >
          {creatingRate ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
              Creating...
            </>
          ) : (
            "Create Rate"
          )}
        </Button>
        {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
      </div>
    </div>
  );
};
