import React from "react";
import dynamic from "next/dynamic";
import "react-datepicker/dist/react-datepicker.css";
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "@/app/utils/timeUtils";
import { formatISO, isToday, isSameDay, getMonth } from "date-fns";
import { Timer, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DatePickerProps } from "react-datepicker";

interface TimerDisplayProps {
  isRunning: boolean;
  displayTime: string;
  initialStartTime: Date | null;
  handleDateChange: (date: Date | null) => void;
  isTimerRunning: boolean;
}

const DynamicDatePicker = dynamic<DatePickerProps>(
  () =>
    import("react-datepicker").then(
      (mod) => mod.default as unknown as React.ComponentType<DatePickerProps>
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex justify-center items-center p-1 w-full max-w-xl"
        style={{ minHeight: "300px" }}
      >
        <Skeleton className="h-[280px] w-[280px] md:h-[300px] md:w-[320px]" />
      </div>
    ),
  }
);

const getDayClassName = (
  date: Date,
  selectedDate: Date | null,
  currentMonthDate: Date
) => {
  return cn(
    buttonVariants({ variant: "ghost" }),
    "h-8 w-8 p-0 font-normal text-sm", // Slightly smaller days
    "aria-selected:opacity-100 rounded-md", // Keep rounding
    !isSameDay(getMonth(date), getMonth(currentMonthDate)) &&
      "text-muted-foreground opacity-50", // Dim days outside month
    isToday(date) && "bg-accent text-accent-foreground",
    selectedDate &&
      isSameDay(date, selectedDate) &&
      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground", // Use hover variant
    "focus:outline-none focus:ring-1 focus:ring-ring"
  );
};

// Helper for Time class styling
const getTimeClassName = (time: Date, selected: Date | null) => {
  const isSelected =
    selected &&
    time.getHours() === selected.getHours() &&
    time.getMinutes() === selected.getMinutes();
  return cn(
    "text-sm p-1 mx-1 flex justify-center items-center rounded-md cursor-pointer",
    "hover:bg-accent hover:text-accent-foreground", // Hover effect
    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90" // Selected style (might be overridden by CSS)
  );
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  isRunning,
  displayTime,
  initialStartTime,
  handleDateChange,
  isTimerRunning,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {" "}
      <div className="flex items-center justify-center gap-2 text-foreground mb-1">
        <Timer
          className={`h-5 w-5 ${
            isRunning ? "text-green-500 animate-pulse" : "text-muted-foreground"
          }`}
        />
        <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-center tabular-nums">
          {" "}
          {displayTime}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-2 text-center">
        {" "}
        Started:{" "}
        {initialStartTime ? (
          `${formatDateForDisplay(initialStartTime)} ${formatTimeFromISOString(
            formatISO(initialStartTime)
          )}`
        ) : (
          <span className="italic">Not Started</span>
        )}
      </div>
      <div className="datepicker-wrapper p-1 border rounded-md bg-card shadow-sm w-full max-w-xl overflow-hidden">
        <DynamicDatePicker
          inline
          id="startDate"
          selected={initialStartTime}
          onChange={handleDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          timeIntervals={15}
          preventOpenOnFocus
          disabled={isTimerRunning}
          // --- Styling Props ---
          calendarClassName="bg-card rounded-lg shadow-lg border p-2"
          dayClassName={(date: Date) =>
            getDayClassName(
              date,
              initialStartTime,
              initialStartTime || new Date()
            )
          }
          timeClassName={(time: Date) =>
            getTimeClassName(time, initialStartTime)
          }
          timeFormat="h:mm aa"
          timeCaption="Time"
          // --- Custom Header ---
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }: {
            date: Date;
            decreaseMonth: () => void;
            increaseMonth: () => void;
            prevMonthButtonDisabled: boolean;
            nextMonthButtonDisabled: boolean;
          }) => (
            <div className="flex items-center justify-between px-1 py-1.5">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled || isTimerRunning}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7 disabled:opacity-50 border"
                )}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">
                {/* Display Month Year */}
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  year: "numeric",
                }).format(date)}
              </span>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled || isTimerRunning}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7 disabled:opacity-50 border"
                )}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default TimerDisplay;
