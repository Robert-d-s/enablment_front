import { gql } from "@apollo/client";
import {
  PROJECT_FRAGMENT,
  RATE_FRAGMENT,
  TIME_ENTRY_FRAGMENT,
} from "./fragments";

export const PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      ...Project
    }
  }
  ${PROJECT_FRAGMENT}
`;

export const RATES_QUERY = gql`
  query GetRates($teamId: String!) {
    rates(teamId: $teamId) {
      ...Rate
    }
  }
  ${RATE_FRAGMENT}
`;

export const TOTAL_TIME_QUERY = gql`
  query GetTotalTimeForUserProject($userId: Float!, $projectId: String!) {
    getTotalTimeForUserProject(userId: $userId, projectId: $projectId)
  }
`;

// USER_PROJECTS_QUERY removed — projects for a user should be fetched via GetMyProjects or similar dedicated queries

export const CREATE_TIME_MUTATION = gql`
  mutation CreateTime($timeInputCreate: TimeInputCreate!) {
    createTime(timeInputCreate: $timeInputCreate) {
      ...TimeEntry
    }
  }
  ${TIME_ENTRY_FRAGMENT}
`;

export const UPDATE_TIME_MUTATION = gql`
  mutation UpdateTime($timeInputUpdate: TimeInputUpdate!) {
    updateTime(timeInputUpdate: $timeInputUpdate) {
      ...TimeEntry
    }
  }
  ${TIME_ENTRY_FRAGMENT}
`;
