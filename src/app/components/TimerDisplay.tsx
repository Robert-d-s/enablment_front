import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";
import { formatISO } from "date-fns";

interface TimerDisplayProps {
  isRunning: boolean;
  displayTime: string;
  // Use a new prop for original start time:
  initialStartTime: Date | null;
  handleDateChange: (date: Date | null) => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  isRunning,
  displayTime,
  initialStartTime,
  handleDateChange,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`clock-icon h-6 w-6 ${
          isRunning ? "animate-spin" : ""
        } text-gray-500`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="12" x2="12" y2="8" />
          <line
            x1="12"
            y1="12"
            x2="16"
            y2="12"
            className={isRunning ? "animate-spin" : ""}
          />
        </svg>
      </div>
      <div className="text-7xl font-digital text-black flex items-center justify-center">
        {displayTime}
      </div>
      <div className="mb-2">
        Started at:{" "}
        {initialStartTime
          ? formatDateForDisplay(initialStartTime) +
            " " +
            formatTimeFromISOString(formatISO(initialStartTime))
          : "Not Started"}
      </div>
      <div className="flex justify-center">
        <DatePicker
          inline
          id="startDate"
          selected={initialStartTime || new Date()}
          onChange={handleDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy HH:mm"
          timeIntervals={10}
          className="form-input block w-52 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
};

export default TimerDisplay;
