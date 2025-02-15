import { useQuery, useMutation, gql } from "@apollo/client";
import { useState, useEffect } from "react";
import { ApolloError } from "@apollo/client";
import { logout } from "../lib/apolloClient";
import NavigationBar from "../components/NavigationBar";
import TotalTimeSpent from "./time";
import RatesManager from "./ratesManager";
import TeamSyncAndFetch from "./teamSync";
import InvoiceDashboard from "./invoice";
import { useRouter } from "next/router";

enum UserRole {
  ADMIN = "ADMIN",
  ENABLER = "ENABLER",
  COLLABORATOR = "COLLABORATOR",
  PENDING = "PENDING",
}

type User = {
  id: number;
  email: string;
  role: UserRole;
  teams: {
    id: string;
    name: string;
  }[];
};

type Team = {
  id: string;
  name: string;
};

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      role
      teams {
        id
        name
      }
    }
  }
`;

// const GET_TEAMS = gql`
//   query FetchTeamsFromLinear {
//     fetchTeamsFromLinear {
//       nodes {
//         id
//         name
//       }
//     }
//   }
// `;

const GET_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams {
    getAllSimpleTeams {
      id
      name
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: Int!, $newRole: UserRole!) {
    updateUserRole(userId: $userId, newRole: $newRole) {
      id
      role
    }
  }
`;

const ADD_USER_TO_TEAM = gql`
  mutation AddUserToTeam($userId: Int!, $teamId: String!) {
    addUserToTeam(userId: $userId, teamId: $teamId) {
      id
      email
    }
  }
`;

const REMOVE_USER_FROM_TEAM = gql`
  mutation RemoveUserFromTeam($userId: Int!, $teamId: String!) {
    removeUserFromTeam(userId: $userId, teamId: $teamId) {
      id
      email
      teams {
        id
        name
      }
    }
  }
`;

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<{
    [userId: number]: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
    refetch: refetchUsers,
  } = useQuery(GET_USERS, {
    // fetchPolicy: "network-only",
  });
  // console.log("Datausers", dataUsers);
  const { loading: loadingTeams, data: dataTeams } = useQuery(
    GET_SIMPLE_TEAMS,
    {
      // fetchPolicy: "network-only",
    }
  );
  console.log("DataTeams", dataTeams);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM, {
    onCompleted: () => refetchUsers(),
  });

  const [removeUserFromTeam, { error }] = useMutation(REMOVE_USER_FROM_TEAM, {
    onCompleted: () => refetchUsers(),
    onError: (error) => {
      // Handle error
      console.error("Error removing user from team:", error);
      // Potentially set an error state here
    },
  });

  useEffect(() => {
    if (dataUsers) {
      const usersWithTeams = dataUsers.users.map((user: User) => ({
        ...user,
        teams: user.teams || [],
      }));
      setUsers(usersWithTeams);
    }
  }, [dataUsers]);

  console.log("user data: ", dataUsers);
  console.log("error data: ", errorUsers);
  if (loadingUsers || loadingTeams) return <p>Loading...</p>;
  if (errorUsers) {
    const graphQLError = errorUsers.graphQLErrors[0];
    const message = graphQLError
      ? graphQLError.message
      : errorUsers.networkError
      ? "Network error, please try again."
      : "An error occurred.";

    // Specific handling based on error type
    if (graphQLError && graphQLError.extensions?.code === "FORBIDDEN") {
      // Handle Forbidden error
      return <p>You do not have permission to view this resource.</p>;
    } else if (
      graphQLError &&
      graphQLError.extensions?.code === "UNAUTHENTICATED"
    ) {
      // Handle Unauthorized error
      logout();
      return;
    }

    // return <p>Error: {message}</p>;
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Permission Denied!</strong>
          <span className="block sm:inline mr-8">
            {" "}
            You do not have permission to view this resource.
          </span>
          <button
            onClick={() => router.push("/login")} // Use router from 'next/router' to navigate
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 12.196 7.349 14.849a1.2 1.2 0 1 1-1.697-1.697L8.196 10 5.652 7.349a1.2 1.2 0 1 1 1.697-1.697L10 7.804l2.651-2.652a1.2 1.2 0 1 1 1.697 1.697L11.804 10l2.544 2.651a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  const handleAddUserToTeam = (userId: number) => () => {
    console.log(`Adding user ${userId} to team`);
    console.log(`Selected team for user ${userId}: ${selectedTeam[userId]}`);

    const teamId = selectedTeam[userId];
    console.log(`Attempting to add user ${userId} to team ${teamId}`);
    if (!teamId) {
      console.error("No team selected for user:", userId);
      return;
    }

    addUserToTeam({ variables: { userId, teamId } })
      .then(() => refetchUsers())
      .catch((error) => console.error("Error adding user to team:", error));
  };

  const handleRemoveUserFromTeam = (userId: number, teamId: string) => {
    removeUserFromTeam({
      variables: { userId, teamId },
    })
      .then(() => refetchUsers())
      .catch((error) => console.error("Error removing user from team:", error));
  };

  const handleTeamSelection = (userId: number, teamId: string) => {
    console.log(`Selected team for user ${userId}: ${teamId}`);
    setSelectedTeam((prev) => ({ ...prev, [userId]: teamId }));
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    console.log(`Updating role for user ${userId} to ${newRole}`);
    try {
      await updateUserRole({ variables: { userId, newRole } });
      setErrorMessage("");
    } catch (error) {
      if (error instanceof ApolloError) {
        const message =
          error.graphQLErrors[0]?.message ||
          "An error occurred while updating user role";
        setErrorMessage(message);
      } else {
        console.error("Error updating user role:", error);
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  const handleError = (error: ApolloError) => {
    const graphQLError = error.graphQLErrors[0];
    return graphQLError
      ? graphQLError.message
      : error.networkError
      ? "Network error, please try again."
      : "An error occurred.";
  };

  if (loadingUsers || loadingTeams) return <p>Loading...</p>;
  if (errorUsers) return <p>Error: {handleError(errorUsers)}</p>;

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
        <div className="container mx-auto p-4 font-roboto-condensed">
          <div className="mb-3">
            <UserTable
              users={users}
              // teams={dataTeams?.fetchTeamsFromLinear.nodes}
              teams={dataTeams?.getAllSimpleTeams}
              onTeamSelect={handleTeamSelection}
              onAddToTeam={(userId) => handleAddUserToTeam(userId)()}
              onRemoveFromTeam={handleRemoveUserFromTeam}
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

type UserTableProps = {
  users: User[];
  teams: Team[];
  onTeamSelect: (userId: number, teamId: string) => void;
  onAddToTeam: (userId: number) => void;
  onRemoveFromTeam: (userId: number, teamId: string) => void;
  onRoleChange: (userId: number, newRole: UserRole) => void;
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  teams,
  onTeamSelect,
  onAddToTeam,
  onRemoveFromTeam,
  onRoleChange,
}) => (
  <table className="min-w-full table-auto">
    <thead className="bg-black">
      <tr>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          User
        </th>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          Teams
        </th>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          Assigned
        </th>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          Role
        </th>
      </tr>
    </thead>
    <tbody>
      {users.map((user: User) => (
        <UserRow
          key={user.id}
          user={user}
          teams={teams}
          onTeamSelect={onTeamSelect}
          onAddToTeam={onAddToTeam}
          onRemoveFromTeam={onRemoveFromTeam}
          onRoleChange={onRoleChange}
        />
      ))}
    </tbody>
  </table>
);
type UserRowProps = {
  user: User;
  teams: Team[];
  onTeamSelect: (userId: number, teamId: string) => void;
  onAddToTeam: (userId: number) => void;
  onRemoveFromTeam: (userId: number, teamId: string) => void;
  onRoleChange: (userId: number, newRole: UserRole) => void;
};
const UserRow: React.FC<UserRowProps> = ({
  user,
  teams,
  onTeamSelect,
  onAddToTeam,
  onRemoveFromTeam,
  onRoleChange,
}) => {
  console.log("Teams for user:", user.id, user.teams);
  const safeTeams = teams || [];

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
        <TeamSelect
          teams={safeTeams}
          onTeamSelect={(teamId) => onTeamSelect(user.id, teamId)}
        />
        <button
          className="ml-20 bg-black hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => onAddToTeam(user.id)}
        >
          Add to Team
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
        {user.teams && user.teams.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {user.teams.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between border-b border-gray-200"
              >
                {team.name}
                <button
                  onClick={() => onRemoveFromTeam(user.id, team.id)}
                  className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded border-b border-gray-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No teams assigned</p>
        )}
      </td>
      <td className="border-b border-gray-200 shadow-md">
        <UserRoleSelect
          currentRole={user.role}
          onRoleChange={(newRole) => onRoleChange(user.id, newRole)}
        />
      </td>
    </tr>
  );
};

type TeamSelectProps = {
  teams: Team[];
  onTeamSelect: (teamId: string) => void;
};
const TeamSelect: React.FC<TeamSelectProps> = ({ teams, onTeamSelect }) => (
  <select onChange={(e) => onTeamSelect(e.target.value)}>
    <option value="">Select team...</option>
    {teams.map((team: Team) => (
      <option key={team.id} value={team.id}>
        {team.name}
      </option>
    ))}
  </select>
);

type UserRoleSelectProps = {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
};
const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  currentRole,
  onRoleChange,
}) => (
  <select
    defaultValue={currentRole}
    onChange={(e) => onRoleChange(e.target.value as UserRole)}
  >
    {Object.values(UserRole).map((role) => (
      <option key={role} value={role}>
        {role}
      </option>
    ))}
  </select>
);

export default AdminPage;
