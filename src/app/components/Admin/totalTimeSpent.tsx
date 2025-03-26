"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useAuthStore } from "@/app/lib/authStore";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";

interface Project {
  id: string;
  name: string;
  teamName?: string;
}

interface Team {
  name: string;
  projects: Project[];
}

interface User {
  id: string;
  email: string;
  teams?: Team[];
}

const GET_DROPDOWN_OPTIONS = gql`
  query {
    users {
      id
      email
    }
    projects {
      id
      name
    }
  }
`;

const GET_TOTAL_TIME_SPENT = gql`
  query GetTotalTimeSpent(
    $userId: Float!
    $projectId: String!
    $startDate: String!
    $endDate: String!
  ) {
    getTotalTimeSpent(
      userId: $userId
      projectId: $projectId
      startDate: $startDate
      endDate: $endDate
    )
  }
`;

const GET_USER_PROJECTS = gql`
  query GetUserProjects {
    users {
      id
      teams {
        name
        projects {
          id
          name
        }
      }
    }
  }
`;

const getCurrentDate = () => new Date().toISOString().split("T")[0];

const TotalTimeSpent: React.FC = () => {
  const [totalTime, setTotalTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());

  // Use the auth store instead of reactive variable
  useCurrentUser();
  const loggedInUser = useAuthStore((state) => state.user);
  const [userProjects, setUserProjects] = useState<Project[]>([]);

  const { data: userProjectsData } = useQuery(GET_USER_PROJECTS, {
    skip: !loggedInUser,
  });

  const { error: errorOptions } = useQuery(GET_DROPDOWN_OPTIONS);
  const {
    loading: loadingTime,
    error: errorTime,
    data: timeData,
    refetch,
  } = useQuery(GET_TOTAL_TIME_SPENT, {
    variables: {
      userId: loggedInUser ? parseFloat(loggedInUser.id) : null,
      projectId: selectedProject,
      startDate,
      endDate,
    },
    skip: !loggedInUser || !selectedProject,
  });

  useEffect(() => {
    if (userProjectsData && loggedInUser) {
      const userWithProjects = userProjectsData.users.find(
        (user: User) => user.id === loggedInUser.id
      );
      if (userWithProjects) {
        const projectsWithTeamName = userWithProjects.teams.flatMap(
          (team: Team) =>
            team.projects.map((project: Project) => ({
              ...project,
              teamName: team.name,
            }))
        );
        setUserProjects(projectsWithTeamName);
      }
    }
  }, [userProjectsData, loggedInUser]);

  useEffect(() => {
    if (selectedProject) {
      refetch();
    }
  }, [selectedProject, startDate, endDate, refetch]);

  useEffect(() => {
    if (timeData) {
      setTotalTime(timeData.getTotalTimeSpent);
    }
  }, [timeData]);

  if (loadingTime) return <p>Loading...</p>;
  if (errorOptions || errorTime?.message) {
    const errorMessage = errorOptions
      ? errorOptions.message
      : errorTime?.message;
    return (
      <div className="bg-red-50 border-l-8 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.366-.47.977-.751 1.743-.751s1.377.281 1.743.75l6.857 8.8c.38.487.4 1.128.06 1.625a1.162 1.162 0 01-.86.426H2.25c-.334 0-.65-.14-.86-.426a1.163 1.163 0 01-.06-1.625l6.857-8.8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="text-sm text-red-600">
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black shadow-md flex flex-row justify-between items-center">
      <h3 className="text-lg font-bold text-white">
        Get Time Spent on Project
      </h3>
      <div>
        <select
          id="projectSelector"
          value={selectedProject || ""}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select a Project</option>
          {userProjects.map((project: Project) => (
            <option key={project.id} value={project.id}>
              {project.name} (Team: {project.teamName})
            </option>
          ))}
        </select>
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Total Time Display */}
      <p className="text-lg font-medium text-white">
        Total Time: {formatTimeFromMilliseconds(totalTime)}
      </p>
    </div>
  );
};

export default TotalTimeSpent;
