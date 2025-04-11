"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Send } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex justify-center items-center gap-4 mt-4 w-full">
        <Button
          type="button"
          variant={isRunning ? "destructive" : "default"}
          size="lg"
          onClick={handleStartStop}
          disabled={disabledStartPause}
          className={`flex items-center gap-2 ${
            isRunning
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {isRunning ? "Pause" : "Start"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleReset}
          disabled={disabledReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-5 w-5" />
          Reset
        </Button>

        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={disabledSubmit}
          className="flex items-center gap-2"
        >
          <Send className="h-5 w-5" />
          Submit
        </Button>
      </div>
    </form>
  );
};

export default TimerControls;
