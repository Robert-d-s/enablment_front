"use client";

import {
  useState,
  useEffect,
  memo,
  useCallback,
  useDeferredValue,
} from "react";
import { useReactiveVar } from "@apollo/client";
import { useAuthStore } from "@/app/lib/authStore";
import { formatTimeFromMilliseconds } from "@/app/utils/timeUtils";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import ProjectSelector from "../ProjectSelector";
import { DateRangePicker } from "./DateRangePicker";
import {
  useGetMyProjectsQuery,
  useGetTotalTimeSpentLazyQuery,
  type GetMyProjectsQuery,
} from "@/generated/graphql";

type MyProject = GetMyProjectsQuery["myProjects"][0];

const getCurrentDate = () => new Date();

const TotalTimeSpent: React.FC = () => {
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(getCurrentDate());
  const [endDate, setEndDate] = useState<Date | null>(getCurrentDate());

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
  const onStartDateChange = useCallback(
    (date: Date | null) => setStartDate(date),
    []
  );
  const onEndDateChange = useCallback(
    (date: Date | null) => setEndDate(date),
    []
  );

  const {
    data: projectsData,
    loading: loadingUserProjects,
    error: errorUserProjects,
    refetch: refetchMyProjects,
  } = useGetMyProjectsQuery({
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
  ] = useGetTotalTimeSpentLazyQuery({
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
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
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
  interface TimeDisplayProps {
    isLoading: boolean;
    displayError?: string;
    error: Error;
    onRetry: () => void;
    totalTime: number | null;
  }

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
            projects={userProjects.map((project) => ({
              id: project.id,
              name: project.name,
              teamName: project.teamName || undefined,
            }))}
            selectedProject={deferredProject}
            onProjectChange={onProjectChange}
            className="w-full"
          />
        </div>
      )}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        disabled={!deferredProject}
        startLabel="Start Date"
        endLabel="End Date"
        className="flex-grow"
      />
      <TimeDisplay
        isLoading={isLoading}
        displayError={displayError}
        error={errorTime || errorUserProjects || new Error(displayError)}
        onRetry={() =>
          loggedInUserId &&
          fetchTotalTime({
            variables: {
              userId: loggedInUserId,
              projectId: deferredProject,
              startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
              endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
            },
          })
        }
        totalTime={totalTime}
      />
    </div>
  );
};

export default TotalTimeSpent;
