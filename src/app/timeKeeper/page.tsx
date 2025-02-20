"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, ApolloError } from "@apollo/client";
import { formatISO } from "date-fns";
import NavigationBar from "@/app/components/NavigationBar";
import FeedbackMessages from "@/app/components/FeedbackMessages";
import TimerDisplay from "@/app/components/TimerDisplay";
import TimerControls from "@/app/components/TimerControls";
import ProjectRateSelectors from "@/app/components/ProjectRateSelectors";
import { currentUserVar } from "@/app/lib/apolloClient";
import useStore from "@/app/lib/store";
import { useTimer } from "@/app/hooks/useTimer";
import {
  RATES_QUERY,
  TOTAL_TIME_QUERY,
  CREATE_TIME_MUTATION,
} from "@/app/graphql/timeKeeperOperations";
import useTimeKeeperData from "@/app/hooks/useTimeKeeperData";

const TimeKeeper: React.FC = () => {
  const { selectedProject, setSelectedProject, selectedRate, setSelectedRate } =
    useStore();

  // Timer hook for managing timing
  const {
    isRunning,
    startTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime,
  } = useTimer();

  // Use custom hook to fetch projects and compute current team ID
  const { userProjects, currentTeamId } = useTimeKeeperData();

  // Query for rates based on currentTeamId
  const { data: newRatesData } = useQuery(RATES_QUERY, {
    variables: { teamId: currentTeamId! },
    skip: !currentTeamId,
  });

  // Query for total time spent on the selected project
  const loggedInUser = currentUserVar();
  const {
    data: totalTimeData,
    loading: totalTimeLoading,
    error: totalTimeError,
    refetch,
  } = useQuery(TOTAL_TIME_QUERY, {
    variables: {
      userId: loggedInUser ? parseFloat(loggedInUser.id) : 0,
      projectId: selectedProject || "",
    },
    skip: !loggedInUser || !selectedProject,
  });

  // Mutation for creating a new time entry
  const [createTime] = useMutation(CREATE_TIME_MUTATION);

  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [dateAlertMessage, setDateAlertMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState(false);

  const handleDateChange = (date: Date | null): void => {
    const now = new Date();
    if (date) {
      if (date > now) {
        setDateAlertMessage("Please select a current or past date/time.");
        setTimeout(() => setDateAlertMessage(null), 3000);
      } else {
        setStartTime(date);
      }
    }
  };

  const handleReset = () => {
    reset(); // This comes from useTimer hook
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startTime || !selectedProject || !loggedInUser || !selectedRate) {
      console.error("Missing required data for time entry.");
      return;
    }
    try {
      const submissionTime = new Date();
      const totalElapsedTime = submissionTime.getTime() - startTime.getTime();
      const createVariables = {
        startTime: formatISO(startTime),
        endTime: formatISO(submissionTime),
        projectId: selectedProject,
        userId: loggedInUser.id,
        rateId: parseFloat(selectedRate),
        totalElapsedTime,
      };
      await createTime({ variables: { timeInputCreate: createVariables } });
      setSubmissionSuccess(true);
      setSubmissionError("");
      setTimeout(() => setSubmissionSuccess(false), 2000);
    } catch (error) {
      if (error instanceof ApolloError) {
        setSubmissionError("Error with time entry: " + error.message);
      } else {
        setSubmissionError("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    if (selectedProject) {
      refetch();
    }
  }, [selectedProject, refetch]);

  return (
    <>
      <NavigationBar />
      <div className="relative max-w-6xl mx-auto p-6 rounded flex flex-col font-roboto-condensed">
        <FeedbackMessages
          submissionSuccess={submissionSuccess}
          submissionError={submissionError}
          resetMessage={resetMessage}
          dateAlertMessage={dateAlertMessage}
        />
        <TimerDisplay
          isRunning={isRunning}
          displayTime={displayTime}
          startTime={startTime}
          startDate={startTime ?? new Date()}
          handleDateChange={handleDateChange}
        />
        <TimerControls
          isRunning={isRunning}
          handleStartStop={isRunning ? pause : start}
          handleReset={handleReset}
          handleSubmit={handleSubmit}
          disabledStartPause={!selectedProject || !selectedRate}
          disabledReset={!startTime}
          disabledSubmit={isRunning || !startTime}
        />
        <ProjectRateSelectors
          userProjects={userProjects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          rates={newRatesData ? newRatesData.rates : []}
          selectedRate={selectedRate}
          setSelectedRate={setSelectedRate}
          totalTimeLoading={totalTimeLoading}
          totalTimeError={totalTimeError}
          totalTime={totalTimeData?.getTotalTimeForUserProject || 0}
        />
      </div>
    </>
  );
};

export default TimeKeeper;
