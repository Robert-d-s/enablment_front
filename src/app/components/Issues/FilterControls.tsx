import React from "react";
import { useIssuesFilterStore } from "@/app/lib/issuesFilterStore";

interface FilterControlsProps {
  uniqueTeams: string[];
  uniqueAssignees: string[];
  onRefresh: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  uniqueTeams,
  uniqueAssignees,
  onRefresh,
}) => {
  const {
    selectedTeam,
    selectedAssignee,
    isRefreshing,
    socketConnected,
    connectionStatusMessage,
    setSelectedTeam,
    setSelectedAssignee,
  } = useIssuesFilterStore();
  return (
    <div className="flex mb-4 flex-wrap items-start gap-2 border-b pb-4">
      {/* Team Filters */}
      <div className="flex items-center flex-wrap gap-1">
        <span className="text-sm font-medium mr-2 flex-shrink-0">Teams:</span>
        <button
          onClick={() => setSelectedTeam(null)}
          className={`p-1 px-2 m-1 text-xs ${
            !selectedTeam
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black dark:bg-gray-700 dark:text-gray-300"
          } rounded hover:bg-gray-300 dark:hover:bg-gray-600`}
        >
          ALL
        </button>
        {uniqueTeams.map((team: string) => (
          <button
            key={team}
            onClick={() => setSelectedTeam(team)}
            className={`p-1 px-2 m-1 uppercase text-xs ${
              selectedTeam === team
                ? "bg-green-500 text-white"
                : "bg-black text-white dark:bg-gray-600"
            } rounded hover:bg-gray-800 dark:hover:bg-gray-500`}
          >
            {team}
          </button>
        ))}
      </div>

      {/* Assignee Filters */}
      <div className="flex items-center flex-wrap gap-1 ml-0 md:ml-4">
        <span className="text-sm font-medium mr-2 flex-shrink-0">
          Assignees:
        </span>
        <button
          onClick={() => setSelectedAssignee(null)}
          className={`p-1 px-2 m-1 text-xs ${
            !selectedAssignee
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black dark:bg-gray-700 dark:text-gray-300"
          } rounded hover:bg-gray-300 dark:hover:bg-gray-600`}
        >
          ALL
        </button>
        {uniqueAssignees.map((assignee: string) => (
          <button
            key={assignee}
            onClick={() => setSelectedAssignee(assignee)}
            className={`p-1 px-2 m-1 text-xs ${
              selectedAssignee === assignee
                ? "bg-purple-500 text-white"
                : "bg-gray-700 text-white dark:bg-gray-600"
            } rounded hover:bg-gray-600 dark:hover:bg-gray-500`}
          >
            {assignee}
          </button>
        ))}
      </div>

      {/* Refresh and Connection Status */}
      <div className="flex items-center gap-2 ml-auto mt-2 md:mt-0">
        <button
          onClick={onRefresh}
          className="p-1.5 px-3 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
        <span
          className={`text-xs p-1.5 px-2 rounded ${
            socketConnected
              ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
              : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
          }`}
        >
          {connectionStatusMessage}
        </span>
      </div>
    </div>
  );
};

export default FilterControls;
