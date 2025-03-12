"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import NavigationBar from "../components/NavigationBar";
import client from "@/app/lib/apolloClient";
import { io, Socket } from "socket.io-client";

type Label = {
  id: string;
  name: string;
  color: string;
  parentId: string;
};

type Issue = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  dueDate: string;
  projectId: string;
  priorityLabel: string;
  identifier: string;
  assigneeName: string;
  projectName: string;
  state: string;
  teamKey: string;
  teamName: string;
  labels: Label[];
};

type GroupedIssues = {
  [key: string]: Issue[];
};

const GET_ISSUES = gql`
  query GetIssues {
    issues {
      id
      createdAt
      updatedAt
      title
      dueDate
      projectId
      priorityLabel
      identifier
      assigneeName
      projectName
      state
      teamKey
      teamName
      labels {
        id
        name
        color
        parentId
      }
    }
  }
`;

const IssuesComponent: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<{ issues: Issue[] }>(
    GET_ISSUES,
    { client }
  );

  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssues>({});
  const socket = useRef<Socket | null>(null);

  const handleSelectAssignee = (assignee: string) => {
    setSelectedAssignee(assignee);
  };

  const handleSelectTeam = (team: string) => {
    setSelectedTeam(team);
  };

  const handleClearFilters = () => {
    setSelectedTeam(null);
    setSelectedAssignee(null);
  };

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    data?.issues.forEach((issue) => teams.add(issue.teamName));
    return Array.from(teams);
  }, [data?.issues]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    data?.issues.forEach((issue) => assignees.add(issue.assigneeName));
    return Array.from(assignees);
  }, [data?.issues]);

  const filteredIssues = useMemo(() => {
    return (
      data?.issues.filter((issue) => {
        return (
          (!selectedTeam || issue.teamName === selectedTeam) &&
          (!selectedAssignee || issue.assigneeName === selectedAssignee)
        );
      }) || []
    );
  }, [data?.issues, selectedTeam, selectedAssignee]);

  useEffect(() => {
    socket.current = io(
      process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL || "http://localhost:8080",
      {
        transports: ["websocket"], // Force WebSocket transport instead of polling
        path: "/socket.io",
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      }
    );

    const currentSocket = socket.current;

    console.log(
      "Attempting to connect to:",
      process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL || "http://localhost:8080"
    );
    socket.current.on("error", (error: Error) => {
      console.error("Socket error:", error);
    });

    currentSocket?.on("connect", () => {
      console.log("WebSocket connected successfully");
      setSocketConnected(true);
    });

    currentSocket?.on("disconnect", (reason: string) => {
      console.log("WebSocket disconnected:", reason);
      setSocketConnected(false);
    });

    currentSocket?.on("issueUpdate", (updatedIssue: Issue) => {
      console.log("Received issue update via WebSocket:", updatedIssue);
      refetch();
    });

    currentSocket?.on("connect_error", (err: Error) => {
      console.error("WebSocket connection error:", err);
    });
    currentSocket?.on("disconnect", (reason: string) => {
      console.log("WebSocket disconnected:", reason);
    });

    return () => {
      if (currentSocket) {
        console.log("Cleaning up WebSocket connection");
        currentSocket.disconnect();
      }
    };
  }, [refetch]);

  useEffect(() => {
    if (filteredIssues) {
      const groups: GroupedIssues = {};
      filteredIssues.forEach((issue) => {
        if (!groups[issue.state]) {
          groups[issue.state] = [];
        }
        groups[issue.state].push(issue);
      });
      setGroupedIssues(groups);
    }
  }, [filteredIssues]);

  if (loading) return <p>Loading issues...</p>;
  if (error) {
    console.error("Error loading issues:", error);
    return <p>Error loading issues: {error.message}</p>;
  }

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
        <div className="flex">
          <div>
            <div className="flex flex-wrap mb-1">
              {uniqueTeams.map((team) => (
                <button
                  key={team}
                  onClick={() => handleSelectTeam(team)}
                  className={`p-1 m-1 uppercase ${
                    selectedTeam === team ? "bg-green-500" : "bg-black"
                  } text-white rounded hover:bg-gray-800`}
                  style={{ fontSize: "12px" }}
                >
                  {team}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap mb-1">
              {uniqueAssignees.map((assignee) => (
                <button
                  key={assignee}
                  onClick={() => handleSelectAssignee(assignee)}
                  className={`p-1 m-1 uppercase ${
                    selectedAssignee === assignee ? "bg-green-500" : "bg-black"
                  } text-white rounded hover:bg-gray-800`}
                  style={{ fontSize: "12px" }}
                >
                  {assignee}
                </button>
              ))}
            </div>
            <button
              onClick={handleClearFilters}
              className="p-1 m-1 bg-gray-300 text-black rounded hover:bg-gray-400"
              style={{ fontSize: "12px" }}
            >
              Clear Filters
            </button>
          </div>
          <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
            <button
              onClick={handleRefresh}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              style={{ width: "40px", height: "40px" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 15L24 15 20 20zM8 9L0 9 4 4z"></path>
                <path d="M21 6c0-1.654-1.346-3-3-3H7.161l1.6 2H18c.551 0 1 .448 1 1v10h2V6zM3 18c0 1.654 1.346 3 3 3h10.839l-1.6-2H6c-.551 0-1-.448-1-1V8H3V18z"></path>
              </svg>
            </button>
          </div>
          <div className="fixed bottom-20 right-20 flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                socketConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm">
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        {Object.keys(groupedIssues).length > 0 ? (
          Object.entries(groupedIssues)
            .filter(([, issues]) => {
              if (selectedTeam) {
                return issues.some((issue) => issue.teamName === selectedTeam);
              }
              return true;
            })
            .map(([stateName, issues]) => (
              <div key={stateName}>
                <h2 className="text-2xl text-white font-bold mb-4 bg-black p-2">
                  {stateName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border border-gray-200 rounded p-4 shadow-md "
                    >
                      <h3 className="text-xl font-semibold">{issue.title}</h3>
                      <p className="text-sm text-gray-800 bg-slate-200">
                        Project: {issue.projectName}
                      </p>
                      <div className="flex flex-wrap mt-2">
                        {issue.labels.map((label) => (
                          <span
                            key={label.id}
                            style={{ backgroundColor: label.color }}
                            className="text-white text-xs font-semibold mr-2 mb-2 px-2 py-1 rounded"
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="border-b border-gray-200">
                          Priority: {issue.priorityLabel}
                        </p>
                        <p className="border-b border-gray-200">
                          State: {issue.state}
                        </p>
                        <p className="border-b border-gray-200">
                          Team Key: {issue.teamKey}
                        </p>
                        <p className="border-b border-gray-200">
                          Team: {issue.teamName}
                        </p>
                        <p className="border-b border-gray-200">
                          Assignee: {issue.assigneeName}
                        </p>
                        <p className="border-b border-gray-200">
                          Identifier: {issue.identifier}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <div>No issues found.</div>
        )}
      </div>
    </>
  );
};

export default IssuesComponent;
