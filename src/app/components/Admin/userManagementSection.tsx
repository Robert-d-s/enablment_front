"use client";

import React, { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  ApolloError,
  useApolloClient,
  gql,
} from "@apollo/client";
import UserTable from "@/app/components/Admin/UserTable";
import { User as UserTableRowType } from "@/app/components/Admin/UserRow";
import { UserRole } from "@/app/components/Admin/UserRoleSelect";
import {
  GET_USERS,
  GET_SIMPLE_TEAMS,
  UPDATE_USER_ROLE,
  ADD_USER_TO_TEAM,
  REMOVE_USER_FROM_TEAM,
} from "@/app/graphql/adminOperations";
import { loggedInUserTeamsVersion } from "@/app/lib/apolloClient";
import { useAuthStore } from "@/app/lib/authStore";

const USER_CORE_FIELDS_FRAGMENT = gql`
  fragment UserCoreFields on User {
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

interface GetUsersQueryData {
  users: Array<{
    id: number;
    email: string;
    role: string;
    teams: Array<{
      id: string;
      name: string;
      __typename: "Team";
    }>;
    __typename: "User";
  }>;
}

interface GetSimpleTeamsQueryData {
  getAllSimpleTeams: Array<{
    id: string;
    name: string;
    __typename: "SimpleTeamDTO";
  }>;
}

type UserFragmentData = {
  id: number;
  email: string;
  role: string;
  teams: Array<{ id: string; name: string; __typename: "Team" }>;
  __typename: "User";
};

const UserManagementSection: React.FC = () => {
  const [users, setUsers] = useState<GetUsersQueryData["users"]>([]);
  const [selectedTeam, setSelectedTeam] = useState<{
    [userId: number]: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState("");

  const client = useApolloClient();
  const loggedInUser = useAuthStore((state) => state.user);

  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
  } = useQuery<GetUsersQueryData>(GET_USERS);

  const { loading: loadingTeams, data: dataTeams } =
    useQuery<GetSimpleTeamsQueryData>(GET_SIMPLE_TEAMS);

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM, {
    onError: (error) => {
      console.error("Error adding user to team:", error);
      setErrorMessage(
        error.message || "Failed to add user to team. Please try again."
      );
    },
  });
  const [removeUserFromTeam] = useMutation(REMOVE_USER_FROM_TEAM, {
    onError: (error) => {
      console.error("Error removing user from team:", error);
      setErrorMessage(
        error.message || "Failed to remove user from team. Please try again."
      );
    },
  });

  useEffect(() => {
    if (dataUsers) {
      setUsers(dataUsers.users);
    }
  }, [dataUsers]);

  if (loadingUsers || loadingTeams) return <p>Loading User Data...</p>;
  if (errorUsers) {
    const graphQLError = errorUsers.graphQLErrors[0];
    if (graphQLError && graphQLError.extensions?.code === "FORBIDDEN") {
      return <p>You do not have permission to view users.</p>;
    }
    return <p>Error loading users: {errorUsers.message}</p>;
  }

  const handleTeamSelect = (userId: number, teamId: string) => {
    setSelectedTeam((prev) => ({ ...prev, [userId]: teamId }));
  };

  const handleAddToTeam = async (userId: number): Promise<void> => {
    const teamId = selectedTeam[userId];
    if (!teamId) {
      setErrorMessage("Please select a team first.");
      return;
    }
    setErrorMessage("");
    try {
      await addUserToTeam({ variables: { userId, teamId } });

      const allTeamsData = client.readQuery<GetSimpleTeamsQueryData>({
        query: GET_SIMPLE_TEAMS,
      });
      const teamToAdd = allTeamsData?.getAllSimpleTeams.find(
        (t) => t.id === teamId
      );
      if (!teamToAdd) {
        console.warn(`Team details for ID ${teamId} not found in cache.`);
        return;
      }

      const userCacheId = client.cache.identify({
        __typename: "User",
        id: userId,
      });
      if (!userCacheId) {
        console.warn(`Could not generate cache ID for User:${userId}`);
        return;
      }

      const existingUserFragment = client.readFragment<UserFragmentData>({
        id: userCacheId,
        fragment: USER_CORE_FIELDS_FRAGMENT,
      });
      if (
        !existingUserFragment ||
        existingUserFragment.teams.some((t) => t.id === teamId)
      ) {
        console.warn(
          `User fragment ${userCacheId} not found or team ${teamId} already exists.`
        );
        return;
      }

      const updatedTeams = [
        ...existingUserFragment.teams,
        { id: teamId, name: teamToAdd.name, __typename: "Team" as const },
      ];
      client.writeFragment({
        id: userCacheId,
        fragment: USER_CORE_FIELDS_FRAGMENT,
        data: { ...existingUserFragment, teams: updatedTeams },
      });

      if (loggedInUser && userId === loggedInUser.id) {
        loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
        console.log("Incremented loggedInUserTeamsVersion (Add).");
      }
      console.log(`Successfully updated cache for user ${userId} (Add).`);
    } catch (error) {
      console.error("Error adding user to team:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to add user to team."
      );
    }
  };

  const handleRemoveFromTeam = async (
    userId: number,
    teamId: string
  ): Promise<void> => {
    setErrorMessage("");
    try {
      await removeUserFromTeam({ variables: { userId, teamId } });

      const userCacheId = client.cache.identify({
        __typename: "User",
        id: userId,
      });
      if (!userCacheId) {
        console.warn(`Could not generate cache ID for User:${userId}`);
        return;
      }

      const existingUserFragment = client.readFragment<UserFragmentData>({
        id: userCacheId,
        fragment: USER_CORE_FIELDS_FRAGMENT,
      });
      if (!existingUserFragment) {
        console.warn(`User fragment ${userCacheId} not found.`);
        return;
      }

      const updatedTeams = existingUserFragment.teams.filter(
        (team) => team.id !== teamId
      );
      if (updatedTeams.length === existingUserFragment.teams.length) {
        console.warn(
          `Team ${teamId} not found in fragment for user ${userId}.`
        );
        return;
      }

      client.writeFragment({
        id: userCacheId,
        fragment: USER_CORE_FIELDS_FRAGMENT,
        data: { ...existingUserFragment, teams: updatedTeams },
      });

      if (loggedInUser && userId === loggedInUser.id) {
        loggedInUserTeamsVersion(loggedInUserTeamsVersion() + 1);
        console.log("Incremented loggedInUserTeamsVersion (Remove).");
      }
      console.log(`Successfully updated cache for user ${userId} (Remove).`);
    } catch (error) {
      console.error("Error removing user from team:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to remove user from team."
      );
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!Object.values(UserRole).includes(newRole as UserRole)) {
      setErrorMessage(`Invalid role selected: ${newRole}`);
      return;
    }
    setErrorMessage("");
    try {
      const result = await updateUserRole({ variables: { userId, newRole } });
      const updatedRole = result.data?.updateUserRole?.role;
      if (!updatedRole) {
        console.warn(
          "Role mutation succeeded but did not return updated role."
        );
        return;
      }

      const userCacheId = client.cache.identify({
        __typename: "User",
        id: userId,
      });
      if (!userCacheId) {
        console.warn(`Could not generate cache ID for User:${userId}`);
        return;
      }

      client.writeFragment({
        id: userCacheId,
        fragment: gql`
          fragment UpdateUserRoleData on User {
            role
          }
        `,
        data: { role: updatedRole },
      });
      console.log(`Successfully updated role cache for user ${userId}.`);
    } catch (error) {
      console.error("Error updating user role:", error);
      if (error instanceof ApolloError) {
        setErrorMessage(
          error.graphQLErrors[0]?.message || "Error updating role"
        );
      } else {
        setErrorMessage("An unexpected error occurred during role update.");
      }
    }
  };

  const usersForTable: UserTableRowType[] = users.map((user) => ({
    ...user,
    role: user.role as UserRole,
  }));

  return (
    <div className="mb-6 shadow-md">
      <UserTable
        users={usersForTable}
        teams={dataTeams?.getAllSimpleTeams || []}
        onTeamSelect={handleTeamSelect}
        onAddToTeam={handleAddToTeam}
        onRemoveFromTeam={handleRemoveFromTeam}
        onRoleChange={handleRoleChange}
      />
      {errorMessage && <p className="mt-2 text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default UserManagementSection;
