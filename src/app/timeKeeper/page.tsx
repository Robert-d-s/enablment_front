"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { formatISO, parseISO } from "date-fns";

// Store and utility imports
import useStore from "../lib/store";
import { currentUserVar } from "../lib/apolloClient";
import { useTimer } from "../hooks/useTimer";

// Component imports
import NavigationBar from "../components/NavigationBar";
import FeedbackMessages from "../components/FeedbackMessages";
import TimerDisplay from "../components/TimerDisplay";
import TimerControls from "../components/TimerControls";
import ProjectRateSelectors from "../components/ProjectRateSelectors";

// GraphQL Queries & Mutations (unchanged)
const PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      id
      name
      teamId
    }
  }
`;

const RATES_QUERY = gql`
  query GetRates($teamId: String!) {
    rates(teamId: $teamId) {
      id
      name
      rate
    }
  }
`;

const TOTAL_TIME_PER_USER_PROJECT_QUERY = gql`
  query GetTotalTimeForUserProject($userId: Float!, $projectId: String!) {
    getTotalTimeForUserProject(userId: $userId, projectId: $projectId)
  }
`;

const GET_USER_PROJECTS = gql`
  query GetUserProjects {
    users {
      id
      teams {
        name
        projects {
          id
          name
        }
      }
    }
  }
`;

const CREATE_TIME_MUTATION = gql`
  mutation CreateTime($timeInputCreate: TimeInputCreate!) {
    createTime(timeInputCreate: $timeInputCreate) {
      id
      startTime
      endTime
      totalElapsedTime
    }
  }
`;

const UPDATE_TIME_MUTATION = gql`
  mutation UpdateTime($timeInputUpdate: TimeInputUpdate!) {
    updateTime(timeInputUpdate: $timeInputUpdate) {
      id
      startTime
      endTime
      totalElapsedTime
    }
  }
`;

const DELETE_TIME_MUTATION = gql`
  mutation DeleteTime($id: Float!) {
    deleteTime(id: $id) {
      id
    }
  }
`;

const TimeKeeper: React.FC = () => {
  const {
    projects,
    setProjects,
    rates,
    setRates,
    selectedProject,
    setSelectedProject,
    selectedRate,
    setSelectedRate,
    teamId,
    setTeamId,
  } = useStore();

  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [dateAlertMessage, setDateAlertMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState(false);

  const loggedInUser = currentUserVar();

  // Use our custom hook for timer logic
  const {
    isRunning,
    startTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime,
  } = useTimer();

  // GraphQL queries
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const { data: ratesData, error: ratesError } = useQuery(RATES_QUERY, {
    variables: { teamId },
    skip: !teamId,
  });
  const { data: userProjectsData } = useQuery(GET_USER_PROJECTS, {
    skip: !loggedInUser,
  });
  const {
    data: totalTimeData,
    loading: totalTimeLoading,
    error: totalTimeError,
    refetch: refetchTotalTime,
  } = useQuery(TOTAL_TIME_PER_USER_PROJECT_QUERY, {
    variables: {
      userId: loggedInUser ? parseFloat(loggedInUser.id) : null,
      projectId: selectedProject,
    },
    skip: !loggedInUser || !selectedProject,
  });

  // Mutations
  const [createTime] = useMutation(CREATE_TIME_MUTATION);
  const [updateTime] = useMutation(UPDATE_TIME_MUTATION);
  const [deleteTime] = useMutation(DELETE_TIME_MUTATION);

  useEffect(() => {
    if (projectsData) setProjects(projectsData.projects);
    if (ratesData) setRates(ratesData.rates);
  }, [projectsData, ratesData, setProjects, setRates]);

  useEffect(() => {
    if (userProjectsData && loggedInUser) {
      const userWithProjects = userProjectsData.users.find(
        (user: any) => user.id === loggedInUser.id
      );
      if (userWithProjects) {
        const projectsWithTeamName = userWithProjects.teams.flatMap(
          (team: any) =>
            team.projects.map((project: any) => ({
              ...project,
              teamName: team.name,
            }))
        );
        setUserProjects(projectsWithTeamName);
      }
    }
  }, [userProjectsData, loggedInUser]);

  useEffect(() => {
    if (selectedProject && projectsData) {
      const project = projectsData.projects.find(
        (p: any) => p.id === selectedProject
      );
      if (project) setTeamId(project.teamId);
    }
  }, [selectedProject, projectsData, setTeamId]);

  const handleDateChange = (date: Date | null) => {
    const now = new Date();
    if (date) {
      if (date > now) {
        setDateAlertMessage("Please select a current or past date/time.");
        setTimeout(() => setDateAlertMessage(null), 1000);
      } else {
        // Update the timer's startTime when the user selects a new date
        setStartTime(date);
      }
    }
  };

  const formatTimeFromMilliseconds = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${days} days, ${hours} hours, ${minutes} minutes`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startTime) {
      console.error("No start time set.");
      return;
    }
    try {
      const submissionTime = new Date();
      const totalElapsedTime = submissionTime.getTime() - startTime.getTime();
      const createVariables = {
        startTime: formatISO(startTime),
        endTime: formatISO(submissionTime),
        projectId: selectedProject,
        userId: loggedInUser?.id,
        rateId: parseFloat(selectedRate),
        totalElapsedTime,
      };
      const result = await createTime({
        variables: { timeInputCreate: createVariables },
      });
      setSubmissionSuccess(true);
      setSubmissionError("");
      setTimeout(() => setSubmissionSuccess(false), 2000);
    } catch (error) {
      if (error instanceof Error) {
        setSubmissionError("Error with time entry: " + error.message);
      } else {
        setSubmissionError("An unexpected error occurred.");
      }
    }
  };

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
          startDate={new Date()} // You can manage startDate separately if needed
          handleDateChange={handleDateChange}
        />
        <TimerControls
          isRunning={isRunning}
          handleStartStop={isRunning ? pause : start}
          handleReset={reset}
          handleSubmit={handleSubmit}
          disabledStartPause={!selectedProject || !selectedRate}
          disabledReset={!startTime}
          disabledSubmit={isRunning || !startTime}
        />
        <ProjectRateSelectors
          userProjects={userProjects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          rates={rates}
          selectedRate={selectedRate}
          setSelectedRate={setSelectedRate}
          totalTimeLoading={totalTimeLoading}
          totalTimeError={totalTimeError}
          totalTime={totalTimeData?.getTotalTimeForUserProject || 0}
          formatTimeFromMilliseconds={formatTimeFromMilliseconds}
        />
      </div>
    </>
  );
};

export default TimeKeeper;
