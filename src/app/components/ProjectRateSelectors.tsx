"use client";

import React from "react";
import ProjectSelector from "./ProjectSelector";
import RateSelector from "./RateSelector";
import { ApolloError } from "@apollo/client";
import { formatTimeFromMilliseconds } from "../utils/timeUtils";

interface Project {
  id: string;
  name: string;
  teamName: string;
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
    <div className="mt-6">
      <div className="mb-4">
        <ProjectSelector
          projects={userProjects}
          selectedProject={selectedProject ?? ""}
          onProjectChange={setSelectedProject}
        />
      </div>
      <div className="mb-4">
        <RateSelector
          rates={rates}
          selectedRate={selectedRate ?? ""}
          onRateChange={setSelectedRate}
        />
      </div>
      <div className="mt-4">
        {totalTimeLoading ? (
          <p>Loading total time...</p>
        ) : totalTimeError ? (
          <p>Error loading total time: {totalTimeError.message}</p>
        ) : (
          <p>
            Your time on project so far: {formatTimeFromMilliseconds(totalTime)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectRateSelectors;
