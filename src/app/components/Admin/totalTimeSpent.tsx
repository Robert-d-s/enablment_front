"use client";

import React, {
  useState,
  useEffect,
  memo,
  useCallback,
  useDeferredValue,
} from "react";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { useAuthStore } from "@/app/lib/authStore";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";
import { useReactiveVar } from "@apollo/client";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
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

  const deferredProject = useDeferredValue(selectedProject);
  const onProjectChange = useCallback(
    (id: string) => {
      if (id !== selectedProject) setSelectedProject(id);
    },
    [selectedProject]
  );
  const onStart = useCallback((d: string) => setStartDate(d), []);
  const onEnd = useCallback((d: string) => setEndDate(d), []);

  const {
    data: projectsData,
    loading: loadingUserProjects,
    error: errorUserProjects,
    refetch: refetchMyProjects,
  } = useQuery<GetMyProjectsQueryData>(GET_MY_PROJECTS, {
    skip: !loggedInUserId,
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("Error fetching my projects:", error);
      setErrorMessage("Could not load your projects.");
    },
  });

  useEffect(() => {
    if (projectsData?.myProjects) {
      const newProjects = projectsData.myProjects;
      // Only set when list really changes
      if (
        newProjects.length !== userProjects.length ||
        newProjects.some((p, i) => p.id !== userProjects[i]?.id)
      ) {
        setUserProjects(newProjects);
      }
    }
  }, [projectsData, userProjects]);

  const [
    fetchTotalTime,
    { loading: loadingTime, error: errorTime, data: timeData },
  ] = useLazyQuery<GetTotalTimeSpentQueryData>(GET_TOTAL_TIME_SPENT, {
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("Error fetching total time:", error);
      setErrorMessage("Could not calculate total time for the selection.");
      setTotalTime(null);
    },
  });

  useEffect(() => {
    if (loggedInUserId && teamsVersion > 0) {
      console.log(
        `Teams version changed to ${teamsVersion}, refetching my projects.`
      );
      refetchMyProjects().catch((err) => {
        console.error("Failed to refetch my projects on version change:", err);
        setErrorMessage("Failed to update project list.");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsVersion]);

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
    if (loggedInUserId && deferredProject && startDate && endDate) {
      fetchTotalTime({
        variables: {
          userId: loggedInUserId,
          projectId: deferredProject,
          startDate,
          endDate,
        },
      });
    }
    // keep previous totalTime until new data arrives
  }, [loggedInUserId, deferredProject, startDate, endDate, fetchTotalTime]);

  if (loadingUserProjects) {
    return null;
  }

  const isLoading = loadingUserProjects || loadingTime;
  const displayError =
    errorMessage || errorUserProjects?.message || errorTime?.message;

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
    ({
      startDate,
      endDate,
      onStart,
      onEnd,
      disabled = false,
    }: DateFiltersProps) => {
      const parseLocalDateString = (dateString: string | null): Date | null => {
        if (!dateString) return null;
        const parts = dateString.split("-").map((part) => parseInt(part, 10));
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        return new Date(dateString);
      };

      const startDateObj = parseLocalDateString(startDate);
      const endDateObj = parseLocalDateString(endDate);

      return (
        <div className="flex-grow flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1">
            <Label htmlFor="total-start-date" className="sr-only">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="total-start-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !startDateObj && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDateObj ? (
                    format(startDateObj, "PPP")
                  ) : (
                    <span>Pick a start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDateObj || undefined}
                  onSelect={(date) => {
                    onStart(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  disabled={(date) =>
                    (endDateObj && date > endDateObj) || date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            {" "}
            {/* Removed datepicker-wrapper */}
            <Label htmlFor="total-end-date" className="sr-only">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="total-end-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !endDateObj && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDateObj ? (
                    format(endDateObj, "PPP")
                  ) : (
                    <span>Pick an end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDateObj || undefined}
                  onSelect={(date) => {
                    onEnd(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  disabled={(date) =>
                    (startDateObj && date < startDateObj) || date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      );
    }
  );
  DateFilters.displayName = "DateFilters";

  const TimeDisplay: React.FC<TimeDisplayProps> = memo(
    ({
      isLoading,
      displayError,
      error,
      onRetry,
      totalTime,
    }: TimeDisplayProps) => (
      <div className="text-center md:text-right whitespace-nowrap min-h-[2.25rem]">
        {isLoading && !displayError ? (
          <Skeleton className="w-24 h-6" />
        ) : displayError ? (
          <ErrorMessage
            error={error}
            context="Total Time Calculation"
            onRetry={onRetry}
          />
        ) : (
          <p className="text-lg">
            {formatTimeFromMilliseconds(totalTime ?? 0)}
          </p>
        )}
      </div>
    )
  );
  TimeDisplay.displayName = "TimeDisplay";

  const MemoProjectSelector = memo(ProjectSelector);

  return (
    <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-white rounded shadow">
      {errorUserProjects ? (
        <ErrorMessage
          error={errorUserProjects}
          context="Projects"
          onRetry={refetchMyProjects}
        />
      ) : (
        <div className="w-full sm:w-64">
          <MemoProjectSelector
            projects={userProjects}
            selectedProject={deferredProject}
            onProjectChange={onProjectChange}
            className="w-full"
          />
        </div>
      )}
      <DateFilters
        startDate={startDate}
        endDate={endDate}
        onStart={onStart}
        onEnd={onEnd}
        disabled={!deferredProject}
      />
      <TimeDisplay
        isLoading={isLoading}
        displayError={displayError}
        error={errorTime || errorUserProjects || new Error(displayError)}
        onRetry={() =>
          fetchTotalTime({
            variables: {
              userId: loggedInUserId,
              projectId: deferredProject,
              startDate,
              endDate,
            },
          })
        }
        totalTime={totalTime}
      />
    </div>
  );
};

export default TotalTimeSpent;
