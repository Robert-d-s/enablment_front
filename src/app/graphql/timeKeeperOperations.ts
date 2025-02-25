import { gql } from "@apollo/client";

export const PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      id
      name
      teamId
    }
  }
`;

export const RATES_QUERY = gql`
  query GetRates($teamId: String!) {
    rates(teamId: $teamId) {
      id
      name
      rate
    }
  }
`;

export const TOTAL_TIME_QUERY = gql`
  query GetTotalTimeForUserProject($userId: Float!, $projectId: String!) {
    getTotalTimeForUserProject(userId: $userId, projectId: $projectId)
  }
`;

export const USER_PROJECTS_QUERY = gql`
  query GetUserProjects {
    users {
      id
      teams {
        name
        projects {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_TIME_MUTATION = gql`
  mutation CreateTime($timeInputCreate: TimeInputCreate!) {
    createTime(timeInputCreate: $timeInputCreate) {
      id
      startTime
      endTime
      totalElapsedTime
    }
  }
`;

export const UPDATE_TIME_MUTATION = gql`
  mutation UpdateTime($timeInputUpdate: TimeInputUpdate!) {
    updateTime(timeInputUpdate: $timeInputUpdate) {
      id
      startTime
      endTime
      totalElapsedTime
    }
  }
`;
