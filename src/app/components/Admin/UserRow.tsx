"use client";

import React, { useState, useCallback } from "react";
import { useMutation, gql, ApolloError } from "@apollo/client";
import { toast } from "react-toastify";
import {
  ADD_USER_TO_TEAM,
  REMOVE_USER_FROM_TEAM,
  UPDATE_USER_ROLE,
} from "@/app/graphql/adminOperations";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import UserRoleSelect, { UserRole } from "./UserRoleSelect";
import { Loader2, Check, X, Plus } from "lucide-react";

const USER_ROW_FRAGMENT = gql`
  fragment UserRowData on User {
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

interface UserRowProps {
  user: User;
  allTeams: Team[];
  loggedInUserId: number | undefined;
}

const UserRow: React.FC<UserRowProps> = React.memo(
  ({ user, allTeams, loggedInUserId }) => {
    const [selectedTeamIdForRow, setSelectedTeamIdForRow] =
      useState<string>("");
    const [confirmingRemoveTeamId, setConfirmingRemoveTeamId] = useState<
      string | null
    >(null);
    const [rowError, setRowError] = useState<string | null>(null);

    const handleMutationError = (
      action: string,
      error: ApolloError | Error | unknown
    ) => {
      console.error(`Error ${action}:`, error);
      let errorMsg = `Failed to ${action}.`;

      if (error instanceof ApolloError) {
        errorMsg =
          error.graphQLErrors?.[0]?.message ||
          error.networkError?.message ||
          error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      } else {
        errorMsg = `An unknown error occurred while ${action}.`;
        console.error("Unknown error type:", error);
      }
      setRowError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    };

    const [addUserToTeamMutation, { loading: isAddingTeam }] = useMutation(
      ADD_USER_TO_TEAM,
      {
        optimisticResponse: (variables) => {
          const teamToAdd = allTeams.find((t) => t.id === variables.teamId);
          if (!teamToAdd) return undefined;
          const optimisticTeams = [
            ...user.teams,
            { ...teamToAdd, __typename: "Team" as const },
          ];
          return {
            addUserToTeam: {
              __typename: "User",
              id: user.id,
              email: user.email,
              role: user.role,
              teams: optimisticTeams,
            },
          };
        },
        update: (cache, { data }) => {
          if (!data?.addUserToTeam) return;
          const userId = cache.identify({ __typename: "User", id: user.id });
          if (!userId) return;
          cache.writeFragment({
            id: userId,
            fragment: USER_ROW_FRAGMENT,
            data: data.addUserToTeam,
          });
          if (loggedInUserId === user.id)
            loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
          setSelectedTeamIdForRow("");
        },
        onError: (error) => handleMutationError("adding user to team", error),
      }
    );

    const [removeUserFromTeamMutation, { loading: isRemovingTeam }] =
      useMutation(REMOVE_USER_FROM_TEAM, {
        optimisticResponse: (variables) => {
          const optimisticTeams = user.teams.filter(
            (t) => t.id !== variables.teamId
          );
          return {
            removeUserFromTeam: {
              __typename: "User",
              id: user.id,
              email: user.email,
              role: user.role,
              teams: optimisticTeams,
            },
          };
        },
        update: (cache, { data }) => {
          if (!data?.removeUserFromTeam) return;
          const userId = cache.identify({ __typename: "User", id: user.id });
          if (!userId) return;
          cache.writeFragment({
            id: userId,
            fragment: USER_ROW_FRAGMENT,
            data: data.removeUserFromTeam,
          });
          if (loggedInUserId === user.id)
            loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
        },
        onCompleted: () => {
          toast.success("User removed from team!");
          setConfirmingRemoveTeamId(null);
        },
        onError: (error) => {
          handleMutationError("removing user from team", error);
          setConfirmingRemoveTeamId(null);
        },
      });

    const [updateUserRoleMutation, { loading: isChangingRole }] = useMutation(
      UPDATE_USER_ROLE,
      {
        optimisticResponse: (variables) => ({
          updateUserRole: {
            __typename: "User",
            id: user.id,
            role: variables.newRole,
          },
        }),
        update: (cache, { data }) => {
          if (!data?.updateUserRole) return;
          const userId = cache.identify({ __typename: "User", id: user.id });
          if (!userId) return;
          const existingUser = cache.readFragment<User>({
            id: userId,
            fragment: USER_ROW_FRAGMENT,
          });
          if (existingUser) {
            cache.writeFragment({
              id: userId,
              fragment: USER_ROW_FRAGMENT,
              data: { ...existingUser, role: data.updateUserRole.role },
            });
          }
        },
        onCompleted: (data) => {
          if (data?.updateUserRole) {
            toast.success(
              `Role for ${user.email} updated to ${data.updateUserRole.role}!`
            );
          }
        },
        onError: (error) => handleMutationError("updating role", error),
      }
    );

    const handleAddToTeam = useCallback(() => {
      if (!selectedTeamIdForRow) {
        setRowError("Please select a team first.");
        return;
      }
      if (user.teams.some((team) => team.id === selectedTeamIdForRow)) {
        setRowError("User is already in this team.");
        toast.warn("User is already a member of this team.");
        return;
      }
      setRowError(null);
      addUserToTeamMutation({
        variables: { userId: user.id, teamId: selectedTeamIdForRow },
      });
    }, [addUserToTeamMutation, selectedTeamIdForRow, user.id, user.teams]);

    const requestRemoveConfirmation = useCallback((teamId: string) => {
      setConfirmingRemoveTeamId(teamId);
      setRowError(null);
    }, []);

    const cancelRemoveConfirmation = useCallback(() => {
      setConfirmingRemoveTeamId(null);
    }, []);

    const executeRemoveTeam = useCallback(
      (teamIdToRemove: string) => {
        if (!teamIdToRemove) return;
        setRowError(null);
        removeUserFromTeamMutation({
          variables: { userId: user.id, teamId: teamIdToRemove },
        });
      },
      [removeUserFromTeamMutation, user.id]
    );

    const handleRoleChange = useCallback(
      (newRole: UserRole) => {
        if (newRole === user.role) return;
        setRowError(null);
        updateUserRoleMutation({ variables: { userId: user.id, newRole } });
      },
      [updateUserRoleMutation, user.id, user.role]
    );

    const isProcessingAnyRemove =
      isRemovingTeam && confirmingRemoveTeamId !== null;
    const isAnyActionLoading =
      isAddingTeam || isProcessingAnyRemove || isChangingRole;

    return (
      <>
        <tr>
          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
            {user.email}
            {rowError && (
              <p className="text-red-500 text-xs mt-1">{rowError}</p>
            )}
          </td>

          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md align-top">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <div className="relative flex-grow">
                  <select
                    value={selectedTeamIdForRow}
                    onChange={(e) => setSelectedTeamIdForRow(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded appearance-none text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                    disabled={isAnyActionLoading}
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
                  disabled={
                    isAddingTeam || !selectedTeamIdForRow || isAnyActionLoading
                  }
                  className={`bg-black text-white font-bold py-1 px-2 rounded flex items-center justify-center text-sm disabled:opacity-50 w-[70px] min-w-[70px] ${
                    isAddingTeam ? "bg-gray-500" : "hover:bg-green-700"
                  }`}
                >
                  {isAddingTeam ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span className="ml-1">{isAddingTeam ? "" : "Add"}</span>
                </button>
              </div>

              {user.teams && user.teams.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {user.teams.map((team) => {
                    const isConfirmingThis = confirmingRemoveTeamId === team.id;
                    const isRemovingThis =
                      isRemovingTeam && confirmingRemoveTeamId === team.id;

                    return (
                      <div
                        key={team.id}
                        className={`rounded-full px-2 py-0.5 text-xs flex items-center border ${
                          isConfirmingThis
                            ? "bg-red-100 border-red-400"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      >
                        <span>{team.name}</span>
                        {isConfirmingThis ? (
                          <>
                            <button
                              onClick={() => executeRemoveTeam(team.id)}
                              disabled={isRemovingThis}
                              className="ml-1.5 px-1 py-0.5 bg-red-500 text-white rounded text-xxs hover:bg-red-700 disabled:opacity-50"
                              title="Confirm Remove"
                            >
                              {isRemovingThis ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={cancelRemoveConfirmation}
                              disabled={isRemovingThis}
                              className="ml-1 px-1 py-0.5 bg-gray-300 text-black rounded text-xxs hover:bg-gray-400 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => requestRemoveConfirmation(team.id)}
                            disabled={
                              isAnyActionLoading || !!confirmingRemoveTeamId
                            }
                            className="ml-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            title="Remove from team"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
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
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
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
  }
);

UserRow.displayName = "UserRow";

export default UserRow;
