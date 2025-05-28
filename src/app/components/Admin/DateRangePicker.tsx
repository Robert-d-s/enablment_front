"use client";

import React, { memo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
  startLabel?: string;
  endLabel?: string;
  maxDate?: Date;
  minDate?: Date;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = memo(
  ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    disabled = false,
    className = "",
    startLabel = "Start Date",
    endLabel = "End Date",
    maxDate = new Date(),
    minDate,
  }) => {
    return (
      <div
        className={cn(
          "flex flex-col md:flex-row gap-3 w-full md:w-auto",
          className
        )}
      >
        <div className="flex-1">
          <Label htmlFor="start-date-picker" className="sr-only">
            {startLabel}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date-picker"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 px-3 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm",
                  !startDate && "text-muted-foreground"
                )}
                disabled={disabled}
                aria-label={startLabel}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
                <span className="truncate text-sm">
                  {startDate
                    ? format(startDate, "MMM dd, yyyy")
                    : `Select ${startLabel.toLowerCase()}`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 shadow-lg border border-gray-200 bg-white"
              align="start"
              sideOffset={4}
            >
              {/* <div className="p-3 bg-gradient-to-b from-gray-50 to-white rounded-lg"> */}
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date: Date | undefined) =>
                  onStartDateChange(date || null)
                }
                disabled={(date) => {
                  if (disabled) return true;
                  if (endDate && date > endDate) return true;
                  if (maxDate && date > maxDate) return true;
                  if (minDate && date < minDate) return true;
                  return false;
                }}
                autoFocus
                //   className="rounded-md"
                //   classNames={{
                //     months: "flex flex-col sm:flex-row gap-2",
                //     month: "flex flex-col gap-4",
                //     caption:
                //       "flex justify-center pt-1 relative items-center w-full mb-2",
                //     caption_label: "text-sm font-semibold text-gray-900",
                //     nav: "flex items-center gap-1",
                //     nav_button:
                //       "h-7 w-7 bg-white border border-gray-200 rounded-md p-0 opacity-70 hover:opacity-100 hover:bg-gray-50 transition-all duration-200",
                //     nav_button_previous: "absolute left-1",
                //     nav_button_next: "absolute right-1",
                //     table: "w-full border-collapse",
                //     head_row: "flex mb-1",
                //     head_cell:
                //       "text-gray-500 rounded-md w-9 font-medium text-xs uppercase tracking-wide",
                //     row: "flex w-full mt-1",
                //     cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                //     day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-gray-700",
                //     day_selected:
                //       "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white shadow-sm",
                //     day_today: "bg-blue-100 text-blue-900 font-semibold",
                //     day_outside:
                //       "text-gray-300 hover:bg-gray-50 hover:text-gray-400",
                //     day_disabled:
                //       "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent",
                //     day_range_middle:
                //       "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                //     day_hidden: "invisible",
                //   }}
              />
              {/* </div> */}
            </PopoverContent>
          </Popover>
        </div>
        {/* End Date Picker */}{" "}
        <div className="flex-1">
          <Label htmlFor="end-date-picker" className="sr-only">
            {endLabel}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date-picker"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 px-3 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm",
                  !endDate && "text-muted-foreground"
                )}
                disabled={disabled}
                aria-label={endLabel}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
                <span className="truncate text-sm">
                  {endDate
                    ? format(endDate, "MMM dd, yyyy")
                    : `Select ${endLabel.toLowerCase()}`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 shadow-lg border border-gray-200 bg-white"
              align="start"
              sideOffset={4}
            >
              <div className="p-3 bg-gradient-to-b from-gray-50 to-white rounded-lg">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={(date: Date | undefined) =>
                    onEndDateChange(date || null)
                  }
                  disabled={(date) => {
                    if (disabled) return true;
                    if (startDate && date < startDate) return true;
                    if (maxDate && date > maxDate) return true;
                    if (minDate && date < minDate) return true;
                    return false;
                  }}
                  autoFocus
                  className="rounded-md"
                  classNames={{
                    months: "flex flex-col sm:flex-row gap-2",
                    month: "flex flex-col gap-4",
                    caption:
                      "flex justify-center pt-1 relative items-center w-full mb-2",
                    caption_label: "text-sm font-semibold text-gray-900",
                    nav: "flex items-center gap-1",
                    nav_button:
                      "h-7 w-7 bg-white border border-gray-200 rounded-md p-0 opacity-70 hover:opacity-100 hover:bg-gray-50 transition-all duration-200",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex mb-1",
                    head_cell:
                      "text-gray-500 rounded-md w-9 font-medium text-xs uppercase tracking-wide",
                    row: "flex w-full mt-1",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-gray-700",
                    day_selected:
                      "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white shadow-sm",
                    day_today: "bg-blue-100 text-blue-900 font-semibold",
                    day_outside:
                      "text-gray-300 hover:bg-gray-50 hover:text-gray-400",
                    day_disabled:
                      "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent",
                    day_range_middle:
                      "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";
