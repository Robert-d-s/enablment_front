"use client";

import React, { useState, useEffect, memo } from "react";
import { useQuery, useLazyQuery, gql, ApolloError, ApolloQueryResult } from "@apollo/client";
import { useAuthStore } from "@/app/lib/authStore";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";
import { useReactiveVar } from "@apollo/client";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import LoadingIndicator from "@/app/components/Admin/LoadingIndicator";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";

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

export const GET_MY_PROJECTS = gql`
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
    data: projectsData,
    loading: loadingUserProjects,
    error: errorUserProjects,
    refetch: refetchMyProjects,
  } = useQuery<GetMyProjectsQueryData>(GET_MY_PROJECTS, {
    skip: !loggedInUserId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("Error fetching my projects:", error);
      setErrorMessage("Could not load your projects.");
    },
  });

  useEffect(() => {
    if (projectsData?.myProjects) {
      setUserProjects(projectsData.myProjects);
      // initialize or adjust selection if needed
      if (!selectedProject && projectsData.myProjects.length > 0) {
        setSelectedProject(projectsData.myProjects[0].id);
      }
      if (
        selectedProject &&
        !projectsData.myProjects.some((p) => p.id === selectedProject)
      ) {
        setSelectedProject(projectsData.myProjects[0]?.id || "");
      }
    }
  }, [projectsData, selectedProject]);

  const [fetchTotalTime, { loading: loadingTime, error: errorTime, data: timeData }] =
    useLazyQuery<GetTotalTimeSpentQueryData>(GET_TOTAL_TIME_SPENT, {
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
    if (timeData) {
      setTotalTime(timeData.getTotalTimeSpent ?? 0);
      if (!errorTime) setErrorMessage(null);
    }
    if (timeData && timeData.getTotalTimeSpent === null) {
      setTotalTime(0);
    }
  }, [timeData, errorTime]);

  // Fetch total time only when all selectors have valid values
  useEffect(() => {
    if (loggedInUserId && selectedProject && startDate && endDate) {
      fetchTotalTime({ variables: { userId: loggedInUserId, projectId: selectedProject, startDate, endDate } });
    } else {
      setTotalTime(null);
    }
  }, [loggedInUserId, selectedProject, startDate, endDate, fetchTotalTime]);

  const isLoading = loadingUserProjects || loadingTime;
  const displayError =
    errorMessage || errorUserProjects?.message || errorTime?.message;

  // Subcomponent prop types
  interface ProjectSelectorProps {
    projects: MyProject[];
    selectedProject: string;
    onSelect: (val: string) => void;
    loading: boolean;
    error?: ApolloError;
    refetchProjects: () => Promise<ApolloQueryResult<GetMyProjectsQueryData>>;
  }

  interface DateFiltersProps {
    startDate: string;
    endDate: string;
    onStart: (val: string) => void;
    onEnd: (val: string) => void;
  }

  interface TimeDisplayProps {
    isLoading: boolean;
    displayError?: string;
    error: Error;
    onRetry: () => void;
    totalTime: number | null;
  }

  const ProjectSelector: React.FC<ProjectSelectorProps> = memo(
    ({
      projects,
      selectedProject,
      onSelect,
      loading,
      error,
      refetchProjects,
    }: ProjectSelectorProps) => (
      <div className="flex-grow w-full md:w-auto">
        {loading ? (
          <LoadingIndicator size="sm" />
        ) : error ? (
          <ErrorMessage error={error} context="Projects" onRetry={refetchProjects} />
        ) : (
          <Select
            value={selectedProject}
            onValueChange={onSelect}
            disabled={!projects.length}
          >
            <SelectTrigger className="flex w-fit items-center justify-between gap-2 rounded-md border  
bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs">
              <SelectValue
                className="block w-full truncate text-gray-800"
                placeholder={projects.length === 0 ? "No Projects Found" : "Select My Project"}
              />
            </SelectTrigger>
            <SelectContent className="w-auto min-w-full max-w-screen-md bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-10 left-0 right-auto">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} title={p.name + (p.teamName ? ` (${p.teamName})` : "")}>
                  {p.name} {p.teamName ? ` (${p.teamName})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  );
  ProjectSelector.displayName = "ProjectSelector";

  const DateFilters: React.FC<DateFiltersProps> = memo(
    ({ startDate, endDate, onStart, onEnd }: DateFiltersProps) => (
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStart(e.target.value)}
          className="w-full sm:w-44 h-9 p-2 bg-white border rounded shadow-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEnd(e.target.value)}
          className="w-full sm:w-44 h-9 p-2 bg-white border rounded shadow-sm"
        />
      </div>
    )
  );
  DateFilters.displayName = "DateFilters";

  // Skeleton loader to preserve layout during fetches
  const Skeleton: React.FC<{ width?: string; height?: string }> = ({ width = "w-20", height = "h-6" }) => (
    <div className={`${width} ${height} bg-gray-200 animate-pulse rounded`}></div>
  );

  const TimeDisplay: React.FC<TimeDisplayProps> = memo(
    ({ isLoading, displayError, error, onRetry, totalTime }: TimeDisplayProps) => (
      <div className="text-center md:text-right whitespace-nowrap min-h-[2.25rem]">
        {isLoading && !displayError ? (
          <Skeleton width="w-24" height="h-6" />
        ) : displayError ? (
          <ErrorMessage error={error} context="Total Time Calculation" onRetry={onRetry} />
        ) : (
          <p className="text-lg">{formatTimeFromMilliseconds(totalTime ?? 0)}</p>
        )}
      </div>
    )
  );
  TimeDisplay.displayName = "TimeDisplay";

  return (
    <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-white rounded shadow">
      <ProjectSelector
        projects={userProjects}
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
        loading={loadingUserProjects}
        error={errorUserProjects}
        refetchProjects={refetchMyProjects}
      />
      <DateFilters
        startDate={startDate}
        endDate={endDate}
        onStart={setStartDate}
        onEnd={setEndDate}
      />
      <TimeDisplay
        isLoading={isLoading}
        displayError={displayError}
        error={errorTime || errorUserProjects || new Error(displayError)}
        onRetry={() =>
          fetchTotalTime({
            variables: { userId: loggedInUserId, projectId: selectedProject, startDate, endDate },
          })
        }
        totalTime={totalTime}
      />
    </div>
  );
};

export default TotalTimeSpent;
