"use client";

import React, { useState, useEffect, memo } from "react";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { useAuthStore } from "@/app/lib/authStore";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";
import { useReactiveVar } from "@apollo/client";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import LoadingIndicator from "@/app/components/Admin/LoadingIndicator";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/globals.css";
import { cn } from "@/app/lib/utils";
import { Label } from "@/components/ui/label";
import ProjectSelector from "../ProjectSelector";

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
          }
       }, [projectsData]);

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

  const datePickerInputClass = cn(
    "w-full h-9 px-3 py-1 text-sm",
    "border border-input",
    "rounded-md",
    "bg-background",
    "shadow-sm",
    "focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "placeholder:text-muted-foreground"
  );

  interface DateFiltersProps {
    startDate: string;
    endDate: string;
    onStart: (val: string) => void;
    onEnd: (val: string) => void;
    disabled?: boolean;
  }

  interface TimeDisplayProps {
    isLoading: boolean;
    displayError?: string;
    error: Error;
    onRetry: () => void;
    totalTime: number | null;
  }

  const DateFilters: React.FC<DateFiltersProps> = memo(
    ({ startDate, endDate, onStart, onEnd, disabled= false }: DateFiltersProps) => {
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      return (
        <div className="flex-grow flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 datepicker-wrapper">
            <Label htmlFor="total-start-date" className="sr-only">Start Date</Label>
            <DatePicker
              disabled={disabled}
              id="total-start-date"
              selected={disabled ? null : startDateObj}
              onChange={(date: Date | null) => onStart(date ? date.toISOString().split("T")[0] : "")}
              selectsStart
              startDate={startDateObj}
              endDate={endDateObj}
              dateFormat="yyyy-MM-dd"
              placeholderText="Start Date"
              className={datePickerInputClass}
              wrapperClassName="w-full"
              isClearable
              maxDate={endDateObj || new Date()}
              popperPlacement="bottom-start"
            />
          </div>
          <div className="flex-1 datepicker-wrapper">
            <Label htmlFor="total-end-date" className="sr-only">End Date</Label>
            <DatePicker
              disabled={disabled}
              id="total-end-date"
              selected={disabled ? null : endDateObj}
              onChange={(date: Date | null) => onEnd(date ? date.toISOString().split("T")[0] : "")}
              selectsEnd
              startDate={startDateObj}
              endDate={endDateObj}
              minDate={startDateObj || undefined}
              maxDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="End Date"
              className={datePickerInputClass}
              wrapperClassName="w-full"
              isClearable
              popperPlacement="bottom-start"
            />
          </div>
        </div>
      );
    }
  );
  DateFilters.displayName = "DateFilters";

  const TimeDisplay: React.FC<TimeDisplayProps> = memo(
    ({ isLoading, displayError, error, onRetry, totalTime }: TimeDisplayProps) => (
      <div className="text-center md:text-right whitespace-nowrap min-h-[2.25rem]">
        {isLoading && !displayError ? (
          <Skeleton className="w-24 h-6" />
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
      {loadingUserProjects ? (
        <LoadingIndicator size="sm" />
      ) : errorUserProjects ? (
        <ErrorMessage
          error={errorUserProjects}
          context="Projects"
          onRetry={refetchMyProjects}
        />
      ) : (
        <ProjectSelector
          projects={userProjects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          className="w-full"
        />
      )}
      <DateFilters
        startDate={startDate}
        endDate={endDate}
        onStart={setStartDate}
        onEnd={setEndDate}
        disabled={!selectedProject}
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
