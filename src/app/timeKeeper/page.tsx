"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { formatISO } from "date-fns";

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

// GraphQL Queries & Mutations
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

const TOTAL_TIME_QUERY = gql`
  query GetTotalTimeForUserProject($userId: Float!, $projectId: String!) {
    getTotalTimeForUserProject(userId: $userId, projectId: $projectId)
  }
`;

interface Project {
  id: string;
  name: string;
  teamId: string;
}

interface Rate {
  id: string;
  name: string;
  rate: number;
}

interface UserProject {
  id: string;
  name: string;
  teamName: string;
}

interface ProjectsQueryData {
  projects: Project[];
}

interface RatesQueryData {
  rates: Rate[];
}

interface UserProjectsQueryData {
  users: {
    id: string;
    teams: {
      name: string;
      projects: Project[];
    }[];
  }[];
}

interface TotalTimeData {
  getTotalTimeForUserProject: number;
}

const USER_PROJECTS_QUERY = gql`
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

const TimeKeeper: React.FC = () => {
  const {
    setProjects,
    setRates,
    selectedProject,
    setSelectedProject,
    selectedRate,
    setSelectedRate,
    setTeamId,
  } = useStore();

  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>("");
  const [dateAlertMessage, setDateAlertMessage] = useState<string | null>(null);

  const loggedInUser = currentUserVar();

  // Timer hook provides timer logic
  const {
    isRunning,
    startTime,
    displayTime,
    start,
    pause,
    reset,
    setStartTime,
  } = useTimer();

  const { data: projectsData } = useQuery<ProjectsQueryData>(PROJECTS_QUERY);
  const { data: ratesData } = useQuery<RatesQueryData>(RATES_QUERY, {
    variables: { teamId: undefined },
    skip: true,
  });
  const { data: userProjectsData } = useQuery<UserProjectsQueryData>(
    USER_PROJECTS_QUERY,
    {
      skip: !loggedInUser,
    }
  );
  const {
    data: totalTimeData,
    loading: totalTimeLoading,
    error: totalTimeError,
  } = useQuery<TotalTimeData>(TOTAL_TIME_QUERY, {
    variables: {
      userId: loggedInUser ? parseFloat(loggedInUser.id) : 0,
      projectId: selectedProject || "",
    },
    skip: !loggedInUser || !selectedProject,
  });

  const [createTime] = useMutation(CREATE_TIME_MUTATION);

  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData.projects);
    }
  }, [projectsData, setProjects]);

  useEffect(() => {
    if (ratesData) {
      setRates(ratesData.rates);
    }
  }, [ratesData, setRates]);

  useEffect(() => {
    if (userProjectsData && loggedInUser) {
      const user = userProjectsData.users.find((u) => u.id === loggedInUser.id);
      if (user) {
        const projectsList: UserProject[] = user.teams.flatMap((team) =>
          team.projects.map((project) => ({
            id: project.id,
            name: project.name,
            teamName: team.name,
          }))
        );
        setUserProjects(projectsList);
      }
    }
  }, [userProjectsData, loggedInUser]);

  useEffect(() => {
    if (selectedProject && projectsData) {
      const project = projectsData.projects.find(
        (p) => p.id === selectedProject
      );
      if (project) {
        setTeamId(project.teamId);
      }
    }
  }, [selectedProject, projectsData, setTeamId]);

  const [currentTeamId, setCurrentTeamId] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (projectsData && selectedProject) {
      const project = projectsData.projects.find(
        (p) => p.id === selectedProject
      );
      if (project && project.teamId !== currentTeamId) {
        setCurrentTeamId(project.teamId);
      }
    }
  }, [selectedProject, projectsData, currentTeamId]);

  const { data: newRatesData } = useQuery<RatesQueryData>(RATES_QUERY, {
    variables: { teamId: currentTeamId! },
    skip: !currentTeamId,
  });
  useEffect(() => {
    if (newRatesData) {
      setRates(newRatesData.rates);
    }
  }, [newRatesData, setRates]);

  const handleDateChange = (date: Date | null): void => {
    const now = new Date();
    if (date) {
      if (date > now) {
        setDateAlertMessage("Please select a current or past date/time.");
        setTimeout(() => setDateAlertMessage(null), 1000);
      } else {
        setStartTime(date);
      }
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
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
    } catch (error: unknown) {
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
          resetMessage={false}
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
