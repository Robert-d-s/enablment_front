"use client";

import React, { useState, useCallback } from "react";
import { useMutation, useApolloClient, gql, ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import {
  ADD_USER_TO_TEAM,
  REMOVE_USER_FROM_TEAM,
  UPDATE_USER_ROLE,
  GET_SIMPLE_TEAMS,
} from "@/app/graphql/adminOperations";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import UserRoleSelect, { UserRole } from "./UserRoleSelect";

export interface Team {
  id: string;
  name: string;
  __typename?: "Team" | "SimpleTeamDTO";
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  teams: Team[];
  __typename?: "User";
}

type UserFragmentData = {
  id: number;
  email: string;
  role: string;
  teams: Array<{ id: string; name: string; __typename: "Team" }>;
  __typename: "User";
};

interface GetSimpleTeamsQueryData {
  getAllSimpleTeams: Array<{
    id: string;
    name: string;
    __typename: "SimpleTeamDTO";
  }>;
}

const USER_CORE_FIELDS_FRAGMENT = gql`
  fragment UserCoreFieldsRow on User {
    id
    email
    role
    teams {
      id
      name
      __typename
    }
    __typename
  }
`;

interface UserRowProps {
  user: User;
  allTeams: Team[];
  loggedInUserId: number | undefined;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  allTeams,
  loggedInUserId,
}) => {
  const [selectedTeamIdForRow, setSelectedTeamIdForRow] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [confirmingRemoveTeamId, setConfirmingRemoveTeamId] = useState<
    string | null
  >(null);
  const [isProcessingRemove, setIsProcessingRemove] = useState<string | null>(
    null
  );
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const client = useApolloClient();

  const [addUserToTeamMutation] = useMutation(ADD_USER_TO_TEAM, {
    onError: (error) => {
      console.error("Error adding user to team:", error);
      const errorMsg = error.message || "Failed to add user to team.";
      setRowError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
      setIsAdding(false);
    },
  });
  const [removeUserFromTeamMutation] = useMutation(REMOVE_USER_FROM_TEAM, {
    onError: (error) => {
      console.error("Error removing user from team:", error);
      const errorMsg = error.message || "Failed to remove user from team.";
      setRowError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
      setIsProcessingRemove(null); // Use isProcessingRemove here
      setConfirmingRemoveTeamId(null); // Also clear confirmation state on error
    },
  });
  const [updateUserRoleMutation] = useMutation(UPDATE_USER_ROLE, {
    onError: (error) => {
      console.error("Error updating user role:", error);
      const errorMsg =
        error instanceof ApolloError
          ? error.graphQLErrors[0]?.message || "Error updating role"
          : "An unexpected error occurred during role update.";
      setRowError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
      setIsChangingRole(false);
    },
  });

  const handleAddToTeam = useCallback(async () => {
    if (!selectedTeamIdForRow) {
      setRowError("Please select a team first.");
      return;
    }
    setRowError(null);
    setIsAdding(true);

    try {
      await addUserToTeamMutation({
        variables: { userId: user.id, teamId: selectedTeamIdForRow },
      });

      const allTeamsData = client.readQuery<GetSimpleTeamsQueryData>({
        query: GET_SIMPLE_TEAMS,
      });
      const teamToAdd = allTeamsData?.getAllSimpleTeams.find(
        (t) => t.id === selectedTeamIdForRow
      );
      if (!teamToAdd) {
        throw new Error("Team details not found in cache");
      }

      const userCacheId = client.cache.identify({
        __typename: "User",
        id: user.id,
      });
      if (!userCacheId) {
        throw new Error("Could not identify user in cache");
      }

      const existingUserFragment = client.readFragment<UserFragmentData>({
        id: userCacheId,
        fragment: USER_CORE_FIELDS_FRAGMENT,
      });
      if (
        !existingUserFragment ||
        existingUserFragment.teams.some((t) => t.id === selectedTeamIdForRow)
      ) {
        console.log("User fragment not found or team already added.");
        setIsAdding(false);
        return;
      }

      const updatedTeams = [
        ...existingUserFragment.teams,
        {
          id: selectedTeamIdForRow,
          name: teamToAdd.name,
          __typename: "Team" as const,
        },
      ];
      client.writeFragment({
        id: userCacheId,
        fragment: USER_CORE_FIELDS_FRAGMENT,
        data: { ...existingUserFragment, teams: updatedTeams },
      });

      if (loggedInUserId && user.id === loggedInUserId) {
        loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
      }
      console.log(`Successfully updated cache for user ${user.id} (Add).`);
      toast.success(`Added ${user.email} to team ${teamToAdd.name}!`);
    } catch (error) {
      console.error("Catch block for handleAddToTeam:", error);
      if (!rowError) {
        // Check if error wasn't already set by onError
        const errorMsg =
          error instanceof Error ? error.message : "Failed to add to team.";
        setRowError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setIsAdding(false);
    }
  }, [
    user.id,
    selectedTeamIdForRow,
    addUserToTeamMutation,
    client,
    loggedInUserId,
    rowError,
  ]);

  const requestRemoveConfirmation = (teamId: string) => {
    setConfirmingRemoveTeamId(teamId);
    setRowError(null);
  };

  const cancelRemoveConfirmation = () => {
    setConfirmingRemoveTeamId(null);
  };

  const executeRemoveTeam = useCallback(
    async (teamIdToRemove: string) => {
      if (!teamIdToRemove) return;
      setRowError(null);
      setIsProcessingRemove(teamIdToRemove);
      setConfirmingRemoveTeamId(null);

      try {
        await removeUserFromTeamMutation({
          variables: { userId: user.id, teamId: teamIdToRemove },
        });

        const userCacheId = client.cache.identify({
          __typename: "User",
          id: user.id,
        });
        if (!userCacheId) {
          throw new Error("Could not identify user in cache");
        }
        const existingUserFragment = client.readFragment<UserFragmentData>({
          id: userCacheId,
          fragment: USER_CORE_FIELDS_FRAGMENT,
        });
        if (!existingUserFragment) {
          throw new Error("User fragment not found in cache");
        }

        const updatedTeams = existingUserFragment.teams.filter(
          (team) => team.id !== teamIdToRemove
        );
        if (updatedTeams.length === existingUserFragment.teams.length) {
          console.warn(
            `Team ${teamIdToRemove} not found in fragment for user ${user.id}.`
          );
          setIsProcessingRemove(null); // Still need to clear processing state
          return;
        }

        client.writeFragment({
          id: userCacheId,
          fragment: USER_CORE_FIELDS_FRAGMENT,
          data: { ...existingUserFragment, teams: updatedTeams },
        });

        if (loggedInUserId && user.id === loggedInUserId) {
          loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
        }
        console.log(`Successfully updated cache for user ${user.id} (Remove).`);
        toast.success(`Removed ${user.email} from team!`);
      } catch (error) {
        console.error("Catch block for executeRemoveTeam:", error);
        if (!rowError) {
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Failed to remove from team.";
          setRowError(errorMsg);
          toast.error(`Error: ${errorMsg}`);
        }
      } finally {
        setIsProcessingRemove(null);
      }
    },
    [user.id, removeUserFromTeamMutation, client, loggedInUserId, rowError]
  );

  const handleRoleChange = useCallback(
    async (newRole: UserRole) => {
      if (newRole === user.role) return;
      setRowError(null);
      setIsChangingRole(true);

      try {
        const result = await updateUserRoleMutation({
          variables: { userId: user.id, newRole },
        });
        const updatedRole = result.data?.updateUserRole?.role;
        if (!updatedRole) {
          throw new Error("Mutation did not return updated role.");
        }

        const userCacheId = client.cache.identify({
          __typename: "User",
          id: user.id,
        });
        if (!userCacheId) {
          throw new Error("Could not identify user in cache");
        }

        client.writeFragment({
          id: userCacheId,
          fragment: gql`
            fragment UpdateUserRoleDataRow on User {
              role
            }
          `,
          data: { role: updatedRole },
        });
        console.log(`Successfully updated role cache for user ${user.id}.`);
        toast.success(`Role for ${user.email} updated to ${newRole}!`);
      } catch (error) {
        console.error("Catch block for handleRoleChange:", error);
        if (!rowError) {
          const errorMsg =
            error instanceof ApolloError
              ? error.graphQLErrors[0]?.message || "Error updating role"
              : error instanceof Error
              ? error.message
              : "Failed to update role.";
          setRowError(errorMsg);
          toast.error(`Error: ${errorMsg}`);
        }
      } finally {
        setIsChangingRole(false);
      }
    },
    [user.id, user.role, updateUserRoleMutation, client, rowError]
  );

  return (
    <>
      <tr>
        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
          {user.email}
          {rowError && <p className="text-red-500 text-xs mt-1">{rowError}</p>}
        </td>

        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md align-top">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <select
                  value={selectedTeamIdForRow}
                  onChange={(e) => setSelectedTeamIdForRow(e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded appearance-none text-sm"
                  disabled={isAdding}
                >
                  <option value="">Select team...</option>
                  {allTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              <button
                onClick={handleAddToTeam}
                disabled={isAdding || !selectedTeamIdForRow}
                className={`bg-black text-white font-bold py-1 px-2 rounded flex items-center text-sm disabled:opacity-50 ${
                  isAdding ? "bg-gray-500" : "hover:bg-green-700"
                }`}
              >
                {isAdding ? (
                  <>
                    <svg
                      className="animate-spin mr-1 h-3 w-3 text-white"
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
                    Adding...
                  </>
                ) : (
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                )}
                Add
              </button>
            </div>

            {user.teams && user.teams.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {user.teams.map((team) => (
                  <div
                    key={team.id}
                    className={`rounded-full px-2 py-0.5 text-xs flex items-center border ${
                      confirmingRemoveTeamId === team.id
                        ? "bg-red-100 border-red-400"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <span>{team.name}</span>
                    {confirmingRemoveTeamId === team.id ? (
                      <>
                        <button
                          onClick={() => executeRemoveTeam(team.id)}
                          disabled={isProcessingRemove === team.id}
                          className="ml-1.5 px-1 py-0.5 bg-red-500 text-white rounded text-xxs hover:bg-red-700 disabled:opacity-50"
                          title="Confirm Remove"
                        >
                          {isProcessingRemove === team.id ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={cancelRemoveConfirmation}
                          disabled={isProcessingRemove === team.id}
                          className="ml-1 px-1 py-0.5 bg-gray-300 text-black rounded text-xxs hover:bg-gray-400 disabled:opacity-50"
                          title="Cancel"
                        >
                          {" "}
                          X{" "}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => requestRemoveConfirmation(team.id)}
                        disabled={
                          !!isProcessingRemove ||
                          confirmingRemoveTeamId === team.id
                        }
                        className="ml-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="Remove from team"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 text-xs italic pt-1">
                No teams assigned
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
          {isChangingRole ? (
            <span className="text-xs text-gray-500 italic">Updating...</span>
          ) : (
            <UserRoleSelect
              currentRole={user.role}
              onRoleChange={handleRoleChange}
            />
          )}
        </td>
      </tr>
    </>
  );
};

export default React.memo(UserRow);
