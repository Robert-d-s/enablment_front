import { gql } from "@apollo/client";
import {
  USER_WITH_TEAMS_FRAGMENT,
  BASIC_USER_FRAGMENT,
  GET_ALL_SIMPLE_TEAMS,
} from "./fragments";

export const GET_USERS = gql`
  query GetUsers($args: UserQueryArgs!) {
    users(args: $args) {
      ...UserWithTeams
    }
  }
  ${USER_WITH_TEAMS_FRAGMENT}
`;

// Re-export shared query instead of duplicating
export { GET_ALL_SIMPLE_TEAMS as GET_SIMPLE_TEAMS };

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      ...BasicUser
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const ADD_USER_TO_TEAM = gql`
  mutation AddUserToTeam($input: UserTeamInput!) {
    addUserToTeam(input: $input) {
      ...UserWithTeams
    }
  }
  ${USER_WITH_TEAMS_FRAGMENT}
`;

export const REMOVE_USER_FROM_TEAM = gql`
  mutation RemoveUserFromTeam($input: UserTeamInput!) {
    removeUserFromTeam(input: $input) {
      ...UserWithTeams
    }
  }
  ${USER_WITH_TEAMS_FRAGMENT}
`;
