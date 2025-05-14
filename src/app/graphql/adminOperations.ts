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
        __typename
      }
      __typename
    }
  }
`;

export const GET_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams {
    getAllSimpleTeams {
      id
      name
      __typename
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      id
      role
      __typename
    }
  }
`;

export const ADD_USER_TO_TEAM = gql`
  mutation AddUserToTeam($input: UserTeamInput!) {
    addUserToTeam(input: $input) {
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
  }
`;

export const REMOVE_USER_FROM_TEAM = gql`
  mutation RemoveUserFromTeam($input: UserTeamInput!) {
    removeUserFromTeam(input: $input) {
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
  }
`;
