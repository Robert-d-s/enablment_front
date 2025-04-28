"use client";

import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type ProjectSelectorProps = {
  projects: { id: string; name: string; teamName?: string }[];
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
       <Select
        value={selectedProject}
          onValueChange={onProjectChange}
             >
        <SelectTrigger className="w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm text-gray-500 focus:ring-indigo-500 focus:border-indigo-500">
           <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id} className="text-sm">
               {project.name} (Team: {project.teamName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  );
};

export default ProjectSelector;
