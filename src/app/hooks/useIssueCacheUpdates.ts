import { useCallback } from "react";
import { useApolloClient, gql, DocumentNode } from "@apollo/client"; // Added DocumentNode
import { Issue, Label, IssueUpdatePayload } from "../types"; // Assuming types are defined here

const GET_ISSUES = gql`
  query GetIssues_CacheUpdateHook {
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

interface UseIssueCacheUpdatesOptions {
  queryToUpdate?: DocumentNode; // Allow overriding the default query
}

export const useIssueCacheUpdates = (options?: UseIssueCacheUpdatesOptions) => {
  const client = useApolloClient();
  const query = options?.queryToUpdate || GET_ISSUES;

  const handleIssueUpdateEvent = useCallback(
    (payload: IssueUpdatePayload) => {
      console.log("Received WS issue update for cache processing:", payload);

      if (!payload || !payload.issue || !payload.issue.id) {
        console.error("Received invalid issue update payload:", payload);
        return;
      }
      const issueId = payload.issue.id;

      try {
        client.cache.updateQuery<{ issues: Issue[] }>(
          { query },
          (existingData) => {
            if (!existingData) {
              const firstDefinition = query.definitions[0];
              const queryName =
                firstDefinition &&
                firstDefinition.kind === "OperationDefinition" &&
                firstDefinition.name
                  ? firstDefinition.name.value
                  : "GET_ISSUES"; // Fallback name

              console.warn(
                `Cache data for query ${queryName} not found. Skipping cache update.`
              );
              return existingData;
            }

            let updatedIssues: Issue[];

            switch (payload.action) {
              case "create":
                const newIssue = {
                  ...payload.issue,
                  __typename: "Issue", // Ensure __typename is set
                  labels:
                    payload.issue.labels?.map((l) => ({
                      ...l,
                      __typename: "Label", // Ensure __typename for nested objects
                    })) ?? [],
                } as Issue;
                if (
                  !existingData.issues.some((issue) => issue.id === newIssue.id)
                ) {
                  updatedIssues = [...existingData.issues, newIssue];
                  console.log(`Apollo cache: Added issue ${newIssue.id}`);
                } else {
                  console.warn(
                    `Issue ${newIssue.id} (create event) already exists. Updating instead.`
                  );
                  // Treat as update if it already exists to prevent duplicates and ensure latest data
                  updatedIssues = existingData.issues.map((issue) =>
                    issue.id === newIssue.id ? newIssue : issue
                  );
                }
                break;

              case "update":
                const issueIdToUpdate = payload.issue.id;
                const incomingUpdateData = payload.issue;

                const existingIssueIndex = existingData.issues.findIndex(
                  (issue) => issue.id === issueIdToUpdate
                );

                if (existingIssueIndex === -1) {
                  console.warn(
                    `Issue ${issueIdToUpdate} (update event) not found in cache. Skipping cache update.`
                  );
                  updatedIssues = existingData.issues;
                  break;
                }

                const issueToUpdate = {
                  ...existingData.issues[existingIssueIndex],
                };

                let finalLabels: Label[];
                if (incomingUpdateData.labels !== undefined) {
                  finalLabels = (incomingUpdateData.labels || []).map((l) => ({
                    ...l,
                    __typename: "Label",
                  }));
                } else {
                  finalLabels = (issueToUpdate.labels || []).map((l) => ({
                    ...l,
                    __typename: "Label",
                  }));
                }

                const mergedUpdatedIssue: Issue = {
                  ...issueToUpdate,
                  ...incomingUpdateData,
                  __typename: "Issue",
                  labels: finalLabels,
                };

                updatedIssues = [...existingData.issues];
                updatedIssues[existingIssueIndex] = mergedUpdatedIssue;
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
    },
    [client, query]
  );

  return { handleIssueUpdateEvent };
};
