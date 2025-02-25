"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, ApolloError } from "@apollo/client";
import NavigationBar from "../components/NavigationBar";
import UserTable from "@/app/components/Admin/UserTable";
import {
  GET_USERS,
  GET_SIMPLE_TEAMS,
  UPDATE_USER_ROLE,
  ADD_USER_TO_TEAM,
  REMOVE_USER_FROM_TEAM,
} from "@/app/graphql/adminOperations";
import TotalTimeSpent from "../time/page";
import RatesManager from "@/app/components/Admin/ratesManager";
import InvoiceDashboard from "../invoice/page";
import TeamSyncAndFetch from "../teamSync/page";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState<{
    [userId: number]: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState("");

  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
    refetch: refetchUsers,
  } = useQuery(GET_USERS);

  const { loading: loadingTeams, data: dataTeams } = useQuery(GET_SIMPLE_TEAMS);

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM, {
    onCompleted: () => refetchUsers(),
  });
  const [removeUserFromTeam] = useMutation(REMOVE_USER_FROM_TEAM, {
    onCompleted: () => refetchUsers(),
    onError: (error) => {
      console.error("Error removing user from team:", error);
    },
  });

  useEffect(() => {
    if (dataUsers) {
      setUsers(dataUsers.users);
    }
  }, [dataUsers]);

  if (loadingUsers || loadingTeams) return <p>Loading...</p>;
  if (errorUsers) {
    const graphQLError = errorUsers.graphQLErrors[0];
    if (graphQLError && graphQLError.extensions?.code === "FORBIDDEN") {
      return <p>You do not have permission to view this resource.</p>;
    }
    return <p>Error: {errorUsers.message}</p>;
  }

  const handleTeamSelect = (userId: number, teamId: string) => {
    setSelectedTeam((prev) => ({ ...prev, [userId]: teamId }));
  };

  const handleAddToTeam = (userId: number) => {
    const teamId = selectedTeam[userId];
    if (!teamId) {
      console.error("No team selected for user:", userId);
      return;
    }
    addUserToTeam({ variables: { userId, teamId } }).catch((error) =>
      console.error("Error adding user to team:", error)
    );
  };

  const handleRemoveFromTeam = (userId: number, teamId: string) => {
    removeUserFromTeam({ variables: { userId, teamId } }).catch((error) =>
      console.error("Error removing user from team:", error)
    );
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole({ variables: { userId, newRole } });
      setErrorMessage("");
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrorMessage(
          error.graphQLErrors[0]?.message || "Error updating role"
        );
      } else {
        console.error("Error updating user role:", error);
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
        <div className="container mx-auto p-4 font-roboto-condensed">
          <div className="mb-3">
            <UserTable
              users={users}
              teams={dataTeams?.getAllSimpleTeams}
              onTeamSelect={handleTeamSelect}
              onAddToTeam={handleAddToTeam}
              onRemoveFromTeam={handleRemoveFromTeam}
              onRoleChange={handleRoleChange}
            />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
          <div className="mb-3 shadow-md">
            <TotalTimeSpent />
          </div>
          <div className="mb-3 shadow-md">
            <RatesManager />
          </div>
          <div className="shadow-md">
            <InvoiceDashboard />
          </div>
          <div className="mt-3 float-right">
            <TeamSyncAndFetch />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
