"use client";
import React from "react";
import ProjectSelector from "../components/ProjectSelector";
import RateSelector from "../components/RateSelector";

interface ProjectRateSelectorsProps {
  userProjects: any[];
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  rates: any[];
  selectedRate: string;
  setSelectedRate: (rateId: string) => void;
  totalTimeLoading: boolean;
  totalTimeError: any;
  totalTime: number;
  formatTimeFromMilliseconds: (ms: number) => string;
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
  formatTimeFromMilliseconds,
}) => {
  return (
    <div className="flex flex-col justify-center -mx-3">
      <div className="w-1/2 mx-auto px-3 mb-4">
        <ProjectSelector
          projects={userProjects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
        />
      </div>
      <div className="w-1/2 mx-auto px-3 mb-4">
        <RateSelector
          rates={rates}
          selectedRate={selectedRate}
          onRateChange={setSelectedRate}
        />
      </div>
      <div className="w-1/2 mx-auto px-3 mb-4">
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
