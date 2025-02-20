import { gql } from "@apollo/client";

export const GET_USERS = gql`
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

export const GET_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams {
    getAllSimpleTeams {
      id
      name
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: Int!, $newRole: UserRole!) {
    updateUserRole(userId: $userId, newRole: $newRole) {
      id
      role
    }
  }
`;

export const ADD_USER_TO_TEAM = gql`
  mutation AddUserToTeam($userId: Int!, $teamId: String!) {
    addUserToTeam(userId: $userId, teamId: $teamId) {
      id
      email
    }
  }
`;

export const REMOVE_USER_FROM_TEAM = gql`
  mutation RemoveUserFromTeam($userId: Int!, $teamId: String!) {
    removeUserFromTeam(userId: $userId, teamId: $teamId) {
      id
      email
    }
  }
`;
