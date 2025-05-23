import React from "react";
import { Issue, Label } from "@/app/types"; // Adjusted import path

type GroupedIssues = {
  [key: string]: Issue[];
};

interface IssueBoardProps {
  groupedIssues: GroupedIssues;
  loading: boolean;
  error?: Error; // Or ApolloError, depending on what's passed
  // selectedTeam: string | null; // Not directly used by IssueBoard for rendering issues themselves
  // selectedAssignee: string | null; // Not directly used by IssueBoard for rendering issues themselves
}

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => (
  <div
    key={issue.id}
    className="border border-gray-200 rounded p-4 shadow hover:shadow-md transition-shadow duration-200 bg-white"
  >
    <h3 className="text-md font-semibold mb-1">{issue.title}</h3>
    <p className="text-xs text-gray-500 mb-2">
      {issue.identifier} | Prj: {issue.projectName}
    </p>
    <div className="flex flex-wrap gap-1 mb-2 min-h-[18px]">
      {issue.labels?.map((label: Label) => (
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
        <span className="font-medium">Priority:</span> {issue.priorityLabel}
      </p>
      <p>
        <span className="font-medium">Team:</span> {issue.teamName || "N/A"}
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
);

const IssueBoard: React.FC<IssueBoardProps> = ({
  groupedIssues,
  loading,
  error,
}) => {
  if (loading && Object.keys(groupedIssues).length === 0) {
    // Show loading only if there are no issues yet
    return <p className="text-center py-10 text-gray-500">Loading issues...</p>;
  }

  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        Error loading issues: {error.message}
      </p>
    );
  }

  if (Object.keys(groupedIssues).length === 0 && !loading) {
    return (
      <p className="text-center py-10 text-gray-500">
        No issues match the current filters.
      </p>
    );
  }

  return (
    <>
      {Object.entries(groupedIssues).map(([stateName, issues]) => (
        <div key={stateName} className="mb-6">
          <h2 className="text-xl font-semibold mb-3 sticky top-0 bg-gray-100 dark:bg-gray-800 p-2 z-5 border-b dark:border-gray-700 capitalize">
            {stateName.replace(/_/g, " ")} ({issues.length}){" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue: Issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default IssueBoard;
