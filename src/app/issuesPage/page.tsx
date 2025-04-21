"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import NavigationBar from "@/app/components/Admin/NavigationBar";
import { io, Socket } from "socket.io-client";

type Label = {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  __typename?: "Label";
};

type Issue = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  dueDate: string | null;
  projectId: string;
  priorityLabel: string;
  identifier: string;
  assigneeName: string | null;
  projectName: string;
  state: string;
  teamKey: string | null;
  teamName: string | null;
  labels: Label[];
  __typename?: "Issue";
};

type IssueUpdatePayload = {
  action: "create" | "update" | "remove";
  issue: Partial<Issue> & { id: string };
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
        __typename
      }
      __typename
    }
  }
`;

const IssuesComponent: React.FC = () => {
  const client = useApolloClient();
  const { loading, error, data, refetch } = useQuery<{ issues: Issue[] }>(
    GET_ISSUES,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    }
  );

  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socket = useRef<Socket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionStatusMessage, setConnectionStatusMessage] =
    useState("Connecting...");
  const maxReconnectAttempts = 5;

  const handleSelectAssignee = useCallback((assignee: string | null) => {
    setSelectedAssignee(assignee);
  }, []);

  const handleSelectTeam = useCallback((team: string | null) => {
    setSelectedTeam(team);
  }, []);

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    data?.issues?.forEach((issue) => {
      if (issue.teamName) teams.add(issue.teamName);
    });
    return Array.from(teams);
  }, [data?.issues]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    data?.issues?.forEach((issue) => {
      if (issue.assigneeName) assignees.add(issue.assigneeName);
    });
    return Array.from(assignees).sort();
  }, [data?.issues]);

  const filteredIssues = useMemo(() => {
    return (
      data?.issues?.filter((issue) => {
        const teamMatch = !selectedTeam || issue.teamName === selectedTeam;
        const assigneeMatch =
          !selectedAssignee || issue.assigneeName === selectedAssignee;
        return teamMatch && assigneeMatch;
      }) ?? []
    );
  }, [data?.issues, selectedTeam, selectedAssignee]);

  const groupedIssues = useMemo(() => {
    const groups: GroupedIssues = {};
    filteredIssues.forEach((issue) => {
      const stateName = issue.state || "Unknown State";
      if (!groups[stateName]) {
        groups[stateName] = [];
      }
      groups[stateName].push(issue);
    });

    const sortedGroupKeys = Object.keys(groups).sort();
    const sortedGroups: GroupedIssues = {};
    sortedGroupKeys.forEach((key) => {
      groups[key].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      sortedGroups[key] = groups[key];
    });
    return sortedGroups;
  }, [filteredIssues]);

  // --- WebSocket Connection and Cache Update Effect ---
  useEffect(() => {
    let connectTimeout: NodeJS.Timeout | null = null; //manage retry timeouts

    const connectSocket = () => {
      if (socket.current || reconnectAttempts >= maxReconnectAttempts) {
        if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionStatusMessage("Connection failed (Max attempts)");
          console.error("Maximum reconnection attempts reached.");
        }
        return;
      }
      setConnectionStatusMessage(
        `Connecting (Attempt ${reconnectAttempts + 1})...`
      );
      console.log(
        `Attempting WS connection (attempt ${reconnectAttempts + 1})...`
      );

      const wsUrl =
        process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL ||
        "http://localhost:8080";
      socket.current = io(wsUrl, {
        transports: ["websocket"],
        path: "/socket.io",
        reconnection: false,
        timeout: 10000,
      });

      const currentSocket = socket.current;

      currentSocket.on("connect", () => {
        console.log(`WebSocket connected: ${currentSocket.id}`);
        setSocketConnected(true);
        setConnectionStatusMessage("Live Updates On");
        setReconnectAttempts(0);
      });

      currentSocket.on("connect_error", (error: Error) => {
        console.error(`WebSocket connect_error: ${error.message}`);
        currentSocket.disconnect();
        socket.current = null;
        setSocketConnected(false);
        setConnectionStatusMessage("Connection Error");
        setReconnectAttempts((prev) => prev + 1);
        if (reconnectAttempts + 1 < maxReconnectAttempts) {
          connectTimeout = setTimeout(
            connectSocket,
            3000 + Math.random() * 2000
          );
        } else {
          setConnectionStatusMessage("Connection failed (Max attempts)");
        }
      });

      currentSocket.on("disconnect", (reason: string) => {
        console.log(`WebSocket disconnected: ${reason}`);
        setSocketConnected(false);
        socket.current = null;
        if (
          reason !== "io client disconnect" &&
          reconnectAttempts < maxReconnectAttempts
        ) {
          setConnectionStatusMessage("Disconnected. Retrying...");
          setReconnectAttempts((prev) => prev + 1);
          connectTimeout = setTimeout(
            connectSocket,
            3000 + Math.random() * 2000
          );
        } else if (reason === "io client disconnect") {
          setConnectionStatusMessage("Disconnected");
        }
      });

      // --- Apollo Cache Update Logic ---
      currentSocket.on("issueUpdate", (payload: IssueUpdatePayload) => {
        console.log("Received WS issue update:", payload);

        if (!payload || !payload.issue || !payload.issue.id) {
          console.error("Received invalid issue update payload:", payload);
          return;
        }
        const issueId = payload.issue.id;

        try {
          client.cache.updateQuery<{ issues: Issue[] }>(
            { query: GET_ISSUES },
            (existingData) => {
              if (!existingData) {
                console.warn(
                  "Cache data for GET_ISSUES not found during update. Skipping cache update."
                );
                return existingData;
              }

              let updatedIssues: Issue[];

              switch (payload.action) {
                case "create":
                  const newIssue = {
                    ...payload.issue,
                    __typename: "Issue",
                    labels:
                      payload.issue.labels?.map((l) => ({
                        ...l,
                        __typename: "Label",
                      })) ?? [],
                  } as Issue;
                  if (
                    !existingData.issues.some(
                      (issue) => issue.id === newIssue.id
                    )
                  ) {
                    updatedIssues = [...existingData.issues, newIssue];
                    console.log(`Apollo cache: Added issue ${newIssue.id}`);
                  } else {
                    console.warn(
                      `Issue ${newIssue.id} (create event) already exists. Updating instead.`
                    );
                    updatedIssues = existingData.issues.map((issue) =>
                      issue.id === newIssue.id ? newIssue : issue
                    );
                  }
                  break;

                case "update":
                  const issueIdToUpdate = payload.issue.id;
                  const incomingUpdateData = payload.issue; // Keep a reference

                  // Find the existing issue defensively
                  const existingIssueIndex = existingData.issues.findIndex(
                    (issue) => issue.id === issueIdToUpdate
                  );

                  if (existingIssueIndex === -1) {
                    // Issue not found in cache, maybe it was filtered out or deleted?
                    console.warn(
                      `Issue ${issueIdToUpdate} (update event) not found in cache. Skipping cache update.`
                    );
                    updatedIssues = existingData.issues; // No change
                    break;
                  }

                  // Get a *copy* of the existing issue to modify
                  const issueToUpdate = {
                    ...existingData.issues[existingIssueIndex],
                  };

                  // Defensively determine the updated labels
                  let finalLabels: Label[];
                  if (incomingUpdateData.labels !== undefined) {
                    // Use new labels from payload if they exist (even if empty array)
                    finalLabels = (incomingUpdateData.labels || []).map(
                      (l) => ({
                        ...l,
                        __typename: "Label",
                      })
                    );
                  } else {
                    // Otherwise, keep the existing labels (handle if existing labels were null/undefined)
                    finalLabels = (issueToUpdate.labels || []).map((l) => ({
                      ...l,
                      __typename: "Label",
                    }));
                  }

                  // Create the fully updated issue object by merging
                  // Start with the existing, layer the incoming payload, then explicitly set labels and typename
                  const mergedUpdatedIssue: Issue = {
                    ...issueToUpdate, // Base with existing cached data
                    ...incomingUpdateData, // Override with fields from the payload
                    __typename: "Issue",
                    labels: finalLabels,
                  };

                  // Create the new array for the cache
                  updatedIssues = [...existingData.issues]; // Create a mutable copy
                  updatedIssues[existingIssueIndex] = mergedUpdatedIssue; // Replace the item at the found index

                  console.log(
                    `Apollo cache: Prepared update for issue ${mergedUpdatedIssue.id}`
                  );
                  break;

                case "remove":
                  updatedIssues = existingData.issues.filter(
                    (issue) => issue.id !== issueId
                  );
                  console.log(`Apollo cache: Removed issue ${issueId}`);
                  break;

                default:
                  console.warn("Unknown issue update action:", payload);
                  updatedIssues = existingData.issues;
              }
              return { issues: updatedIssues };
            }
          );
        } catch (cacheError) {
          console.error("Error updating Apollo cache:", cacheError);
        }
      });
    };

    connectSocket();

    return () => {
      console.log(
        "Cleaning up WebSocket connection/timeouts on component unmount/reconnect"
      );
      if (connectTimeout) clearTimeout(connectTimeout);
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [client, reconnectAttempts]);

  // --- Manual Refresh ---
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered.");
    setConnectionStatusMessage("Refreshing...");
    refetch()
      .then(() => {
        console.log("Manual refresh successful");
        setConnectionStatusMessage(
          socketConnected ? "Live Updates On" : "Disconnected"
        );
      })
      .catch((err) => {
        console.error("Manual refresh failed:", err);
        setConnectionStatusMessage("Refresh failed");
      });
  }, [refetch, socketConnected]);

  // --- Render Logic ---
  const renderContent = () => {
    if (loading && !data) {
      return (
        <p className="text-center py-10 text-gray-500">Loading issues...</p>
      );
    }
    if (error) {
      return (
        <p className="text-center py-10 text-red-500">
          Error loading issues: {error.message}
        </p>
      );
    }
    if (Object.keys(groupedIssues).length === 0) {
      return (
        <p className="text-center py-10 text-gray-500">
          No issues match the current filters.
        </p>
      );
    }

    // Render the grouped issues board
    return Object.entries(groupedIssues).map(([stateName, issues]) => (
      <div key={stateName} className="mb-6">
        <h2 className="text-xl font-semibold mb-3 sticky top-0 bg-gray-100 p-2 z-5 border-b capitalize">
          {stateName.replace(/_/g, " ")} ({issues.length}){" "}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border border-gray-200 rounded p-4 shadow hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <h3 className="text-md font-semibold mb-1">{issue.title}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {issue.identifier} | Prj: {issue.projectName}
              </p>
              <div className="flex flex-wrap gap-1 mb-2 min-h-[18px]">
                {issue.labels?.map((label) => (
                  <span
                    key={label.id}
                    style={{ backgroundColor: label.color || "#cccccc" }}
                    className="text-white text-xxs font-semibold px-1.5 py-0.5 rounded"
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                <p>
                  <span className="font-medium">Priority:</span>{" "}
                  {issue.priorityLabel}
                </p>
                <p>
                  <span className="font-medium">Team:</span>{" "}
                  {issue.teamName || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Assignee:</span>{" "}
                  {issue.assigneeName || "Unassigned"}
                </p>
                {issue.dueDate && (
                  <p>
                    <span className="font-medium">Due:</span>{" "}
                    {new Date(issue.dueDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-400 pt-1 text-xxs">
                  Updated: {new Date(issue.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
        {/* --- Filter UI --- */}
        <div className="flex mb-4 flex-wrap items-start gap-2 border-b pb-4">
          {/* Team Filters */}
          <div className="flex items-center flex-wrap gap-1">
            <span className="text-sm font-medium mr-2 flex-shrink-0">
              Teams:
            </span>
            <button
              onClick={() => handleSelectTeam(null)}
              className={`p-1 px-2 m-1 text-xs ${
                !selectedTeam
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              } rounded hover:bg-gray-300`}
            >
              ALL
            </button>
            {uniqueTeams.map((team) => (
              <button
                key={team}
                onClick={() => handleSelectTeam(team)}
                className={`p-1 px-2 m-1 uppercase text-xs ${
                  selectedTeam === team ? "bg-green-500" : "bg-black"
                } text-white rounded hover:bg-gray-800`}
              >
                {team}
              </button>
            ))}
          </div>
          {/* Assignee Filters */}
          <div className="flex items-center flex-wrap gap-1">
            <span className="text-sm font-medium mr-2 flex-shrink-0">
              Assignees:
            </span>
            <button
              onClick={() => handleSelectAssignee(null)}
              className={`p-1 px-2 m-1 text-xs ${
                !selectedAssignee
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              } rounded hover:bg-gray-300`}
            >
              ALL
            </button>
            {uniqueAssignees.map((assignee) => (
              <button
                key={assignee}
                onClick={() => handleSelectAssignee(assignee)}
                className={`p-1 px-2 m-1 uppercase text-xs ${
                  selectedAssignee === assignee ? "bg-green-500" : "bg-black"
                } text-white rounded hover:bg-gray-800`}
              >
                {assignee || "Unassigned"}
              </button>
            ))}
          </div>
        </div>

        {/* --- Manual Refresh & Connection Status --- */}
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleRefresh}
            className="..."
            aria-label="Refresh Issues"
          >
            {/* Refresh Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
        <div className="fixed bottom-4 left-4 flex items-center bg-white px-2 py-1 rounded shadow-md text-xs z-10">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              socketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <span> {connectionStatusMessage} </span>
        </div>

        {/* --- Issue Board Content --- */}
        <div className="mt-4">{renderContent()}</div>
      </div>
    </>
  );
};

export default IssuesComponent;
