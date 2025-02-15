// React and third-party library imports
import React, { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  formatISO,
  parseISO,
  differenceInSeconds,
  format,
  isValid,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Utility and store imports
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";
import useStore from "../lib/store";
import { currentUserVar } from "../lib/apolloClient";

// Component imports for UI
import ProjectSelector from "../components/ProjectSelector";
import RateSelector from "../components/RateSelector";
import NavigationBar from "../components/NavigationBar";

// GraphQL Queries and mutations
// const USERS_QUERY = gql`
//   query GetUsers {
//     users {
//       id
//       email
//     }
//   }
// `;

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

// Main component
const TimeKeeper: React.FC = () => {
  // Zustand store state and setters
  const {
    setUsers,
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

  // Local component state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauseTimes, setPauseTimes] = useState<Date[]>([]);
  const [resumeTimes, setResumeTimes] = useState<Date[]>([]);
  const [displayTime, setDisplayTime] = useState("00:00:00");
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date());

  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [dateAlertMessage, setDateAlertMessage] = useState<string | null>(null);

  // References for intervals and accumulated time
  const timerIntervalRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);

  const loggedInUser = currentUserVar();
  console.log("LoggedinUser", loggedInUser);

  // Apollo GraphQL hooks
  //Query hooks
  // const { data: usersData } = useQuery(USERS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const { data: ratesData, error: ratesError } = useQuery(RATES_QUERY, {
    // variables: { teamId: useStore.getState().teamId },
    variables: { teamId },
  });
  // Fetch all users and their projects
  const {
    data: ProjectUsersData,
    loading: loadingUsers,
    error: usersError,
  } = useQuery(GET_USER_PROJECTS, {
    skip: !loggedInUser, // Run the query only if loggedInUser is set
  });

  const {
    loading: totalTimeLoading,
    data: totalTimeData,
    error: totalTimeError,
  } = useQuery(TOTAL_TIME_PER_USER_PROJECT_QUERY, {
    variables: {
      // userId: loggedInUser?.id,
      userId: loggedInUser ? parseFloat(loggedInUser.id) : null,
      projectId: selectedProject,
    },
    skip: !loggedInUser || !selectedProject,
  });

  // Mutation hooks
  const [createTime] = useMutation(CREATE_TIME_MUTATION);
  const [updateTime] = useMutation(UPDATE_TIME_MUTATION);
  const [deleteTime] = useMutation(DELETE_TIME_MUTATION);

  // Effect for fetching and setting user project data
  useEffect(() => {
    if (ProjectUsersData && loggedInUser) {
      const userWithProjects = ProjectUsersData.users.find(
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
  }, [ProjectUsersData, loggedInUser]);

  console.log("userprojects", userProjects);

  // Query data handling
  useEffect(() => {
    // if (usersData) setUsers(usersData.users);
    if (projectsData) setProjects(projectsData.projects);
    if (ratesData) setRates(ratesData.rates);
  }, [projectsData, ratesData, setProjects, setRates]);

  // Error handling for the rates query
  useEffect(() => {
    if (ratesError) {
      console.error("Error fetching rates:", ratesError.message);
    }
  }, [ratesError]);

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find((p) => p.id === selectedProject);
      if (project) setTeamId(project.teamId);
    }
  }, [selectedProject, projects, setTeamId]);

  // Timer Logic
  const calculateElapsedTime = () => {
    const now = new Date();
    // Ensure startTime is a valid Date object
    if (!isValid(startTime) || startTime === null) {
      return 0;
    }
    let elapsedSeconds = differenceInSeconds(now, startTime);
    pauseTimes.forEach((pauseTime, index) => {
      const resumeTime = resumeTimes[index] || now;
      if (isValid(pauseTime) && isValid(resumeTime)) {
        elapsedSeconds -= differenceInSeconds(resumeTime, pauseTime);
      }
    });
    return Math.max(elapsedSeconds, 0);
  };

  const updateDisplay = () => {
    const elapsedSeconds = calculateElapsedTime();
    const formattedTime = format(
      new Date(0, 0, 0, 0, 0, elapsedSeconds),
      "HH:mm:ss"
    );
    setDisplayTime(formattedTime);
  };

  // Effect to handle timer updates
  useEffect(() => {
    if (isRunning && isValid(startTime)) {
      updateDisplay(); // Immediate update
      timerIntervalRef.current = setInterval(
        updateDisplay,
        1000
      ) as unknown as number;
      return () => {
        if (timerIntervalRef.current !== null) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [isRunning, startTime, pauseTimes, resumeTimes]);

  // Button click handlers
  const handleStartStop = () => {
    const now = new Date();

    if (isRunning) {
      // Pause the timer
      if (isValid(startTime)) {
        setPauseTimes((prevPauseTimes) => [...prevPauseTimes, now]);
      }
      setIsRunning(false);
    } else {
      // Start or resume the timer
      if (startTime === null) {
        // Start with the current time if no time was picked
        setStartTime(now);
      } // If startTime is not null, it means a time has been picked and we use that
      setIsRunning(true);
      if (pauseTimes.length !== resumeTimes.length) {
        // Resume after a pause
        setResumeTimes((prevResumeTimes) => [...prevResumeTimes, now]);
      }
    }
  };

  const handleReset = () => {
    const now = new Date();
    setIsRunning(false);
    setStartTime(null);
    setPauseTimes([]);
    setResumeTimes([]);
    setDisplayTime("00:00:00");
    accumulatedTimeRef.current = 0;
    setCurrentEntryId(null);
    setResetMessage(true);
    setStartDate(now);
    setTimeout(() => setResetMessage(false), 2000);
  };

  const handleDateChange = (date: Date | null) => {
    const now = new Date();
    if (date) {
      if (date > now) {
        setDateAlertMessage("Please select a current or past date/time.");
        setTimeout(() => setDateAlertMessage(null), 1000);
      } else {
        setStartDate(date);
        setStartTime(date);
      }
    } else {
      setStartDate(now);
    }
  };

  // Helper function to format time
  const formatTimeFromMilliseconds = (totalMilliseconds: number) => {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${days} days, ${hours} hours, ${minutes} minutes`;
  };

  // Submit handler for time entries
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!startTime) {
      console.error("No start time set.");
      return;
    }
    try {
      const submissionTime = new Date();
      console.log("Frontend - Formatted End Time:", formatISO(submissionTime));
      console.log(
        "Submitting time. Start Time:",
        startTime,
        "End Time:",
        submissionTime
      );
      const totalElapsedTime =
        accumulatedTimeRef.current +
        (submissionTime.getTime() - startTime.getTime()) -
        pauseTimes.reduce((acc, time, index) => {
          const resumeTime = resumeTimes[index] || submissionTime;
          return acc + (resumeTime.getTime() - time.getTime());
        }, 0);

      console.log("Frontend - Formatted Start Time:", formatISO(startTime));
      console.log("Frontend - Formatted End Time:", formatISO(submissionTime));
      console.log("Total Elapsed Time on Submit:", totalElapsedTime);

      let result;

      if (currentEntryId) {
        // Update existing time entry
        const updateVariables = {
          id: currentEntryId,
          endTime: formatISO(submissionTime),
          totalElapsedTime,
        };
        result = await updateTime({
          variables: { timeInputUpdate: updateVariables },
        });
      } else {
        // Create new time entry
        const createVariables = {
          startTime: formatISO(startTime),
          endTime: formatISO(submissionTime),
          projectId: selectedProject,
          userId: loggedInUser?.id,
          rateId: parseFloat(selectedRate),
          totalElapsedTime,
        };
        result = await createTime({
          variables: { timeInputCreate: createVariables },
        });
        setCurrentEntryId(result.data.createTime.id);
      }

      setSubmissionSuccess(true);
      setSubmissionError("");

      setTimeout(() => setSubmissionSuccess(false), 2000);

      console.log("Time entry result:", result);
    } catch (error) {
      // Check if error is an instance of Error and has a message property
      if (error instanceof Error) {
        setSubmissionError("Error with time entry: " + error.message);
      } else {
        // Fallback error message if the error is not an instance of Error
        setSubmissionError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="relative max-w-6xl mx-auto p-6  rounded  flex flex-col font-roboto-condensed">
        <div className="feedback-messages">
          {submissionSuccess && (
            <div className="absolute top-5 right-5 md:top-10 md:right-10 transform translate-x-0 translate-y-0 z-50 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg mt-2 transition ease-out duration-300">
              Time entry saved!
            </div>
          )}
          {submissionError && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg mt-2 transition ease-out duration-300">
              {submissionError}
            </div>
          )}
          {resetMessage && (
            <div className="absolute top-7 right-4 md:top-10 md:right-10 transform translate-x-0 translate-y-0 z-50 bg-yellow-500 text-blue-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg mt-2 transition ease-out duration-300">
              Timer reset!
            </div>
          )}
          {dateAlertMessage && (
            <div className="absolute top-5 right-5 md:top-10 md:right-10 transform translate-x-0 translate-y-0 z-50 bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg mt-2 transition ease-out duration-300">
              {dateAlertMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center ">
          <div
            className={` clock-icon h-6 w-6  ${
              isRunning ? "animate-spin" : ""
            }text-gray-500`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line
                x1="12"
                y1="12"
                x2="12"
                y2="8"
                className="hour-hand"
              ></line>{" "}
              {/* Short hand */}
              <line
                x1="12"
                y1="12"
                x2="16"
                y2="12"
                className={`minute-hand ${isRunning ? "animate-spin" : ""}`}
              ></line>{" "}
              {/* Long hand that spins */}
            </svg>
          </div>
          <div className="text-7xl font-digital text-black flex items-center justify-center">
            {displayTime}{" "}
          </div>
          <div className="mb-2">
            Started at:{" "}
            {startTime
              ? formatDateForDisplay(parseISO(formatISO(startTime))) +
                " " +
                formatTimeFromISOString(formatISO(startTime))
              : "Not Started"}
          </div>
          <div className="flex justify-center ">
            <DatePicker
              inline
              id="startDate"
              selected={startDate}
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="MMMM d, yyyy HH:mm"
              timeIntervals={10} // Minute-by-minute time selection
              className="form-input block w-52 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mt-auto py-6">
            <button
              type="button"
              onClick={handleStartStop}
              className={`px-6 py-6 ${
                isRunning ? "bg-red-500" : "bg-green-500"
              } text-white text-2xl rounded-full`}
              disabled={!selectedProject || !selectedRate}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-8  bg-yellow-500 text-white text-2xl rounded-full ml-4"
              disabled={!startTime}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-3 py-8  bg-blue-500 text-white text-2xl rounded-full ml-4"
              disabled={isRunning || !startTime}
            >
              Submit
            </button>
          </div>
          <div className="flex flex-col justify-center -mx-3">
            <div className="w-1/2 mx-auto px-3 mb-4">
              <ProjectSelector
                projects={userProjects}
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
              />
            </div>
            <div className="w-1/2 mx-auto px-3 mb-4">
              <RateSelector
                rates={rates}
                selectedRate={selectedRate}
                onRateChange={setSelectedRate}
              />
            </div>
            <div className="w-1/2 mx-auto px-3 mb-4">
              {totalTimeLoading ? (
                <p>Loading total time...</p>
              ) : totalTimeError ? (
                <p>Error loading total time: {totalTimeError.message}</p>
              ) : (
                <p>
                  Your time on project so far:{" "}
                  {formatTimeFromMilliseconds(
                    totalTimeData?.getTotalTimeForUserProject || 0
                  )}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default TimeKeeper;
