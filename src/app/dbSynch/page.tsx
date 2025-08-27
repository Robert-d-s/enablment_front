"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  useSyncDatabaseMutation,
  useGetIssuesQuery,
  useGetAllSimpleTeamsQuery,
  useGetProjectsQuery,
  type SimpleTeamDto,
  type Project,
  type Issue,
  type Label,
} from "@/generated/graphql";

export type SimpleTeam = SimpleTeamDto;
export type SimpleProject = Project;
export type DBSyncIssue = Issue;
export type SimpleLabel = Label;

// (Queries are imported from shared fragments/operations to avoid duplicate operation names)

const DBSyncPage: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [syncDetails, setSyncDetails] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("teams");

  // Queries to fetch data that will be affected by the sync
  const {
    loading: teamsLoading,
    error: teamsError,
    data: teamsData,
    refetch: refetchTeams,
  } = useGetAllSimpleTeamsQuery();

  const {
    loading: projectsLoading,
    error: projectsError,
    data: projectsData,
    refetch: refetchProjects,
  } = useGetProjectsQuery();

  const {
    loading: issuesLoading,
    error: issuesError,
    data: issuesData,
    refetch: refetchIssues,
  } = useGetIssuesQuery();

  // GraphQL mutation for database sync
  const [syncDatabase] = useSyncDatabaseMutation({
    onCompleted: (data) => {
      setSyncStatus("Database synchronization completed successfully!");
      setSyncDetails((prev) => [
        ...prev,
        "Synchronization completed!",
        `Timestamp: ${
          data.synchronizeDatabase.timestamp || new Date().toISOString()
        }`,
      ]);
      setShowSuccess(true);

      // Refetch data to show updated state
      Promise.all([refetchTeams(), refetchProjects(), refetchIssues()]);
      setIsSyncing(false);
    },
    onError: (error) => {
      const errorMessage =
        error.message || "An error occurred during synchronization";

      setError(errorMessage);
      setSyncStatus("Database synchronization failed");
      setSyncDetails((prev) => [...prev, `Error: ${errorMessage}`]);
      setIsSyncing(false);
    },
  });

  // Function to trigger database synchronization
  const handleSync = () => {
    setIsSyncing(true);
    setSyncStatus("Starting comprehensive database synchronization...");
    setError(null);
    setShowSuccess(false);
    setSyncDetails([
      "Initializing synchronization...",
      "Connecting to Linear API...",
    ]);

    // Add progress updates for better UX - these are simulated since the actual work happens on the backend
    setTimeout(() => {
      if (isSyncing) {
        setSyncDetails((prev) => [
          ...prev,
          "Synchronizing teams from Linear...",
        ]);
      }
    }, 1000);

    setTimeout(() => {
      if (isSyncing) {
        setSyncDetails((prev) => [
          ...prev,
          "Synchronizing projects from Linear...",
        ]);
      }
    }, 3000);

    setTimeout(() => {
      if (isSyncing) {
        setSyncDetails((prev) => [
          ...prev,
          "Synchronizing issues and labels from Linear...",
        ]);
      }
    }, 5000);

    setTimeout(() => {
      if (isSyncing) {
        setSyncDetails((prev) => [...prev, "Cleaning up orphaned records..."]);
      }
    }, 7000);

    // Call the GraphQL mutation
    syncDatabase();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const isLoading = teamsLoading || projectsLoading || issuesLoading;
  const hasError = teamsError || projectsError || issuesError;

  const renderTabContent = () => {
    switch (activeTab) {
      case "teams":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border rounded-lg overflow-hidden h-full"
          >
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Teams</h3>
              <p className="text-sm text-gray-500">
                Total: {teamsData?.getAllSimpleTeams?.length || 0}
              </p>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {teamsData?.getAllSimpleTeams &&
              teamsData.getAllSimpleTeams.length > 0 ? (
                <ul className="space-y-2">
                  {teamsData.getAllSimpleTeams.map((team, index: number) => (
                    <motion.li
                      key={team.id}
                      variants={itemVariants}
                      custom={index}
                      className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        ID: {team.id}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No teams available
                </p>
              )}
            </div>
          </motion.div>
        );

      case "projects":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border rounded-lg overflow-hidden h-full"
          >
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Projects</h3>
              <p className="text-sm text-gray-500">
                Total: {projectsData?.projects?.length || 0}
              </p>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {projectsData?.projects && projectsData.projects.length > 0 ? (
                <ul className="space-y-2">
                  {projectsData.projects.map((project, index: number) => (
                    <motion.li
                      key={project.id}
                      variants={itemVariants}
                      custom={index}
                      className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        ID: {project.id}
                        <br />
                        Team ID: {project.teamId}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No projects available
                </p>
              )}
            </div>
          </motion.div>
        );

      case "issues":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border rounded-lg overflow-hidden h-full"
          >
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Issues</h3>
              <p className="text-sm text-gray-500">
                Total: {issuesData?.issues?.issues?.length || 0}
              </p>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {issuesData?.issues?.issues &&
              issuesData.issues.issues.length > 0 ? (
                <ul className="space-y-2">
                  {issuesData.issues.issues.map((issue, index: number) => (
                    <motion.li
                      key={issue.id}
                      variants={itemVariants}
                      custom={index}
                      className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Project: {issue.projectName || "N/A"}
                        <br />
                        State: {issue.state || "N/A"}
                      </div>
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {issue.labels
                            .filter((label) => label !== null)
                            .map((label) => (
                              <span
                                key={label!.id}
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{
                                  backgroundColor: label!.color || "#888",
                                }}
                              >
                                {label!.name}
                              </span>
                            ))}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No issues available
                </p>
              )}
            </div>
          </motion.div>
        );

      case "sync":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border rounded-lg overflow-hidden h-full"
          >
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Sync Details</h3>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {syncDetails.length > 0 ? (
                <ul className="space-y-2">
                  {syncDetails.map((detail, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      custom={index}
                      className="flex items-start gap-2"
                    >
                      <div className="text-green-500 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span
                        className={
                          detail.startsWith("Error")
                            ? "text-red-600"
                            : "text-gray-700"
                        }
                      >
                        {detail}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No synchronization has been run yet
                </p>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="container mx-auto p-6 font-roboto-condensed">
        <motion.div
          className="bg-white shadow-lg rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black text-white p-6">
            <h1 className="text-3xl font-bold">
              Linear Database Synchronization
            </h1>
            <p className="text-gray-300 mt-2">
              Synchronize your entire database with Linear - teams, projects,
              and issues
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-semibold">
                  Current Database State
                </h2>
                <div className="text-gray-600 mt-1">
                  <span className="inline-block mr-4">
                    <span className="font-semibold">Teams:</span>{" "}
                    {teamsData?.getAllSimpleTeams?.length || 0}
                  </span>
                  <span className="inline-block mr-4">
                    <span className="font-semibold">Projects:</span>{" "}
                    {projectsData?.projects?.length || 0}
                  </span>
                  <span className="inline-block">
                    <span className="font-semibold">Issues:</span>{" "}
                    {issuesData?.issues?.issues?.length || 0}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSync}
                disabled={isSyncing || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
                  isSyncing || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {isSyncing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Synchronize Database
                  </>
                )}
              </button>
            </div>

            {syncStatus && (
              <motion.div
                className={`mb-6 p-4 rounded-lg ${
                  error
                    ? "bg-red-100 border-l-4 border-red-500"
                    : showSuccess
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "bg-blue-100 border-l-4 border-blue-500"
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p
                  className={`${
                    error
                      ? "text-red-700"
                      : showSuccess
                      ? "text-green-700"
                      : "text-blue-700"
                  } font-medium`}
                >
                  {syncStatus}
                </p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </motion.div>
            )}

            {isLoading ? (
              <div className="text-center py-10">
                <svg
                  className="animate-spin h-10 w-10 text-black mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-4 text-gray-600">
                  Loading database information...
                </p>
              </div>
            ) : hasError ? (
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-red-700">
                  Error loading data:{" "}
                  {teamsError?.message || projectsError?.message}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 border-b">
                  <nav className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("teams")}
                      className={`whitespace-nowrap px-4 py-2 font-medium text-sm ${
                        activeTab === "teams"
                          ? "border-b-2 border-black text-black"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Teams
                    </button>
                    <button
                      onClick={() => setActiveTab("projects")}
                      className={`whitespace-nowrap px-4 py-2 font-medium text-sm ${
                        activeTab === "projects"
                          ? "border-b-2 border-black text-black"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => setActiveTab("issues")}
                      className={`whitespace-nowrap px-4 py-2 font-medium text-sm ${
                        activeTab === "issues"
                          ? "border-b-2 border-black text-black"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Issues
                    </button>
                    <button
                      onClick={() => setActiveTab("sync")}
                      className={`whitespace-nowrap px-4 py-2 font-medium text-sm ${
                        activeTab === "sync"
                          ? "border-b-2 border-black text-black"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Sync Details
                    </button>
                  </nav>
                </div>

                <div className="min-h-[400px]">{renderTabContent()}</div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DBSyncPage;
