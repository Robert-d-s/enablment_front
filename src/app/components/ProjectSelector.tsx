"use client";

import React from "react";

type ProjectSelectorProps = {
  projects: { id: string; name: string; teamName: string }[];
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  className?: string;
};

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onProjectChange,
}) => {
  return (
    <select
      value={selectedProject}
      onChange={(e) => onProjectChange(e.target.value)}
      className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="" disabled>
        Select a project
      </option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name} (Team: {project.teamName})
        </option>
      ))}
    </select>
  );
};

export default ProjectSelector;
