"use client";

import React, { useEffect, useState } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import useStore from "@/app/lib/store";
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

const TimeKeeper: React.FC = () => {
  const { selectedProject, setSelectedProject, selectedRate, setSelectedRate } =
    useStore();
  const timerState = useTimer();
  const { userProjects, currentTeamId } = useTimeKeeperData();
  const feedbackState = useFeedbackState();

  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);

  useCurrentUser();
  const loggedInUser = useAuthStore((state) => state.user);

  const {
    ratesData,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry,
    updateTime,
  } = useTimeKeeperQueries(
    currentTeamId!,
    selectedProject,
    loggedInUser?.id?.toString() ?? ""
  );

  const { handleDateChange, handleSubmit, handleReset } = useTimeKeeperHandlers(
    {
      timerState,
      selectedProject,
      selectedRate,
      userId: loggedInUser?.id?.toString() ?? "",
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
    if (selectedProject) {
      refetch();
    }
  }, [selectedProject, refetch]);

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
          disabledStartPause={!selectedProject || !selectedRate}
          disabledReset={!timerState.initialStartTime}
          disabledSubmit={timerState.isRunning || !timerState.initialStartTime}
        />
        <ProjectRateSelectors
          userProjects={userProjects.map((p) => ({
            ...p,
            teamName: p.teamName ?? "Unknown Team",
          }))}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          rates={ratesData?.rates ?? []}
          selectedRate={selectedRate}
          setSelectedRate={setSelectedRate}
          totalTimeLoading={totalTimeLoading}
          totalTimeError={totalTimeError}
          totalTime={totalTimeData?.getTotalTimeForUserProject ?? 0}
        />
      </div>
    </>
  );
};

export default TimeKeeper;
