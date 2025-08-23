"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { useAuthStore } from "@/app/lib/authStore";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { useFeedbackState } from "@/app/hooks/useFeedbackState";
import { useTimeKeeperQueries } from "@/app/hooks/useTimekeeperQueries";
import { useTimeKeeperHandlers } from "@/app/hooks/useTimekeeperHandlers";
import useTimeKeeperData from "@/app/hooks/useTimeKeeperData";
import NavigationBar from "@/app/components/Admin/NavigationBar";
import TimerDisplay from "@/app/components/timer/TimerDisplay";
import TimerControls from "@/app/components/timer/TimerControls";
import ProjectRateSelectors from "@/app/components/timer/ProjectRateSelectors";
import PageErrorBoundary from "@/app/components/ErrorBoundaries/PageErrorBoundary";
import AuthError from "@/app/components/AuthError";
import LoadingError from "@/app/components/LoadingError";
import { useTimerStore } from "@/app/lib/timerStore";
import { useTimerSelectionStore } from "@/app/lib/timerSelectionStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const TimeKeeper: React.FC = () => {
  const loggedInUser = useAuthStore((state) => state.user);
  const userIdString = loggedInUser?.id?.toString() ?? "";
  const currentEntryId = useTimerStore((state) => state.currentEntryId);
  const activeTimerProjectId = useTimerStore(
    (state) => state.activeTimerProjectId
  );
  const activeTimerRateId = useTimerStore((state) => state.activeTimerRateId);
  const initialStartTimeISO = useTimerStore(
    (state) => state.initialStartTimeISO
  );
  const setCurrentEntryId = useTimerStore((state) => state.setCurrentEntryId);

  // Use timer selection store instead of local state
  const {
    selectedProjectId,
    selectedRateId,
    setSelectedProject,
    setSelectedRate,
  } = useTimerSelectionStore();

  // All hooks must be called before any conditional returns
  const timerState = useTimer(selectedProjectId, selectedRateId);
  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useCurrentUser();
  const {
    userProjects,
    currentTeamId,
    loadingUserProjects,
    errorUserProjects,
  } = useTimeKeeperData(selectedProjectId);
  const feedbackState = useFeedbackState();
  const {
    ratesData,
    ratesError,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry,
    updateTime,
  } = useTimeKeeperQueries(currentTeamId, selectedProjectId, userIdString);

  const showSuccessToast = useCallback(
    () => toast.success("Time entry saved!"),
    []
  );
  const showErrorToast = useCallback(
    (message: string) => toast.error(message || "An error occurred."),
    []
  );
  const showResetToast = useCallback(() => toast.info("Timer reset!"), []);
  const showDateAlertToast = useCallback(
    (message: string) => toast.warn(message),
    []
  );

  const { handleDateChange, handleSubmit, handleReset } = useTimeKeeperHandlers(
    {
      timerState,
      timerProjectId: activeTimerProjectId ?? "",
      timerRateId: activeTimerRateId ?? "",
      userId: userIdString,
      createTimeEntry,
      updateTime,
      currentEntryId,
      setCurrentEntryId,
      showSuccessMessage: showSuccessToast,
      setSubmissionError: feedbackState.actions.setSubmissionError,
      showDateAlert: showDateAlertToast,
      showResetMessage: showResetToast,
    }
  );

  const processedUserProjects = useMemo(
    () =>
      userProjects.map((p) => ({
        ...p,
        teamName: p.teamName ?? "Unknown Team",
      })),
    [userProjects]
  );

  useEffect(() => {
    if (feedbackState.state.submissionError) {
      showErrorToast(feedbackState.state.submissionError);
      feedbackState.actions.setSubmissionError("");
    }
  }, [
    feedbackState.state.submissionError,
    showErrorToast,
    feedbackState.actions,
  ]);

  useEffect(() => {
    if (initialStartTimeISO) {
      setSelectedProject(activeTimerProjectId ?? "");
      setSelectedRate(activeTimerRateId ?? "");
    } else {
      setSelectedProject("");
      setSelectedRate("");
    }
  }, [
    activeTimerProjectId,
    activeTimerRateId,
    initialStartTimeISO,
    setSelectedProject,
    setSelectedRate,
  ]);

  useEffect(() => {
    if (selectedProjectId && loggedInUser?.id) {
      refetch();
    }
  }, [selectedProjectId, refetch, loggedInUser?.id]);

  if (authError && !isAuthenticated) {
    return (
      <>
        <NavigationBar />
        <AuthError message="Authentication failed. Please log in to access the time tracker." />
      </>
    );
  }

  // Early return for authentication loading
  if (authLoading || (!isAuthenticated && !loggedInUser)) {
    return (
      <>
        <NavigationBar />
        <LoadingError error={null} isLoading={true} context="authentication" />
      </>
    );
  }

  // Early return for missing user ID (should not happen if authenticated, but safety check)
  if (!userIdString || userIdString === "") {
    return (
      <>
        <NavigationBar />
        <AuthError message="User authentication is incomplete. Please log out and log back in." />
      </>
    );
  }

  // Early return for user projects loading error
  if (errorUserProjects) {
    return (
      <>
        <NavigationBar />
        <LoadingError
          error={errorUserProjects}
          context="user projects"
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  // Show loading state for user projects
  if (loadingUserProjects) {
    return (
      <>
        <NavigationBar />
        <LoadingError error={null} isLoading={true} context="projects" />
      </>
    );
  }

  const isStartPauseDisabled = !selectedProjectId || !selectedRateId;
  const isResetDisabled = !timerState.initialStartTime || timerState.isRunning;
  const isSubmitDisabled = timerState.isRunning || !timerState.initialStartTime;

  return (
    <>
      <NavigationBar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 font-roboto-condensed">
        {/* Left Column (Timer Display & Controls) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracker</CardTitle>
              <CardDescription>
                Start, pause, or submit your work time.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
              <TimerDisplay
                isRunning={timerState.isRunning}
                displayTime={timerState.displayTime}
                initialStartTime={timerState.initialStartTime}
                handleDateChange={handleDateChange}
                isTimerRunning={timerState.isRunning}
              />
              <TimerControls
                isRunning={timerState.isRunning}
                handleStartStop={
                  timerState.isRunning ? timerState.pause : timerState.start
                }
                handleReset={handleReset}
                handleSubmit={handleSubmit}
                disabledStartPause={isStartPauseDisabled}
                disabledReset={isResetDisabled}
                disabledSubmit={isSubmitDisabled}
              />
            </CardContent>
          </Card>
        </div>{" "}
        {/* Right Column (Selectors & Info) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {" "}
          <ProjectRateSelectors
            userProjects={processedUserProjects}
            rates={ratesData?.rates ?? []}
            totalTimeLoading={totalTimeLoading}
            totalTimeError={totalTimeError}
            totalTime={totalTimeData?.getTotalTimeForUserProject ?? 0}
            isTimerRunning={timerState.isRunning}
            ratesError={ratesError}
          />
        </div>
      </div>
    </>
  );
};

const TimeKeeperWithErrorBoundary: React.FC = () => {
  return (
    <PageErrorBoundary pageName="Time Keeper">
      <TimeKeeper />
    </PageErrorBoundary>
  );
};

export default TimeKeeperWithErrorBoundary;
