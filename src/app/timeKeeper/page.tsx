"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { useAuthStore } from "@/app/lib/authStore";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { useFeedbackState } from "@/app/hooks/useFeedbackState";
import { useTimeKeeperQueries } from "@/app/hooks/useTimekeeperQueries";
import { useTimeKeeperHandlers } from "@/app/hooks/useTimekeeperHandlers";
import useTimeKeeperData from "@/app/hooks/useTimeKeeperData";
import NavigationBar from "@/app/components/NavigationBar";
import TimerDisplay from "@/app/components/TimerDisplay";
import TimerControls from "@/app/components/TimerControls";
import ProjectRateSelectors from "@/app/components/ProjectRateSelectors";
import { useTimerStore } from "@/app/lib/timerStore";
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
  const [uiSelectedProject, setUiSelectedProject] = useState<string>("");
  const [uiSelectedRate, setUiSelectedRate] = useState<string>("");
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
  const timerState = useTimer(uiSelectedProject, uiSelectedRate);
  const { userProjects, currentTeamId } = useTimeKeeperData(uiSelectedProject);
  const feedbackState = useFeedbackState();

  useCurrentUser();

  const {
    ratesData,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry,
    updateTime,
  } = useTimeKeeperQueries(currentTeamId, uiSelectedProject, userIdString);

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

  useEffect(() => {
    if (initialStartTimeISO) {
      setUiSelectedProject(activeTimerProjectId ?? "");
      setUiSelectedRate(activeTimerRateId ?? "");
    } else {
      setUiSelectedProject("");
      setUiSelectedRate("");
    }
  }, [activeTimerProjectId, activeTimerRateId, initialStartTimeISO]);

  useEffect(() => {
    if (uiSelectedProject && loggedInUser?.id) {
      refetch();
    }
  }, [uiSelectedProject, refetch, loggedInUser?.id]);

  const isStartPauseDisabled = !uiSelectedProject || !uiSelectedRate;
  const isResetDisabled = !timerState.initialStartTime;
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
        </div>

        {/* Right Column (Selectors & Info) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ProjectRateSelectors
            userProjects={userProjects.map((p) => ({
              ...p,
              teamName: p.teamName ?? "Unknown Team",
            }))}
            selectedProject={uiSelectedProject}
            setSelectedProject={setUiSelectedProject}
            rates={ratesData?.rates ?? []}
            selectedRate={uiSelectedRate}
            setSelectedRate={setUiSelectedRate}
            totalTimeLoading={totalTimeLoading}
            totalTimeError={totalTimeError}
            totalTime={totalTimeData?.getTotalTimeForUserProject ?? 0}
          />
        </div>
      </div>
    </>
  );
};

export default TimeKeeper;
