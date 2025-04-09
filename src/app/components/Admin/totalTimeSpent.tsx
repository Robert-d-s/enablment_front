"use client";

import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useAuthStore } from "@/app/lib/authStore";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";
import { useReactiveVar } from "@apollo/client";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";

interface MyProject {
  id: string;
  name: string;
  teamName?: string;
  teamId: string;
  __typename?: "Project";
}

interface GetMyProjectsQueryData {
  myProjects: MyProject[];
}

interface GetTotalTimeSpentQueryData {
  getTotalTimeSpent: number | null;
}

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

const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    myProjects {
      id
      name
      teamId
      teamName
      __typename
    }
  }
`;

const getCurrentDate = () => new Date().toISOString().split("T")[0];

const TotalTimeSpent: React.FC = () => {
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());

  const [userProjects, setUserProjects] = useState<MyProject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loggedInUser = useAuthStore((state) => state.user);
  const loggedInUserId = loggedInUser?.id;
  const teamsVersion = useReactiveVar(loggedInUserTeamsVersion);

  const {
    loading: loadingUserProjects,
    error: errorUserProjects,
    data: myProjectsData,
    refetch: refetchMyProjects,
  } = useQuery<GetMyProjectsQueryData>(GET_MY_PROJECTS, {
    skip: !loggedInUserId,
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.myProjects) {
        const currentProjects = data.myProjects;
        setUserProjects(currentProjects);
        const selectedExists = currentProjects.some(
          (p) => p.id === selectedProject
        );
        if (!selectedExists && currentProjects.length > 0) {
          setSelectedProject(currentProjects[0].id);
        } else if (!selectedExists && currentProjects.length === 0) {
          setSelectedProject("");
        }
      } else {
        setUserProjects([]);
        setSelectedProject("");
      }
    },
    onError: (error) => {
      console.error("Error fetching my projects:", error);
      setErrorMessage("Could not load your projects.");
    },
  });

  const {
    loading: loadingTime,
    error: errorTime,
    data: timeData,
    refetch: refetchTotalTime,
  } = useQuery<GetTotalTimeSpentQueryData>(GET_TOTAL_TIME_SPENT, {
    variables: {
      userId: loggedInUserId,
      projectId: selectedProject,
      startDate: startDate,
      endDate: endDate,
    },
    skip: !loggedInUserId || !selectedProject || !startDate || !endDate,
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("Error fetching total time:", error);
      setErrorMessage("Could not calculate total time for the selection.");
      setTotalTime(null);
    },
  });

  useEffect(() => {
    if (loggedInUserId) {
      console.log(
        `Teams version changed to ${teamsVersion}, refetching my projects.`
      );
      refetchMyProjects().catch((err) => {
        console.error("Failed to refetch my projects on version change:", err);
        setErrorMessage("Failed to update project list.");
      });
    }
  }, [teamsVersion, loggedInUserId, refetchMyProjects]);

  useEffect(() => {
    if (loggedInUserId && selectedProject && startDate && endDate) {
      console.log("Inputs changed, refetching total time...");
      refetchTotalTime({
        userId: loggedInUserId,
        projectId: selectedProject,
        startDate: startDate,
        endDate: endDate,
      }).catch((err) => {
        console.error("Manual refetch failed:", err);
        setErrorMessage("Failed to refresh total time.");
      });
    } else if (!selectedProject) {
      setTotalTime(null);
    }
  }, [loggedInUserId, selectedProject, startDate, endDate, refetchTotalTime]);

  useEffect(() => {
    if (timeData) {
      setTotalTime(timeData.getTotalTimeSpent ?? 0);
      if (!errorTime) setErrorMessage(null);
    }
    if (timeData && timeData.getTotalTimeSpent === null) {
      setTotalTime(0);
    }
  }, [timeData, errorTime]);

  const isLoading = loadingUserProjects || loadingTime;
  const displayError =
    errorMessage || errorUserProjects?.message || errorTime?.message;

  return (
    <div className="p-6 bg-black shadow-md flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
      <h3 className="text-lg font-bold text-white whitespace-nowrap">
        Time Spent Analysis (My Projects)
      </h3>

      {/* Project Selector */}
      <div className="flex-grow w-full md:w-auto">
        <select
          id="myProjectSelectorForTime"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loadingUserProjects || userProjects.length === 0}
        >
          <option value="">
            {loadingUserProjects
              ? "Loading My Projects..."
              : userProjects.length === 0
              ? "No Projects Found"
              : "Select My Project"}
          </option>
          {userProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} {project.teamName ? `(${project.teamName})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Date Pickers */}
      <div className="flex-grow w-full md:w-auto flex flex-col sm:flex-row gap-2">
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label="Start Date"
        />
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label="End Date"
        />
      </div>

      {/* Total Time Display */}
      <div className="text-center md:text-right whitespace-nowrap">
        {isLoading && !displayError && (
          <p className="text-gray-400">Loading Time...</p>
        )}
        {displayError && <p className="text-red-400 text-sm">{displayError}</p>}
        {!isLoading && !displayError && (
          <p className="text-lg font-medium text-white">
            Total:{" "}
            {totalTime !== null ? formatTimeFromMilliseconds(totalTime) : "N/A"}
          </p>
        )}
      </div>
    </div>
  );
};

export default TotalTimeSpent;
