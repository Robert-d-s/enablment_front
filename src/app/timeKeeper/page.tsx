"use client";

import React, { useEffect, useState } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { useAuthStore } from "@/app/lib/authStore";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { useFeedbackState } from "@/app/hooks/useFeedbackState";
import { useTimeKeeperQueries } from "@/app/hooks/useTimekeeperQueries";
import { useTimeKeeperHandlers } from "@/app/hooks/useTimekeeperHandlers";
import useTimeKeeperData from "@/app/hooks/useTimeKeeperData";
import NavigationBar from "@/app/components/NavigationBar";
import FeedbackMessages from "@/app/components/FeedbackMessages";
import TimerDisplay from "@/app/components/TimerDisplay";
import TimerControls from "@/app/components/TimerControls";
import ProjectRateSelectors from "@/app/components/ProjectRateSelectors";
import { useTimerStore } from "@/app/lib/timerStore";

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
      showSuccessMessage: feedbackState.actions.showSuccessMessage,
      setSubmissionError: feedbackState.actions.setSubmissionError,
      showDateAlert: feedbackState.actions.showDateAlert,
      showResetMessage: feedbackState.actions.showResetMessage,
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
      <div className="relative max-w-6xl mx-auto p-6 rounded flex flex-col font-roboto-condensed">
        <FeedbackMessages {...feedbackState.state} />
        <TimerDisplay
          {...timerState}
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
    </>
  );
};

export default TimeKeeper;
