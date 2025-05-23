"use client";
import React, {
  // useState, // No longer directly needed for filters or socket status
  // useEffect, // WebSocket useEffect will be largely replaced
  // useRef, // socket ref will be in useWebSocket
  useCallback,
  useMemo, // Added useMemo import
} from "react";
import { gql, useQuery /* useApolloClient */ } from "@apollo/client"; // useApolloClient is used by hooks
import NavigationBar from "@/app/components/Admin/NavigationBar";
// import { io, Socket } from "socket.io-client"; // Moved to useWebSocket

// Import the new hooks
import { useWebSocket } from "../hooks/useWebSocket";
import { useIssueFilters } from "../hooks/useIssueFilters";
import { useIssueCacheUpdates } from "../hooks/useIssueCacheUpdates";
import { Issue, IssueUpdatePayload } from "../types";
import IssueBoard from "../components/Issues/IssueBoard";
import FilterControls from "../components/Issues/FilterControls"; // Import the new FilterControls component

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
  const { loading, error, data, refetch } = useQuery<{ issues: Issue[] }>(
    GET_ISSUES,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    }
  );

  const { handleIssueUpdateEvent } = useIssueCacheUpdates({
    queryToUpdate: GET_ISSUES,
  });

  const wsUrl =
    process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL || "http://localhost:8080";

  // Memoize onIssueUpdate to prevent re-creation on every render
  const memoizedOnIssueUpdate = useCallback(
    (payload: IssueUpdatePayload) => {
      console.log(
        "IssuesPage: Received issue update via useWebSocket",
        payload
      );
      handleIssueUpdateEvent(payload);
    },
    [handleIssueUpdateEvent] // Dependency: handleIssueUpdateEvent from useIssueCacheUpdates
  );

  const {
    socketConnected, // Corrected: useWebSocket returns socketConnected
    connectionStatusMessage, // Corrected: useWebSocket returns connectionStatusMessage
    // connectSocket, // connect and disconnect are now managed by the hook
    // disconnectSocket,
  } = useWebSocket({
    // Pass options object
    wsUrl: wsUrl,
    onIssueUpdate: memoizedOnIssueUpdate, // Use the memoized version
  });

  // Hook for issue filtering
  // Corrected destructuring based on useIssueFilters return values
  const {
    filteredIssues, // Corrected: from filteredIssuesToDisplay
    uniqueTeams, // Corrected: from uniqueTeamNames
    uniqueAssignees, // Corrected: from uniqueAssigneeNames
    selectedTeam, // Corrected: from currentSelectedTeam
    selectedAssignee, // Corrected: from currentSelectedAssignee
    handleSelectTeam, // Corrected: from selectTeam (or use setSelectedTeam directly if preferred)
    handleSelectAssignee, // Corrected: from selectAssignee (or use setSelectedAssignee directly)
  } = useIssueFilters(data?.issues);

  const groupedIssues = useMemo(() => {
    const groups: GroupedIssues = {};
    // Use filteredIssues from the hook
    filteredIssues.forEach((issue) => {
      // Corrected: use filteredIssues
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
  }, [filteredIssues]); // Dependency updated to filteredIssues

  // --- WebSocket Connection and Cache Update Effect ---
  // This entire useEffect block is now handled by the useWebSocket and useIssueCacheUpdates hooks.
  // useEffect(() => {
  //   let connectTimeout: NodeJS.Timeout | null = null;
  //   const connectSocket = () => { /* ... */ };
  //   connectSocket();
  //   return () => { /* ... cleanup ... */ };
  // }, [client, reconnectAttempts]); // Old dependencies

  // --- Manual Refresh ---
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered.");
    // setConnectionStatusMessage("Refreshing..."); // This state is now internal to useWebSocket,
    // but we can still show a general refreshing message if desired,
    // or rely on Apollo's loading state.
    // For now, let's keep it simple.
    refetch()
      .then(() => {
        console.log("Manual refresh successful");
        // The connectionStatusMessage will be updated by useWebSocket hook based on actual socket state.
      })
      .catch((err) => {
        console.error("Manual refresh failed:", err);
        // Potentially set a local error message state if needed for UI feedback on refresh failure
      });
  }, [refetch]); // socketConnected is from useWebSocket, if needed here, pass it or rely on its own updates.

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
        {/* Use the new FilterControls component */}
        <FilterControls
          uniqueTeams={uniqueTeams}
          selectedTeam={selectedTeam}
          onSelectTeam={handleSelectTeam}
          uniqueAssignees={uniqueAssignees}
          selectedAssignee={selectedAssignee}
          onSelectAssignee={handleSelectAssignee}
          onRefresh={handleRefresh}
          isRefreshing={loading}
          socketConnected={socketConnected}
          connectionStatusMessage={connectionStatusMessage}
        />

        {/* Use the new IssueBoard component */}
        <IssueBoard
          groupedIssues={groupedIssues}
          loading={loading}
          error={error?.message ? new Error(error.message) : undefined}
        />
      </div>
    </>
  );
};

export default IssuesComponent;

/*
TODO:
- Verify all types and ensure no new linting/type errors are introduced.
*/
