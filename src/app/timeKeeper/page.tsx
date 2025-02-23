"use client";

import React, { useEffect } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { currentUserVar } from "@/app/lib/apolloClient";
import useStore from "@/app/lib/store";
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

  const loggedInUser = currentUserVar();
  const {
    ratesData,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry,
  } = useTimeKeeperQueries(
    currentTeamId!,
    selectedProject,
    loggedInUser?.id || ""
  );

  const { handleDateChange, handleSubmit } = useTimeKeeperHandlers({
    timerState,
    selectedProject,
    selectedRate,
    userId: loggedInUser?.id || "",
    createTimeEntry,
    ...feedbackState.actions,
  });

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
          startDate={timerState.startTime ?? new Date()}
          handleDateChange={handleDateChange}
        />
        <TimerControls
          isRunning={timerState.isRunning}
          handleStartStop={
            timerState.isRunning ? timerState.pause : timerState.start
          }
          handleReset={timerState.reset}
          handleSubmit={handleSubmit}
          disabledStartPause={!selectedProject || !selectedRate}
          disabledReset={!timerState.startTime}
          disabledSubmit={timerState.isRunning || !timerState.startTime}
        />
        <ProjectRateSelectors
          userProjects={userProjects}
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
