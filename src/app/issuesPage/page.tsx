"use client";
import React, { useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import NavigationBar from "@/app/components/Admin/NavigationBar";
import PageErrorBoundary from "@/app/components/ErrorBoundaries/PageErrorBoundary";
import QueryErrorBoundary from "@/app/components/ErrorBoundaries/QueryErrorBoundary";
import { useWebSocket } from "../hooks/useWebSocket";
import { useIssueFilters } from "../hooks/useIssueFilters";
import { useIssueCacheUpdates } from "../hooks/useIssueCacheUpdates";
import { Issue, IssueUpdatePayload } from "../types";
import IssueBoard from "../components/Issues/IssueBoard";
import FilterControls from "../components/Issues/FilterControls";
import { GET_ISSUES } from "../graphql/fragments";

type GroupedIssues = {
  [key: string]: Issue[];
};

interface GetIssuesData {
  issues: {
    issues: Issue[];
    total: number;
    hasNext: boolean;
  };
}

const IssuesComponent: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<GetIssuesData>(
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

  const memoizedOnIssueUpdate = useCallback(
    (payload: IssueUpdatePayload) => {
      console.log(
        "IssuesPage: Received issue update via useWebSocket",
        payload
      );
      handleIssueUpdateEvent(payload);
    },
    [handleIssueUpdateEvent]
  );

  const { socketConnected, connectionStatusMessage } = useWebSocket({
    wsUrl: wsUrl,
    onIssueUpdate: memoizedOnIssueUpdate,
  });

  const {
    filteredIssues,
    uniqueTeams,
    uniqueAssignees,
    selectedTeam,
    selectedAssignee,
    handleSelectTeam,
    handleSelectAssignee,
  } = useIssueFilters(data?.issues.issues);

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

  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered.");
    refetch()
      .then(() => {
        console.log("Manual refresh successful");
      })
      .catch((err) => {
        console.error("Manual refresh failed:", err);
      });
  }, [refetch]);

  return (
    <PageErrorBoundary pageName="Issues">
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
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
        <QueryErrorBoundary queryName="Issues" refetch={refetch}>
          <IssueBoard
            groupedIssues={groupedIssues}
            loading={loading}
            error={error?.message ? new Error(error.message) : undefined}
          />
        </QueryErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
};

export default IssuesComponent;
