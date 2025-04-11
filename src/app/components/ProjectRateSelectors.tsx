// src/app/components/ProjectRateSelectors.tsx
"use client";

import React from "react";
import { ApolloError } from "@apollo/client";
import { formatTimeFromMilliseconds } from "../utils/timeUtils";
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

interface Project {
  id: string;
  name: string;
  teamName?: string;
}

interface Rate {
  id: string;
  name: string;
  rate: number;
}

interface ProjectRateSelectorsProps {
  userProjects: Project[];
  selectedProject: string | null;
  setSelectedProject: (projectId: string) => void;
  rates: Rate[];
  selectedRate: string | null;
  setSelectedRate: (rateId: string) => void;
  totalTimeLoading: boolean;
  totalTimeError: ApolloError | undefined;
  totalTime: number;
}

const selectDropdownStyle = {
  backgroundColor: "white",
  color: "black",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const selectItemStyle = {
  backgroundColor: "white",
  color: "black",
  cursor: "pointer",
};

const ProjectRateSelectors: React.FC<ProjectRateSelectorsProps> = ({
  userProjects,
  selectedProject,
  setSelectedProject,
  rates,
  selectedRate,
  setSelectedRate,
  totalTimeLoading,
  totalTimeError,
  totalTime,
}) => {
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
            value={selectedProject ?? ""}
            onValueChange={setSelectedProject}
            disabled={userProjects.length === 0}
          >
            <SelectTrigger
              id="project-select"
              className="w-full border-input"
              style={{ backgroundColor: "white", color: "black" }}
            >
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent
              style={selectDropdownStyle}
              className="border border-slate-200 rounded"
              position="popper"
            >
              {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={project.id}
                    style={selectItemStyle}
                    className="hover:bg-slate-100 rounded"
                  >
                    {project.name}{" "}
                    {project.teamName ? `(${project.teamName})` : ""}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No projects found.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Rate Selector */}
        <div className="space-y-2">
          <Label htmlFor="rate-select">Rate</Label>
          <Select
            value={selectedRate ?? ""}
            onValueChange={setSelectedRate}
            disabled={!selectedProject || rates.length === 0}
          >
            <SelectTrigger
              id="rate-select"
              className="w-full border-input"
              style={{ backgroundColor: "white", color: "black" }}
            >
              <SelectValue placeholder="Select a rate..." />
            </SelectTrigger>
            <SelectContent
              style={selectDropdownStyle}
              className="border border-slate-200 rounded"
              position="popper"
            >
              {rates.length > 0 ? (
                rates.map((rate) => (
                  <SelectItem
                    key={rate.id}
                    value={rate.id}
                    style={selectItemStyle}
                    className="hover:bg-slate-100 rounded"
                  >
                    {rate.name} ({rate.rate} DKK/h)
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  {selectedProject
                    ? "No rates for this project."
                    : "Select a project first."}
                </div>
              )}
            </SelectContent>
          </Select>
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
