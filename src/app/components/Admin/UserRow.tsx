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
import { GET_MY_PROJECTS } from "@/app/components/Admin/totalTimeSpent";
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
        refetchQueries: [{ query: GET_MY_PROJECTS }],
        awaitRefetchQueries: true,
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
        refetchQueries: [{ query: GET_MY_PROJECTS }],
        awaitRefetchQueries: true,
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
