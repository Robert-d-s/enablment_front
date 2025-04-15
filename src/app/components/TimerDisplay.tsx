import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/globals.css";
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";
import { formatISO, isToday, isSameDay, getMonth } from "date-fns";
import { Timer, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface TimerDisplayProps {
  isRunning: boolean;
  displayTime: string;
  initialStartTime: Date | null;
  handleDateChange: (date: Date | null) => void;
}

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
}) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {" "}
      {/* Increased gap */}
      {/* Timer Value */}
      <div className="flex items-center justify-center gap-2 text-foreground mb-1">
        <Timer
          className={`h-5 w-5 ${
            isRunning ? "text-green-500 animate-pulse" : "text-muted-foreground"
          }`}
        />
        <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-center tabular-nums">
          {" "}
          {/* Added tabular-nums */}
          {displayTime}
        </div>
      </div>
      {/* Start Time Display */}
      <div className="text-xs text-muted-foreground mb-2 text-center">
        {" "}
        {/* Smaller text */}
        Started:{" "}
        {initialStartTime ? (
          `${formatDateForDisplay(initialStartTime)} ${formatTimeFromISOString(
            formatISO(initialStartTime)
          )}`
        ) : (
          <span className="italic">Not Started</span>
        )}
      </div>
      {/* --- Styled Date Picker --- */}
      {/* Container mimicking shadcn card/popover */}
      <div className="p-1 border rounded-md bg-card shadow-sm w-full max-height-[300px] overflow-hidden">
        {" "}
        {/* Adjusted width slightly */}
        <DatePicker
          inline
          id="startDate"
          selected={initialStartTime}
          onChange={handleDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          timeIntervals={15}
          preventOpenOnFocus
          // --- Styling Props ---
          calendarClassName="datepicker-calendar"
          dayClassName={(date) =>
            getDayClassName(
              date,
              initialStartTime,
              initialStartTime || new Date()
            )
          }
          timeClassName={(time) => getTimeClassName(time, initialStartTime)}
          timeFormat="h:mm aa"
          timeCaption="Time"
          // --- Custom Header ---
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-1 py-1.5">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7 disabled:opacity-50 border"
                )}
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
                disabled={nextMonthButtonDisabled}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7 disabled:opacity-50 border"
                )}
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
