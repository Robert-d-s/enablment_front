import { gql } from "@apollo/client";

// Basic entity fragments
export const BASIC_USER_FRAGMENT = gql`
  fragment BasicUser on User {
    id
    email
    role
    __typename
  }
`;

export const AUTH_USER_FRAGMENT = gql`
  fragment AuthUser on User {
    id
    email
    role
  }
`;

export const SIMPLE_TEAM_FRAGMENT = gql`
  fragment SimpleTeam on SimpleTeamDTO {
    id
    name
    __typename
  }
`;

export const TEAM_FRAGMENT = gql`
  fragment Team on Team {
    id
    name
    __typename
  }
`;

export const PROJECT_FRAGMENT = gql`
  fragment Project on Project {
    id
    name
    teamId
    __typename
  }
`;

export const PROJECT_WITH_TEAM_FRAGMENT = gql`
  fragment ProjectWithTeam on Project {
    id
    name
    teamId
    teamName
    __typename
  }
`;

export const RATE_FRAGMENT = gql`
  fragment Rate on Rate {
    id
    name
    rate
    __typename
  }
`;

export const RATE_WITH_TEAM_FRAGMENT = gql`
  fragment RateWithTeam on Rate {
    id
    name
    rate
    teamId
    __typename
  }
`;

export const TIME_ENTRY_FRAGMENT = gql`
  fragment TimeEntry on Time {
    id
    startTime
    endTime
    totalElapsedTime
    __typename
  }
`;

export const LABEL_FRAGMENT = gql`
  fragment Label on Label {
    id
    name
    color
    parentId
    __typename
  }
`;

export const ISSUE_FRAGMENT = gql`
  fragment Issue on Issue {
    id
    createdAt
    updatedAt
    title
    dueDate
    projectId
    priorityLabel
    identifier
    assigneeName
    projectName
    state
    teamKey
    teamName
    labels {
      ...Label
    }
    __typename
  }
  ${LABEL_FRAGMENT}
`;

export const INVOICE_RATE_DETAIL_FRAGMENT = gql`
  fragment InvoiceRateDetail on RateDetail {
    rateId
    rateName
    hours
    cost
    ratePerHour
    __typename
  }
`;

export const INVOICE_DATA_FRAGMENT = gql`
  fragment InvoiceData on Invoice {
    projectId
    projectName
    teamId
    teamName
    totalHours
    totalCost
    rates {
      ...InvoiceRateDetail
    }
    __typename
  }
  ${INVOICE_RATE_DETAIL_FRAGMENT}
`;

export const SYNC_RESULT_FRAGMENT = gql`
  fragment SyncResult on SyncResponse {
    status
    message
    timestamp
  }
`;

export const LOGOUT_RESULT_FRAGMENT = gql`
  fragment LogoutResult on LogoutResponse {
    success
  }
`;

export const AUTH_PAYLOAD_FRAGMENT = gql`
  fragment AuthPayload on AuthResponse {
    access_token
    user {
      ...AuthUser
    }
  }
  ${AUTH_USER_FRAGMENT}
`;

// Composite fragments
export const USER_WITH_TEAMS_FRAGMENT = gql`
  fragment UserWithTeams on User {
    ...BasicUser
    teams {
      ...Team
    }
  }
  ${BASIC_USER_FRAGMENT}
  ${TEAM_FRAGMENT}
`;

export const USER_PROJECTS_FRAGMENT = gql`
  fragment UserProjects on User {
    id
    teams {
      name
      projects {
        ...Project
      }
    }
  }
  ${PROJECT_FRAGMENT}
`;

// Shared queries to eliminate duplicates
export const GET_ALL_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams {
    getAllSimpleTeams {
      ...SimpleTeam
    }
  }
  ${SIMPLE_TEAM_FRAGMENT}
`;

export const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    myProjects {
      ...ProjectWithTeam
    }
  }
  ${PROJECT_WITH_TEAM_FRAGMENT}
`;

export const GET_ISSUES = gql`
  query GetIssues {
    issues {
      ...Issue
    }
  }
  ${ISSUE_FRAGMENT}
`;