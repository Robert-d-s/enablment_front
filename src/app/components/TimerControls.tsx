"use client";
import React from "react";

interface TimerControlsProps {
  isRunning: boolean;
  handleStartStop: () => void;
  handleReset: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabledStartPause: boolean;
  disabledReset: boolean;
  disabledSubmit: boolean;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  handleStartStop,
  handleReset,
  handleSubmit,
  disabledStartPause,
  disabledReset,
  disabledSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-center mt-auto py-6">
        <button
          type="button"
          onClick={handleStartStop}
          className={`px-6 py-6 ${
            isRunning ? "bg-red-500" : "bg-green-500"
          } text-white text-2xl rounded-full`}
          disabled={disabledStartPause}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-8 bg-yellow-500 text-white text-2xl rounded-full ml-4"
          disabled={disabledReset}
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-3 py-8 bg-blue-500 text-white text-2xl rounded-full ml-4"
          disabled={disabledSubmit}
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default TimerControls;
