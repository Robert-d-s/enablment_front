"use client";

import React from "react";
import { ApolloError } from "@apollo/client";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";
import { useTimerSelectionStore } from "@/app/lib/timerSelectionStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Hourglass, Loader2 } from "lucide-react";
import type { Project, Rate } from "@/generated/graphql";

interface ProjectRateSelectorsProps {
  userProjects: Project[];
  rates: Rate[];
  totalTimeLoading: boolean;
  totalTimeError: ApolloError | undefined;
  totalTime: number;
  isTimerRunning: boolean;
  ratesError?: ApolloError | undefined;
  // Removed: selectedProject, setSelectedProject, selectedRate, setSelectedRate
}

const ProjectRateSelectors: React.FC<ProjectRateSelectorsProps> = ({
  userProjects,
  rates,
  totalTimeLoading,
  totalTimeError,
  totalTime,
  isTimerRunning,
  ratesError,
}) => {
  // Get selection state and actions from store
  const {
    selectedProjectId,
    selectedRateId,
    setSelectedProject,
    setSelectedRate,
  } = useTimerSelectionStore();

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>Project & Rate</CardTitle>
        <CardDescription>
          Select the project and rate for this time entry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selector */}
        <div className="space-y-2">
          <Label htmlFor="project-select">Project</Label>
          <Select
            value={selectedProjectId ?? ""}
            onValueChange={setSelectedProject}
            disabled={userProjects.length === 0 || isTimerRunning}
          >
            {/* Use default trigger styles, add w-full for layout */}
            <SelectTrigger id="project-select" className="w-full">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            {/* Use default content styles */}
            <SelectContent position="popper">
              {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  // Use default item styles
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}{" "}
                    {project.teamName ? `(${project.teamName})` : ""}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No projects found.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>{" "}
        {/* Rate Selector */}
        <div className="space-y-2">
          <Label htmlFor="rate-select">Rate</Label>
          <Select
            value={selectedRateId ?? ""}
            onValueChange={setSelectedRate}
            disabled={
              !selectedProjectId ||
              rates.length === 0 ||
              isTimerRunning ||
              !!ratesError
            }
          >
            <SelectTrigger id="rate-select" className="w-full border-input">
              <SelectValue placeholder="Select a rate..." />
            </SelectTrigger>
            <SelectContent position="popper">
              {ratesError ? (
                <div className="p-2 text-sm text-red-600">
                  Error loading rates: {ratesError.message}
                </div>
              ) : rates.length > 0 ? (
                rates.map((rate) => (
                  <SelectItem key={rate.id} value={rate.id.toString()}>
                    {rate.name} ({rate.rate} DKK/h)
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  {selectedProjectId
                    ? "No rates for this project."
                    : "Select a project first."}
                </div>
              )}
            </SelectContent>
          </Select>
          {ratesError && (
            <p className="text-xs text-red-500 mt-1">
              Failed to load rates. Please try selecting the project again.
            </p>
          )}
        </div>
        {/* Total Time Display */}
        <div className="border-t pt-4 mt-4">
          <Label className="text-sm font-medium">Total Time on Project</Label>
          <div className="flex items-center gap-2 mt-1">
            <Hourglass className="h-5 w-5 text-muted-foreground" />
            {totalTimeLoading ? (
              <span className="flex items-center gap-1 text-muted-foreground italic">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </span>
            ) : totalTimeError ? (
              <span className="text-sm text-red-600">Error loading time</span>
            ) : (
              <span className="text-lg font-semibold font-mono">
                {formatTimeFromMilliseconds(totalTime)}
              </span>
            )}
          </div>
          {totalTimeError && (
            <p className="text-xs text-red-500 mt-1">
              {totalTimeError.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectRateSelectors;
