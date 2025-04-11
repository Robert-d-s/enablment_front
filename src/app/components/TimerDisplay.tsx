import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/globals.css";
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";
import { formatISO, isToday, isSameDay } from "date-fns";
import { Timer, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface TimerDisplayProps {
  isRunning: boolean;
  displayTime: string;
  initialStartTime: Date | null;
  handleDateChange: (date: Date | null) => void;
}

const getDayClassName = (date: Date, selectedDate: Date | null) => {
  return cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
    isToday(date) && "bg-accent text-accent-foreground",
    selectedDate &&
      isSameDay(date, selectedDate) &&
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    "focus:outline-none focus:ring-1 focus:ring-ring"
  );
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  isRunning,
  displayTime,
  initialStartTime,
  handleDateChange,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center justify-center gap-2 text-foreground mb-1">
        <Timer
          className={`h-5 w-5 ${
            isRunning ? "text-green-500 animate-pulse" : "text-muted-foreground"
          }`}
        />
        <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-center">
          {displayTime}
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-3 text-center">
        Started:{" "}
        {initialStartTime ? (
          `${formatDateForDisplay(initialStartTime)} ${formatTimeFromISOString(
            formatISO(initialStartTime)
          )}`
        ) : (
          <span className="italic">Not Started</span>
        )}
      </div>

      <div className="p-1 border rounded-md bg-card shadow-sm w-full max-w-xs">
        <DatePicker
          inline
          id="startDate"
          selected={initialStartTime}
          onChange={handleDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          timeIntervals={15}
          preventOpenOnFocus
          calendarClassName="p-2"
          dayClassName={(date) => getDayClassName(date, initialStartTime)}
          wrapperClassName="w-full"
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-2 py-1">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7 disabled:opacity-50"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">
                {formatISO(date, { representation: "date" }).substring(0, 7)}
              </span>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7 disabled:opacity-50"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          timeClassName={() =>
            "text-sm p-1 hover:bg-accent rounded-md cursor-pointer"
          }
          timeFormat="h:mm aa"
        />
      </div>
    </div>
  );
};

export default TimerDisplay;
