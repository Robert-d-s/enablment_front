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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Loader2, Check, X, Plus } from "lucide-react";
import { cn } from "@/app/lib/utils";

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
    console.log(
      `UserRow for ${user.email} received allTeams:`,
      JSON.stringify(allTeams, null, 2)
    );
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
          const teamIdToAdd = variables.input.teamId;
          const userId = variables.input.userId;
          const teamToAdd = allTeams.find((t) => t.id === teamIdToAdd);
          console.log(
            "Found teamToAdd in optimisticResponse:",
            JSON.stringify(teamToAdd, null, 2)
          );
          if (!teamToAdd || !teamToAdd.name) {
            console.warn(
              "Optimistic Response: Could not find team",
              teamIdToAdd,
              "in allTeams prop."
            );
            return undefined;
          }
          const optimisticTeams = [
            ...user.teams.map((t) => ({
              __typename: "Team" as const,
              id: t.id,
              name: t.name,
            })),
            {
              __typename: "Team" as const,
              id: teamToAdd.id,
              name: teamToAdd.name,
            },
          ];

          const result = {
            addUserToTeam: {
              __typename: "User",
              id: userId,
              email: user.email,
              role: user.role,
              teams: optimisticTeams,
            },
          };
          console.log(
            "Optimistic Response Generated:",
            JSON.stringify(result, null, 2)
          );
          return result;
        },
        update: (cache, { data }) => {
          console.log(
            "Mutation Response Data in Update:",
            JSON.stringify(data, null, 2)
          );
          if (!data?.addUserToTeam) {
            console.log(
              "Cache update skipped: No addUserToTeam data in response."
            );
            return;
          }
          const userIdCacheId = cache.identify({
            __typename: "User",
            id: data.addUserToTeam.id,
          });
          if (!userIdCacheId) {
            console.log(
              "Cache update skipped: Could not identify user in cache."
            );
            return;
          }
          console.log(
            `Writing fragment for user ${userIdCacheId} with data:`,
            JSON.stringify(data.addUserToTeam, null, 2)
          );
          try {
            cache.writeFragment({
              id: userIdCacheId,
              fragment: USER_ROW_FRAGMENT,
              data: data.addUserToTeam,
            });
            console.log(
              `Successfully wrote fragment for user ${userIdCacheId}`
            );
          } catch (writeError) {
            console.error(
              `Error writing fragment for user ${userIdCacheId}:`,
              writeError
            );
          }
          if (loggedInUserId === data.addUserToTeam.id)
            setSelectedTeamIdForRow("");
        },
        onCompleted: (data) => {
          console.log("Mutation onCompleted received data:", data);
          if (data?.addUserToTeam && loggedInUserId === data.addUserToTeam.id) {
            console.log("Updating loggedInUserTeamsVersion in onCompleted");
            loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
          }
          toast.success("User added to team!");
        },
        onError: (error) => handleMutationError("adding user to team", error),
      }
    );

    const [removeUserFromTeamMutation, { loading: isRemovingTeam }] =
      useMutation(REMOVE_USER_FROM_TEAM, {
        optimisticResponse: (variables) => {
          const teamIdToRemove = variables.input.teamId;
          const userId = variables.input.userId;
          const optimisticTeams = user.teams
            .filter((t) => t.id !== teamIdToRemove)
            .map((t) => ({
              __typename: "Team" as const,
              id: t.id,
              name: t.name,
            }));
          const result = {
            removeUserFromTeam: {
              __typename: "User",
              id: userId,
              email: user.email,
              role: user.role,
              teams: optimisticTeams,
            },
          };
          console.log(
            "Optimistic Response Generated (Remove):",
            JSON.stringify(result, null, 2)
          );
          return result;
        },
        update: (cache, { data }) => {
          console.log(
            "Mutation Response Data in Update (Remove):",
            JSON.stringify(data, null, 2)
          );
          if (!data?.removeUserFromTeam) {
            console.log(
              "Cache update skipped (Remove): No removeUserFromTeam data."
            );
            return;
          }
          const userIdCacheId = cache.identify({
            __typename: "User",
            id: data.removeUserFromTeam.id,
          });
          if (!userIdCacheId) {
            console.log("Cache update skipped (Remove): Cannot identify user.");
            return;
          }
          console.log(
            `Writing fragment for user ${userIdCacheId} with data (Remove):`,
            JSON.stringify(data.removeUserFromTeam, null, 2)
          );
          try {
            cache.writeFragment({
              id: userIdCacheId,
              fragment: USER_ROW_FRAGMENT,
              data: data.removeUserFromTeam,
            });
            console.log(
              `Successfully wrote fragment for user ${userIdCacheId} (Remove)`
            );
          } catch (writeError) {
            console.error(
              `Error writing fragment for user ${userIdCacheId} (Remove):`,
              writeError
            );
          }
        },
        onCompleted: (data) => {
          if (loggedInUserId === data.removeUserFromTeam.id) {
            console.log("Updating loggedInUserTeamsVersion in onCompleted");
            loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
          }
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
        optimisticResponse: (variables) => {
          const userId = variables.input.userId;
          const newRole = variables.input.newRole;

          const optimisticTeams = user.teams.map((t) => ({
            __typename: "Team" as const,
            id: t.id,
            name: t.name,
          }));

          const result = {
            updateUserRole: {
              __typename: "User",
              id: userId,

              email: user.email,
              role: newRole,
              teams: optimisticTeams,
            },
          };
          console.log(
            "Optimistic Response Generated (UpdateRole):",
            JSON.stringify(result, null, 2)
          );
          return result;
        },
        update: (cache, { data }) => {
          console.log(
            "Mutation Response Data in Update (UpdateRole):",
            JSON.stringify(data, null, 2)
          );
          if (!data?.updateUserRole) {
            console.log(
              "Cache update skipped (UpdateRole): No updateUserRole data."
            );
            return;
          }
          const userIdCacheId = cache.identify({
            __typename: "User",
            id: data.updateUserRole.id,
          });
          if (!userIdCacheId) {
            console.log(
              "Cache update skipped (UpdateRole): Cannot identify user."
            );
            return;
          }
          const existingUser = cache.readFragment<User>({
            id: userIdCacheId,
            fragment: USER_ROW_FRAGMENT,
          });
          if (existingUser) {
            console.log(
              `Writing fragment for user ${userIdCacheId} with data (UpdateRole):`,
              JSON.stringify(data.updateUserRole, null, 2)
            );
            try {
              cache.writeFragment({
                id: userIdCacheId,
                fragment: USER_ROW_FRAGMENT,
                data: { ...existingUser, role: data.updateUserRole.role },
              });
              console.log(
                `Successfully wrote fragment for user ${userIdCacheId} (UpdateRole)`
              );
            } catch (writeError) {
              console.error(
                `Error writing fragment for user ${userIdCacheId} (UpdateRole):`,
                writeError
              );
            }
          } else {
            console.log(
              `Cache update skipped (UpdateRole): Cannot read existing fragment for user ${userIdCacheId}.`
            );
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
        variables: {
          input: {
            userId: user.id,
            teamId: selectedTeamIdForRow,
          },
        },
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
          variables: { input: { userId: user.id, teamId: teamIdToRemove } },
        });
      },
      [removeUserFromTeamMutation, user.id]
    );

    const handleRoleChange = useCallback(
      (newRole: UserRole) => {
        if (newRole === user.role) return;
        setRowError(null);
        updateUserRoleMutation({
          variables: { input: { userId: user.id, newRole } },
        });
      },
      [updateUserRoleMutation, user.id, user.role]
    );

    const isProcessingAnyRemove =
      isRemovingTeam && confirmingRemoveTeamId !== null;
    const isAnyActionLoading =
      isAddingTeam || isProcessingAnyRemove || isChangingRole;

    return (
      <TableRow key={user.id}>
        <TableCell className="font-medium">
          {user.email}
          {rowError && <p className="text-red-500 text-xs mt-1">{rowError}</p>}
        </TableCell>
        <TableCell>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Select
                value={selectedTeamIdForRow}
                onValueChange={setSelectedTeamIdForRow}
                disabled={isAnyActionLoading}
              >
                <SelectTrigger className="w-full text-sm h-8">
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  {allTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAddToTeam}
                disabled={
                  isAddingTeam || !selectedTeamIdForRow || isAnyActionLoading
                }
                size="sm"
                className="w-[70px] min-w-[70px] flex-shrink-0"
                variant={isAddingTeam ? "secondary" : "default"}
              >
                {isAddingTeam ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                {!isAddingTeam && "Add"}
              </Button>
            </div>
            {user.teams && user.teams.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {user.teams.map((team) => {
                  const isConfirmingThis = confirmingRemoveTeamId === team.id;
                  const isRemovingThis =
                    isRemovingTeam && confirmingRemoveTeamId === team.id;

                  return (
                    <Badge
                      key={team.id}
                      variant={isConfirmingThis ? "destructive" : "secondary"}
                      className={cn(
                        "flex items-center gap-1",
                        isConfirmingThis && "border-destructive/50"
                      )}
                    >
                      <span>{team.name}</span>
                      {isConfirmingThis ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-destructive hover:bg-destructive/10"
                            onClick={() => executeRemoveTeam(team.id)}
                            disabled={isRemovingThis}
                            title="Confirm Remove"
                          >
                            {isRemovingThis ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:bg-muted/50"
                            onClick={cancelRemoveConfirmation}
                            disabled={isRemovingThis}
                            title="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
                          onClick={() => requestRemoveConfirmation(team.id)}
                          disabled={
                            isAnyActionLoading || !!confirmingRemoveTeamId
                          }
                          title="Remove from team"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs italic pt-1">
                No teams assigned
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="w-[150px]">
          {isChangingRole ? (
            <div className="flex items-center justify-start h-full">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UserRoleSelect
              currentRole={user.role}
              onRoleChange={handleRoleChange}
              disabled={isAnyActionLoading}
              className="h-8 text-sm"
            />
          )}
        </TableCell>
      </TableRow>
    );
  }
);

UserRow.displayName = "UserRow";
export default UserRow;
