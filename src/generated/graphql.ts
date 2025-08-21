import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  user?: Maybe<UserProfileDto>;
};

export type CreateTeamInput = {
  /** Unique team identifier (3-50 characters, alphanumeric, hyphens, underscores) */
  id: Scalars['String']['input'];
  /** Team display name (2-100 characters) */
  name: Scalars['String']['input'];
};

export type DeleteRateInput = {
  rateId: Scalars['Int']['input'];
};

export type DeleteRateResponse = {
  __typename?: 'DeleteRateResponse';
  id: Scalars['Int']['output'];
};

export type DeleteTimeInput = {
  id: Scalars['Int']['input'];
};

export type GetTeamInput = {
  /** Team ID to retrieve */
  id: Scalars['String']['input'];
};

export type Invoice = {
  __typename?: 'Invoice';
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  rates?: Maybe<Array<RateDetail>>;
  teamId: Scalars['String']['output'];
  teamName: Scalars['String']['output'];
  /** Total cost in Danish Krona (DKK) */
  totalCost: Scalars['Float']['output'];
  totalHours: Scalars['Float']['output'];
};

export type InvoiceInput = {
  /** End date for invoice period */
  endDate: Scalars['DateTime']['input'];
  /** Project id for invoice */
  projectId: Scalars['String']['input'];
  /** Start date for invoice period */
  startDate: Scalars['DateTime']['input'];
};

export type Issue = {
  __typename?: 'Issue';
  assigneeName: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  labels?: Maybe<Array<Maybe<Label>>>;
  priorityLabel: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  state: Scalars['String']['output'];
  teamKey: Scalars['String']['output'];
  teamName: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Label = {
  __typename?: 'Label';
  color: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
};

export type LogoutResponse = {
  __typename?: 'LogoutResponse';
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addUserToTeam: User;
  createRate: Rate;
  createTeam: Team;
  createTime: Time;
  deleteRate: DeleteRateResponse;
  deleteTime: Time;
  login: AuthResponse;
  logout: LogoutResponse;
  refreshToken: RefreshTokenResponse;
  removeUserFromTeam: User;
  signup: AuthResponse;
  synchronizeDatabase: SyncResponse;
  updateTime: Time;
  updateUserRole: User;
};


export type MutationAddUserToTeamArgs = {
  input: UserTeamInput;
};


export type MutationCreateRateArgs = {
  rateInputCreate: RateInputCreate;
};


export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
};


export type MutationCreateTimeArgs = {
  timeInputCreate: TimeInputCreate;
};


export type MutationDeleteRateArgs = {
  input: DeleteRateInput;
};


export type MutationDeleteTimeArgs = {
  input: DeleteTimeInput;
};


export type MutationLoginArgs = {
  input: SignInInput;
};


export type MutationRemoveUserFromTeamArgs = {
  input: UserTeamInput;
};


export type MutationSignupArgs = {
  input: SignUpInput;
};


export type MutationUpdateTimeArgs = {
  timeInputUpdate: TimeInputUpdate;
};


export type MutationUpdateUserRoleArgs = {
  input: UpdateUserRoleInput;
};

export type PaginatedIssueResponse = {
  __typename?: 'PaginatedIssueResponse';
  hasNext: Scalars['Boolean']['output'];
  issues: Array<Issue>;
  total: Scalars['Int']['output'];
};

export type Project = {
  __typename?: 'Project';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedTime?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['String']['output']>;
  state: Scalars['String']['output'];
  targetDate?: Maybe<Scalars['String']['output']>;
  teamId: Scalars['String']['output'];
  teamName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllSimpleTeams: Array<SimpleTeamDto>;
  getTeam: Team;
  getTotalTimeForUserProject: Scalars['Float']['output'];
  getTotalTimeSpent: Scalars['Float']['output'];
  invoiceForProject: Invoice;
  issues: PaginatedIssueResponse;
  me: UserProfileDto;
  myProjects: Array<Project>;
  project: Project;
  projectCount: Scalars['Int']['output'];
  projectCountByTeam: Scalars['Int']['output'];
  projects: Array<Project>;
  projectsByTeam: Array<Project>;
  rates: Array<Rate>;
  times: Array<Time>;
  users: Array<User>;
  usersCount: Scalars['Int']['output'];
};


export type QueryGetTeamArgs = {
  input: GetTeamInput;
};


export type QueryGetTotalTimeForUserProjectArgs = {
  projectId: Scalars['String']['input'];
  userId: Scalars['Float']['input'];
};


export type QueryGetTotalTimeSpentArgs = {
  endDate: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
  userId: Scalars['Float']['input'];
};


export type QueryInvoiceForProjectArgs = {
  input: InvoiceInput;
};


export type QueryIssuesArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['String']['input'];
};


export type QueryProjectCountByTeamArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryProjectsByTeamArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryRatesArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryTimesArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  args: UserQueryArgs;
};


export type QueryUsersCountArgs = {
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type Rate = {
  __typename?: 'Rate';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  /** Hourly rate in Danish Krona (DKK) - e.g., 50.00 for 50.00 DKK/hour */
  rate: Scalars['Float']['output'];
  teamId: Scalars['String']['output'];
};

export type RateDetail = {
  __typename?: 'RateDetail';
  /** Cost in Danish Krona (DKK) for this rate */
  cost: Scalars['Float']['output'];
  hours: Scalars['Float']['output'];
  rateId: Scalars['Int']['output'];
  rateName: Scalars['String']['output'];
  /** Rate per hour in Danish Krona (DKK) */
  ratePerHour: Scalars['Float']['output'];
};

export type RateInputCreate = {
  /** Rate name */
  name: Scalars['String']['input'];
  /** Hourly rate in Danish Krona (DKK) - e.g., 50.00 for 50.00 DKK/hour */
  rate: Scalars['Float']['input'];
  /** Rates team id */
  teamId: Scalars['String']['input'];
};

export type RefreshTokenResponse = {
  __typename?: 'RefreshTokenResponse';
  accessToken: Scalars['String']['output'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SimpleTeamDto = {
  __typename?: 'SimpleTeamDTO';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type SyncResponse = {
  __typename?: 'SyncResponse';
  message: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export type Team = {
  __typename?: 'Team';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  projects?: Maybe<Array<Project>>;
  rates?: Maybe<Array<Rate>>;
};

export type Time = {
  __typename?: 'Time';
  endTime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  projectId: Scalars['String']['output'];
  rateId?: Maybe<Scalars['Int']['output']>;
  startTime: Scalars['DateTime']['output'];
  totalElapsedTime: Scalars['Int']['output'];
  userId: Scalars['Int']['output'];
};

export type TimeInputCreate = {
  /** End time */
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  /** Project ID */
  projectId: Scalars['String']['input'];
  /** Rate ID */
  rateId: Scalars['Int']['input'];
  /** Start time */
  startTime: Scalars['DateTime']['input'];
  /** Total Elapsed Time */
  totalElapsedTime: Scalars['Int']['input'];
  /** User ID */
  userId: Scalars['Int']['input'];
};

export type TimeInputUpdate = {
  /** End time */
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  /** Time entry ID */
  id: Scalars['Int']['input'];
  /** Total Elapsed Time */
  totalElapsedTime: Scalars['Int']['input'];
};

export type UpdateUserRoleInput = {
  newRole: UserRole;
  userId: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  role: UserRole;
  teams: Array<Team>;
};

export type UserProfileDto = {
  __typename?: 'UserProfileDto';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  role: UserRole;
};

export type UserQueryArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Defines the roles a user can have */
export enum UserRole {
  Admin = 'ADMIN',
  Collaborator = 'COLLABORATOR',
  Enabler = 'ENABLER',
  Pending = 'PENDING'
}

export type UserTeamInput = {
  teamId: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export type CreateRate_RatesManagerMutationVariables = Exact<{
  name: Scalars['String']['input'];
  rate: Scalars['Float']['input'];
  teamId: Scalars['String']['input'];
}>;


export type CreateRate_RatesManagerMutation = { __typename?: 'Mutation', createRate: { __typename: 'Rate', id: number, name: string, rate: number, teamId: string } };

export type DeleteRate_RatesManagerMutationVariables = Exact<{
  input: DeleteRateInput;
}>;


export type DeleteRate_RatesManagerMutation = { __typename?: 'Mutation', deleteRate: { __typename?: 'DeleteRateResponse', id: number } };

export type GetRates_RatesManagerQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type GetRates_RatesManagerQuery = { __typename?: 'Query', rates: Array<{ __typename: 'Rate', id: number, name: string, rate: number }> };

export type UserRowDataFragment = { __typename: 'User', id: number, email: string, role: UserRole, teams: Array<{ __typename: 'Team', id: string, name: string }> };

export type GetProjectsForInvoiceSelectorQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsForInvoiceSelectorQuery = { __typename?: 'Query', projects: Array<{ __typename: 'Project', id: string, name: string, teamId: string, teamName?: string | null }> };

export type InvoiceForProjectQueryVariables = Exact<{
  input: InvoiceInput;
}>;


export type InvoiceForProjectQuery = { __typename?: 'Query', invoiceForProject: { __typename: 'Invoice', projectId: string, projectName: string, teamId: string, teamName: string, totalHours: number, totalCost: number, rates?: Array<{ __typename: 'RateDetail', rateId: number, rateName: string, hours: number, cost: number, ratePerHour: number }> | null } };

export type GetTotalTimeSpentQueryVariables = Exact<{
  userId: Scalars['Float']['input'];
  projectId: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type GetTotalTimeSpentQuery = { __typename?: 'Query', getTotalTimeSpent: number };

export type GetUsersQueryVariables = Exact<{
  args: UserQueryArgs;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename: 'User', id: number, email: string, role: UserRole, teams: Array<{ __typename: 'Team', id: string, name: string }> }> };

export type UpdateUserRoleMutationVariables = Exact<{
  input: UpdateUserRoleInput;
}>;


export type UpdateUserRoleMutation = { __typename?: 'Mutation', updateUserRole: { __typename: 'User', id: number, email: string, role: UserRole } };

export type AddUserToTeamMutationVariables = Exact<{
  input: UserTeamInput;
}>;


export type AddUserToTeamMutation = { __typename?: 'Mutation', addUserToTeam: { __typename: 'User', id: number, email: string, role: UserRole, teams: Array<{ __typename: 'Team', id: string, name: string }> } };

export type RemoveUserFromTeamMutationVariables = Exact<{
  input: UserTeamInput;
}>;


export type RemoveUserFromTeamMutation = { __typename?: 'Mutation', removeUserFromTeam: { __typename: 'User', id: number, email: string, role: UserRole, teams: Array<{ __typename: 'Team', id: string, name: string }> } };

export type LoginMutationVariables = Exact<{
  input: SignInInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', accessToken: string, user?: { __typename?: 'UserProfileDto', id: number, email: string, role: UserRole } | null } };

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signup: { __typename?: 'AuthResponse', accessToken: string, user?: { __typename?: 'UserProfileDto', id: number, email: string, role: UserRole } | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'UserProfileDto', id: number, email: string, role: UserRole } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: { __typename?: 'LogoutResponse', success: boolean } };

export type SyncDatabaseMutationVariables = Exact<{ [key: string]: never; }>;


export type SyncDatabaseMutation = { __typename?: 'Mutation', synchronizeDatabase: { __typename?: 'SyncResponse', status: string, message: string, timestamp: string } };

export type BasicUserFragment = { __typename: 'User', id: number, email: string, role: UserRole };

export type AuthUserFragment = { __typename?: 'UserProfileDto', id: number, email: string, role: UserRole };

export type SimpleTeamFragment = { __typename: 'SimpleTeamDTO', id: string, name: string };

export type TeamFragment = { __typename: 'Team', id: string, name: string };

export type ProjectFragment = { __typename: 'Project', id: string, name: string, teamId: string };

export type ProjectWithTeamFragment = { __typename: 'Project', id: string, name: string, teamId: string, teamName?: string | null };

export type RateFragment = { __typename: 'Rate', id: number, name: string, rate: number };

export type RateWithTeamFragment = { __typename: 'Rate', id: number, name: string, rate: number, teamId: string };

export type TimeEntryFragment = { __typename: 'Time', id: number, startTime: any, endTime?: any | null, totalElapsedTime: number };

export type LabelFragment = { __typename: 'Label', id: string, name: string, color: string, parentId?: string | null };

export type IssueFragment = { __typename: 'Issue', id: string, createdAt: string, updatedAt: string, title: string, dueDate?: string | null, projectId: string, priorityLabel: string, identifier: string, assigneeName: string, projectName: string, state: string, teamKey: string, teamName: string, labels?: Array<{ __typename: 'Label', id: string, name: string, color: string, parentId?: string | null } | null> | null };

export type InvoiceRateDetailFragment = { __typename: 'RateDetail', rateId: number, rateName: string, hours: number, cost: number, ratePerHour: number };

export type InvoiceDataFragment = { __typename: 'Invoice', projectId: string, projectName: string, teamId: string, teamName: string, totalHours: number, totalCost: number, rates?: Array<{ __typename: 'RateDetail', rateId: number, rateName: string, hours: number, cost: number, ratePerHour: number }> | null };

export type SyncResultFragment = { __typename?: 'SyncResponse', status: string, message: string, timestamp: string };

export type LogoutResultFragment = { __typename?: 'LogoutResponse', success: boolean };

export type AuthPayloadFragment = { __typename?: 'AuthResponse', accessToken: string, user?: { __typename?: 'UserProfileDto', id: number, email: string, role: UserRole } | null };

export type UserWithTeamsFragment = { __typename: 'User', id: number, email: string, role: UserRole, teams: Array<{ __typename: 'Team', id: string, name: string }> };

export type GetAllSimpleTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllSimpleTeamsQuery = { __typename?: 'Query', getAllSimpleTeams: Array<{ __typename: 'SimpleTeamDTO', id: string, name: string }> };

export type GetMyProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyProjectsQuery = { __typename?: 'Query', myProjects: Array<{ __typename: 'Project', id: string, name: string, teamId: string, teamName?: string | null }> };

export type GetIssuesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIssuesQuery = { __typename?: 'Query', issues: { __typename?: 'PaginatedIssueResponse', total: number, hasNext: boolean, issues: Array<{ __typename: 'Issue', id: string, createdAt: string, updatedAt: string, title: string, dueDate?: string | null, projectId: string, priorityLabel: string, identifier: string, assigneeName: string, projectName: string, state: string, teamKey: string, teamName: string, labels?: Array<{ __typename: 'Label', id: string, name: string, color: string, parentId?: string | null } | null> | null }> } };

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename: 'Project', id: string, name: string, teamId: string }> };

export type GetRatesQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type GetRatesQuery = { __typename?: 'Query', rates: Array<{ __typename: 'Rate', id: number, name: string, rate: number }> };

export type GetTotalTimeForUserProjectQueryVariables = Exact<{
  userId: Scalars['Float']['input'];
  projectId: Scalars['String']['input'];
}>;


export type GetTotalTimeForUserProjectQuery = { __typename?: 'Query', getTotalTimeForUserProject: number };

export type CreateTimeMutationVariables = Exact<{
  timeInputCreate: TimeInputCreate;
}>;


export type CreateTimeMutation = { __typename?: 'Mutation', createTime: { __typename: 'Time', id: number, startTime: any, endTime?: any | null, totalElapsedTime: number } };

export type UpdateTimeMutationVariables = Exact<{
  timeInputUpdate: TimeInputUpdate;
}>;


export type UpdateTimeMutation = { __typename?: 'Mutation', updateTime: { __typename: 'Time', id: number, startTime: any, endTime?: any | null, totalElapsedTime: number } };

export type GetManagementUsersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
}>;


export type GetManagementUsersQuery = { __typename?: 'Query', users: Array<{ __typename: 'User', id: number, email: string, role: UserRole, teams: Array<{ __typename: 'Team', id: string, name: string }> }> };

export type GetUsersManagementCountQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
}>;


export type GetUsersManagementCountQuery = { __typename?: 'Query', usersCount: number };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'RefreshTokenResponse', accessToken: string } };

export const UserRowDataFragmentDoc = gql`
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
export const SimpleTeamFragmentDoc = gql`
    fragment SimpleTeam on SimpleTeamDTO {
  id
  name
  __typename
}
    `;
export const ProjectFragmentDoc = gql`
    fragment Project on Project {
  id
  name
  teamId
  __typename
}
    `;
export const ProjectWithTeamFragmentDoc = gql`
    fragment ProjectWithTeam on Project {
  id
  name
  teamId
  teamName
  __typename
}
    `;
export const RateFragmentDoc = gql`
    fragment Rate on Rate {
  id
  name
  rate
  __typename
}
    `;
export const RateWithTeamFragmentDoc = gql`
    fragment RateWithTeam on Rate {
  id
  name
  rate
  teamId
  __typename
}
    `;
export const TimeEntryFragmentDoc = gql`
    fragment TimeEntry on Time {
  id
  startTime
  endTime
  totalElapsedTime
  __typename
}
    `;
export const LabelFragmentDoc = gql`
    fragment Label on Label {
  id
  name
  color
  parentId
  __typename
}
    `;
export const IssueFragmentDoc = gql`
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
    ${LabelFragmentDoc}`;
export const InvoiceRateDetailFragmentDoc = gql`
    fragment InvoiceRateDetail on RateDetail {
  rateId
  rateName
  hours
  cost
  ratePerHour
  __typename
}
    `;
export const InvoiceDataFragmentDoc = gql`
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
    ${InvoiceRateDetailFragmentDoc}`;
export const SyncResultFragmentDoc = gql`
    fragment SyncResult on SyncResponse {
  status
  message
  timestamp
}
    `;
export const LogoutResultFragmentDoc = gql`
    fragment LogoutResult on LogoutResponse {
  success
}
    `;
export const AuthUserFragmentDoc = gql`
    fragment AuthUser on UserProfileDto {
  id
  email
  role
}
    `;
export const AuthPayloadFragmentDoc = gql`
    fragment AuthPayload on AuthResponse {
  accessToken
  user {
    ...AuthUser
  }
}
    ${AuthUserFragmentDoc}`;
export const BasicUserFragmentDoc = gql`
    fragment BasicUser on User {
  id
  email
  role
  __typename
}
    `;
export const TeamFragmentDoc = gql`
    fragment Team on Team {
  id
  name
  __typename
}
    `;
export const UserWithTeamsFragmentDoc = gql`
    fragment UserWithTeams on User {
  ...BasicUser
  teams {
    ...Team
  }
}
    ${BasicUserFragmentDoc}
${TeamFragmentDoc}`;
export const CreateRate_RatesManagerDocument = gql`
    mutation CreateRate_RatesManager($name: String!, $rate: Float!, $teamId: String!) {
  createRate(rateInputCreate: {name: $name, rate: $rate, teamId: $teamId}) {
    ...RateWithTeam
  }
}
    ${RateWithTeamFragmentDoc}`;
export type CreateRate_RatesManagerMutationFn = Apollo.MutationFunction<CreateRate_RatesManagerMutation, CreateRate_RatesManagerMutationVariables>;
export function useCreateRate_RatesManagerMutation(baseOptions?: Apollo.MutationHookOptions<CreateRate_RatesManagerMutation, CreateRate_RatesManagerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRate_RatesManagerMutation, CreateRate_RatesManagerMutationVariables>(CreateRate_RatesManagerDocument, options);
      }
export type CreateRate_RatesManagerMutationHookResult = ReturnType<typeof useCreateRate_RatesManagerMutation>;
export type CreateRate_RatesManagerMutationResult = Apollo.MutationResult<CreateRate_RatesManagerMutation>;
export type CreateRate_RatesManagerMutationOptions = Apollo.BaseMutationOptions<CreateRate_RatesManagerMutation, CreateRate_RatesManagerMutationVariables>;
export const DeleteRate_RatesManagerDocument = gql`
    mutation DeleteRate_RatesManager($input: DeleteRateInput!) {
  deleteRate(input: $input) {
    id
  }
}
    `;
export type DeleteRate_RatesManagerMutationFn = Apollo.MutationFunction<DeleteRate_RatesManagerMutation, DeleteRate_RatesManagerMutationVariables>;
export function useDeleteRate_RatesManagerMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRate_RatesManagerMutation, DeleteRate_RatesManagerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRate_RatesManagerMutation, DeleteRate_RatesManagerMutationVariables>(DeleteRate_RatesManagerDocument, options);
      }
export type DeleteRate_RatesManagerMutationHookResult = ReturnType<typeof useDeleteRate_RatesManagerMutation>;
export type DeleteRate_RatesManagerMutationResult = Apollo.MutationResult<DeleteRate_RatesManagerMutation>;
export type DeleteRate_RatesManagerMutationOptions = Apollo.BaseMutationOptions<DeleteRate_RatesManagerMutation, DeleteRate_RatesManagerMutationVariables>;
export const GetRates_RatesManagerDocument = gql`
    query GetRates_RatesManager($teamId: String!) {
  rates(teamId: $teamId) {
    ...Rate
  }
}
    ${RateFragmentDoc}`;
export function useGetRates_RatesManagerQuery(baseOptions: Apollo.QueryHookOptions<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables> & ({ variables: GetRates_RatesManagerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables>(GetRates_RatesManagerDocument, options);
      }
export function useGetRates_RatesManagerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables>(GetRates_RatesManagerDocument, options);
        }
export function useGetRates_RatesManagerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables>(GetRates_RatesManagerDocument, options);
        }
export type GetRates_RatesManagerQueryHookResult = ReturnType<typeof useGetRates_RatesManagerQuery>;
export type GetRates_RatesManagerLazyQueryHookResult = ReturnType<typeof useGetRates_RatesManagerLazyQuery>;
export type GetRates_RatesManagerSuspenseQueryHookResult = ReturnType<typeof useGetRates_RatesManagerSuspenseQuery>;
export type GetRates_RatesManagerQueryResult = Apollo.QueryResult<GetRates_RatesManagerQuery, GetRates_RatesManagerQueryVariables>;
export const GetProjectsForInvoiceSelectorDocument = gql`
    query GetProjectsForInvoiceSelector {
  projects {
    ...ProjectWithTeam
  }
}
    ${ProjectWithTeamFragmentDoc}`;
export function useGetProjectsForInvoiceSelectorQuery(baseOptions?: Apollo.QueryHookOptions<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>(GetProjectsForInvoiceSelectorDocument, options);
      }
export function useGetProjectsForInvoiceSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>(GetProjectsForInvoiceSelectorDocument, options);
        }
export function useGetProjectsForInvoiceSelectorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>(GetProjectsForInvoiceSelectorDocument, options);
        }
export type GetProjectsForInvoiceSelectorQueryHookResult = ReturnType<typeof useGetProjectsForInvoiceSelectorQuery>;
export type GetProjectsForInvoiceSelectorLazyQueryHookResult = ReturnType<typeof useGetProjectsForInvoiceSelectorLazyQuery>;
export type GetProjectsForInvoiceSelectorSuspenseQueryHookResult = ReturnType<typeof useGetProjectsForInvoiceSelectorSuspenseQuery>;
export type GetProjectsForInvoiceSelectorQueryResult = Apollo.QueryResult<GetProjectsForInvoiceSelectorQuery, GetProjectsForInvoiceSelectorQueryVariables>;
export const InvoiceForProjectDocument = gql`
    query InvoiceForProject($input: InvoiceInput!) {
  invoiceForProject(input: $input) {
    ...InvoiceData
  }
}
    ${InvoiceDataFragmentDoc}`;
export function useInvoiceForProjectQuery(baseOptions: Apollo.QueryHookOptions<InvoiceForProjectQuery, InvoiceForProjectQueryVariables> & ({ variables: InvoiceForProjectQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InvoiceForProjectQuery, InvoiceForProjectQueryVariables>(InvoiceForProjectDocument, options);
      }
export function useInvoiceForProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InvoiceForProjectQuery, InvoiceForProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InvoiceForProjectQuery, InvoiceForProjectQueryVariables>(InvoiceForProjectDocument, options);
        }
export function useInvoiceForProjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InvoiceForProjectQuery, InvoiceForProjectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InvoiceForProjectQuery, InvoiceForProjectQueryVariables>(InvoiceForProjectDocument, options);
        }
export type InvoiceForProjectQueryHookResult = ReturnType<typeof useInvoiceForProjectQuery>;
export type InvoiceForProjectLazyQueryHookResult = ReturnType<typeof useInvoiceForProjectLazyQuery>;
export type InvoiceForProjectSuspenseQueryHookResult = ReturnType<typeof useInvoiceForProjectSuspenseQuery>;
export type InvoiceForProjectQueryResult = Apollo.QueryResult<InvoiceForProjectQuery, InvoiceForProjectQueryVariables>;
export const GetTotalTimeSpentDocument = gql`
    query GetTotalTimeSpent($userId: Float!, $projectId: String!, $startDate: String!, $endDate: String!) {
  getTotalTimeSpent(
    userId: $userId
    projectId: $projectId
    startDate: $startDate
    endDate: $endDate
  )
}
    `;
export function useGetTotalTimeSpentQuery(baseOptions: Apollo.QueryHookOptions<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables> & ({ variables: GetTotalTimeSpentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables>(GetTotalTimeSpentDocument, options);
      }
export function useGetTotalTimeSpentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables>(GetTotalTimeSpentDocument, options);
        }
export function useGetTotalTimeSpentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables>(GetTotalTimeSpentDocument, options);
        }
export type GetTotalTimeSpentQueryHookResult = ReturnType<typeof useGetTotalTimeSpentQuery>;
export type GetTotalTimeSpentLazyQueryHookResult = ReturnType<typeof useGetTotalTimeSpentLazyQuery>;
export type GetTotalTimeSpentSuspenseQueryHookResult = ReturnType<typeof useGetTotalTimeSpentSuspenseQuery>;
export type GetTotalTimeSpentQueryResult = Apollo.QueryResult<GetTotalTimeSpentQuery, GetTotalTimeSpentQueryVariables>;
export const GetUsersDocument = gql`
    query GetUsers($args: UserQueryArgs!) {
  users(args: $args) {
    ...UserWithTeams
  }
}
    ${UserWithTeamsFragmentDoc}`;
export function useGetUsersQuery(baseOptions: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables> & ({ variables: GetUsersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const UpdateUserRoleDocument = gql`
    mutation UpdateUserRole($input: UpdateUserRoleInput!) {
  updateUserRole(input: $input) {
    ...BasicUser
  }
}
    ${BasicUserFragmentDoc}`;
export type UpdateUserRoleMutationFn = Apollo.MutationFunction<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export function useUpdateUserRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>(UpdateUserRoleDocument, options);
      }
export type UpdateUserRoleMutationHookResult = ReturnType<typeof useUpdateUserRoleMutation>;
export type UpdateUserRoleMutationResult = Apollo.MutationResult<UpdateUserRoleMutation>;
export type UpdateUserRoleMutationOptions = Apollo.BaseMutationOptions<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export const AddUserToTeamDocument = gql`
    mutation AddUserToTeam($input: UserTeamInput!) {
  addUserToTeam(input: $input) {
    ...UserWithTeams
  }
}
    ${UserWithTeamsFragmentDoc}`;
export type AddUserToTeamMutationFn = Apollo.MutationFunction<AddUserToTeamMutation, AddUserToTeamMutationVariables>;
export function useAddUserToTeamMutation(baseOptions?: Apollo.MutationHookOptions<AddUserToTeamMutation, AddUserToTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddUserToTeamMutation, AddUserToTeamMutationVariables>(AddUserToTeamDocument, options);
      }
export type AddUserToTeamMutationHookResult = ReturnType<typeof useAddUserToTeamMutation>;
export type AddUserToTeamMutationResult = Apollo.MutationResult<AddUserToTeamMutation>;
export type AddUserToTeamMutationOptions = Apollo.BaseMutationOptions<AddUserToTeamMutation, AddUserToTeamMutationVariables>;
export const RemoveUserFromTeamDocument = gql`
    mutation RemoveUserFromTeam($input: UserTeamInput!) {
  removeUserFromTeam(input: $input) {
    ...UserWithTeams
  }
}
    ${UserWithTeamsFragmentDoc}`;
export type RemoveUserFromTeamMutationFn = Apollo.MutationFunction<RemoveUserFromTeamMutation, RemoveUserFromTeamMutationVariables>;
export function useRemoveUserFromTeamMutation(baseOptions?: Apollo.MutationHookOptions<RemoveUserFromTeamMutation, RemoveUserFromTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveUserFromTeamMutation, RemoveUserFromTeamMutationVariables>(RemoveUserFromTeamDocument, options);
      }
export type RemoveUserFromTeamMutationHookResult = ReturnType<typeof useRemoveUserFromTeamMutation>;
export type RemoveUserFromTeamMutationResult = Apollo.MutationResult<RemoveUserFromTeamMutation>;
export type RemoveUserFromTeamMutationOptions = Apollo.BaseMutationOptions<RemoveUserFromTeamMutation, RemoveUserFromTeamMutationVariables>;
export const LoginDocument = gql`
    mutation Login($input: SignInInput!) {
  login(input: $input) {
    ...AuthPayload
  }
}
    ${AuthPayloadFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const SignUpDocument = gql`
    mutation SignUp($input: SignUpInput!) {
  signup(input: $input) {
    ...AuthPayload
  }
}
    ${AuthPayloadFragmentDoc}`;
export type SignUpMutationFn = Apollo.MutationFunction<SignUpMutation, SignUpMutationVariables>;
export function useSignUpMutation(baseOptions?: Apollo.MutationHookOptions<SignUpMutation, SignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument, options);
      }
export type SignUpMutationHookResult = ReturnType<typeof useSignUpMutation>;
export type SignUpMutationResult = Apollo.MutationResult<SignUpMutation>;
export type SignUpMutationOptions = Apollo.BaseMutationOptions<SignUpMutation, SignUpMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    ...AuthUser
  }
}
    ${AuthUserFragmentDoc}`;
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout {
    ...LogoutResult
  }
}
    ${LogoutResultFragmentDoc}`;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const SyncDatabaseDocument = gql`
    mutation SyncDatabase {
  synchronizeDatabase {
    ...SyncResult
  }
}
    ${SyncResultFragmentDoc}`;
export type SyncDatabaseMutationFn = Apollo.MutationFunction<SyncDatabaseMutation, SyncDatabaseMutationVariables>;
export function useSyncDatabaseMutation(baseOptions?: Apollo.MutationHookOptions<SyncDatabaseMutation, SyncDatabaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SyncDatabaseMutation, SyncDatabaseMutationVariables>(SyncDatabaseDocument, options);
      }
export type SyncDatabaseMutationHookResult = ReturnType<typeof useSyncDatabaseMutation>;
export type SyncDatabaseMutationResult = Apollo.MutationResult<SyncDatabaseMutation>;
export type SyncDatabaseMutationOptions = Apollo.BaseMutationOptions<SyncDatabaseMutation, SyncDatabaseMutationVariables>;
export const GetAllSimpleTeamsDocument = gql`
    query GetAllSimpleTeams {
  getAllSimpleTeams {
    ...SimpleTeam
  }
}
    ${SimpleTeamFragmentDoc}`;
export function useGetAllSimpleTeamsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>(GetAllSimpleTeamsDocument, options);
      }
export function useGetAllSimpleTeamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>(GetAllSimpleTeamsDocument, options);
        }
export function useGetAllSimpleTeamsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>(GetAllSimpleTeamsDocument, options);
        }
export type GetAllSimpleTeamsQueryHookResult = ReturnType<typeof useGetAllSimpleTeamsQuery>;
export type GetAllSimpleTeamsLazyQueryHookResult = ReturnType<typeof useGetAllSimpleTeamsLazyQuery>;
export type GetAllSimpleTeamsSuspenseQueryHookResult = ReturnType<typeof useGetAllSimpleTeamsSuspenseQuery>;
export type GetAllSimpleTeamsQueryResult = Apollo.QueryResult<GetAllSimpleTeamsQuery, GetAllSimpleTeamsQueryVariables>;
export const GetMyProjectsDocument = gql`
    query GetMyProjects {
  myProjects {
    ...ProjectWithTeam
  }
}
    ${ProjectWithTeamFragmentDoc}`;
export function useGetMyProjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetMyProjectsQuery, GetMyProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMyProjectsQuery, GetMyProjectsQueryVariables>(GetMyProjectsDocument, options);
      }
export function useGetMyProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMyProjectsQuery, GetMyProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMyProjectsQuery, GetMyProjectsQueryVariables>(GetMyProjectsDocument, options);
        }
export function useGetMyProjectsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMyProjectsQuery, GetMyProjectsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMyProjectsQuery, GetMyProjectsQueryVariables>(GetMyProjectsDocument, options);
        }
export type GetMyProjectsQueryHookResult = ReturnType<typeof useGetMyProjectsQuery>;
export type GetMyProjectsLazyQueryHookResult = ReturnType<typeof useGetMyProjectsLazyQuery>;
export type GetMyProjectsSuspenseQueryHookResult = ReturnType<typeof useGetMyProjectsSuspenseQuery>;
export type GetMyProjectsQueryResult = Apollo.QueryResult<GetMyProjectsQuery, GetMyProjectsQueryVariables>;
export const GetIssuesDocument = gql`
    query GetIssues {
  issues {
    issues {
      ...Issue
    }
    total
    hasNext
  }
}
    ${IssueFragmentDoc}`;
export function useGetIssuesQuery(baseOptions?: Apollo.QueryHookOptions<GetIssuesQuery, GetIssuesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIssuesQuery, GetIssuesQueryVariables>(GetIssuesDocument, options);
      }
export function useGetIssuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIssuesQuery, GetIssuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIssuesQuery, GetIssuesQueryVariables>(GetIssuesDocument, options);
        }
export function useGetIssuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetIssuesQuery, GetIssuesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetIssuesQuery, GetIssuesQueryVariables>(GetIssuesDocument, options);
        }
export type GetIssuesQueryHookResult = ReturnType<typeof useGetIssuesQuery>;
export type GetIssuesLazyQueryHookResult = ReturnType<typeof useGetIssuesLazyQuery>;
export type GetIssuesSuspenseQueryHookResult = ReturnType<typeof useGetIssuesSuspenseQuery>;
export type GetIssuesQueryResult = Apollo.QueryResult<GetIssuesQuery, GetIssuesQueryVariables>;
export const GetProjectsDocument = gql`
    query GetProjects {
  projects {
    ...Project
  }
}
    ${ProjectFragmentDoc}`;
export function useGetProjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
      }
export function useGetProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export function useGetProjectsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsSuspenseQueryHookResult = ReturnType<typeof useGetProjectsSuspenseQuery>;
export type GetProjectsQueryResult = Apollo.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;
export const GetRatesDocument = gql`
    query GetRates($teamId: String!) {
  rates(teamId: $teamId) {
    ...Rate
  }
}
    ${RateFragmentDoc}`;
export function useGetRatesQuery(baseOptions: Apollo.QueryHookOptions<GetRatesQuery, GetRatesQueryVariables> & ({ variables: GetRatesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRatesQuery, GetRatesQueryVariables>(GetRatesDocument, options);
      }
export function useGetRatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRatesQuery, GetRatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRatesQuery, GetRatesQueryVariables>(GetRatesDocument, options);
        }
export function useGetRatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRatesQuery, GetRatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRatesQuery, GetRatesQueryVariables>(GetRatesDocument, options);
        }
export type GetRatesQueryHookResult = ReturnType<typeof useGetRatesQuery>;
export type GetRatesLazyQueryHookResult = ReturnType<typeof useGetRatesLazyQuery>;
export type GetRatesSuspenseQueryHookResult = ReturnType<typeof useGetRatesSuspenseQuery>;
export type GetRatesQueryResult = Apollo.QueryResult<GetRatesQuery, GetRatesQueryVariables>;
export const GetTotalTimeForUserProjectDocument = gql`
    query GetTotalTimeForUserProject($userId: Float!, $projectId: String!) {
  getTotalTimeForUserProject(userId: $userId, projectId: $projectId)
}
    `;
export function useGetTotalTimeForUserProjectQuery(baseOptions: Apollo.QueryHookOptions<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables> & ({ variables: GetTotalTimeForUserProjectQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables>(GetTotalTimeForUserProjectDocument, options);
      }
export function useGetTotalTimeForUserProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables>(GetTotalTimeForUserProjectDocument, options);
        }
export function useGetTotalTimeForUserProjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables>(GetTotalTimeForUserProjectDocument, options);
        }
export type GetTotalTimeForUserProjectQueryHookResult = ReturnType<typeof useGetTotalTimeForUserProjectQuery>;
export type GetTotalTimeForUserProjectLazyQueryHookResult = ReturnType<typeof useGetTotalTimeForUserProjectLazyQuery>;
export type GetTotalTimeForUserProjectSuspenseQueryHookResult = ReturnType<typeof useGetTotalTimeForUserProjectSuspenseQuery>;
export type GetTotalTimeForUserProjectQueryResult = Apollo.QueryResult<GetTotalTimeForUserProjectQuery, GetTotalTimeForUserProjectQueryVariables>;
export const CreateTimeDocument = gql`
    mutation CreateTime($timeInputCreate: TimeInputCreate!) {
  createTime(timeInputCreate: $timeInputCreate) {
    ...TimeEntry
  }
}
    ${TimeEntryFragmentDoc}`;
export type CreateTimeMutationFn = Apollo.MutationFunction<CreateTimeMutation, CreateTimeMutationVariables>;
export function useCreateTimeMutation(baseOptions?: Apollo.MutationHookOptions<CreateTimeMutation, CreateTimeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTimeMutation, CreateTimeMutationVariables>(CreateTimeDocument, options);
      }
export type CreateTimeMutationHookResult = ReturnType<typeof useCreateTimeMutation>;
export type CreateTimeMutationResult = Apollo.MutationResult<CreateTimeMutation>;
export type CreateTimeMutationOptions = Apollo.BaseMutationOptions<CreateTimeMutation, CreateTimeMutationVariables>;
export const UpdateTimeDocument = gql`
    mutation UpdateTime($timeInputUpdate: TimeInputUpdate!) {
  updateTime(timeInputUpdate: $timeInputUpdate) {
    ...TimeEntry
  }
}
    ${TimeEntryFragmentDoc}`;
export type UpdateTimeMutationFn = Apollo.MutationFunction<UpdateTimeMutation, UpdateTimeMutationVariables>;
export function useUpdateTimeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTimeMutation, UpdateTimeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTimeMutation, UpdateTimeMutationVariables>(UpdateTimeDocument, options);
      }
export type UpdateTimeMutationHookResult = ReturnType<typeof useUpdateTimeMutation>;
export type UpdateTimeMutationResult = Apollo.MutationResult<UpdateTimeMutation>;
export type UpdateTimeMutationOptions = Apollo.BaseMutationOptions<UpdateTimeMutation, UpdateTimeMutationVariables>;
export const GetManagementUsersDocument = gql`
    query GetManagementUsers($page: Int, $pageSize: Int, $search: String, $role: UserRole) {
  users(args: {page: $page, pageSize: $pageSize, search: $search, role: $role}) {
    ...UserWithTeams
  }
}
    ${UserWithTeamsFragmentDoc}`;
export function useGetManagementUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetManagementUsersQuery, GetManagementUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManagementUsersQuery, GetManagementUsersQueryVariables>(GetManagementUsersDocument, options);
      }
export function useGetManagementUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManagementUsersQuery, GetManagementUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManagementUsersQuery, GetManagementUsersQueryVariables>(GetManagementUsersDocument, options);
        }
export function useGetManagementUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManagementUsersQuery, GetManagementUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetManagementUsersQuery, GetManagementUsersQueryVariables>(GetManagementUsersDocument, options);
        }
export type GetManagementUsersQueryHookResult = ReturnType<typeof useGetManagementUsersQuery>;
export type GetManagementUsersLazyQueryHookResult = ReturnType<typeof useGetManagementUsersLazyQuery>;
export type GetManagementUsersSuspenseQueryHookResult = ReturnType<typeof useGetManagementUsersSuspenseQuery>;
export type GetManagementUsersQueryResult = Apollo.QueryResult<GetManagementUsersQuery, GetManagementUsersQueryVariables>;
export const GetUsersManagementCountDocument = gql`
    query GetUsersManagementCount($search: String, $role: UserRole) {
  usersCount(search: $search, role: $role)
}
    `;
export function useGetUsersManagementCountQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>(GetUsersManagementCountDocument, options);
      }
export function useGetUsersManagementCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>(GetUsersManagementCountDocument, options);
        }
export function useGetUsersManagementCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>(GetUsersManagementCountDocument, options);
        }
export type GetUsersManagementCountQueryHookResult = ReturnType<typeof useGetUsersManagementCountQuery>;
export type GetUsersManagementCountLazyQueryHookResult = ReturnType<typeof useGetUsersManagementCountLazyQuery>;
export type GetUsersManagementCountSuspenseQueryHookResult = ReturnType<typeof useGetUsersManagementCountSuspenseQuery>;
export type GetUsersManagementCountQueryResult = Apollo.QueryResult<GetUsersManagementCountQuery, GetUsersManagementCountQueryVariables>;
export const RefreshTokenDocument = gql`
    mutation RefreshToken {
  refreshToken {
    accessToken
  }
}
    `;
export type RefreshTokenMutationFn = Apollo.MutationFunction<RefreshTokenMutation, RefreshTokenMutationVariables>;
export function useRefreshTokenMutation(baseOptions?: Apollo.MutationHookOptions<RefreshTokenMutation, RefreshTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshTokenMutation, RefreshTokenMutationVariables>(RefreshTokenDocument, options);
      }
export type RefreshTokenMutationHookResult = ReturnType<typeof useRefreshTokenMutation>;
export type RefreshTokenMutationResult = Apollo.MutationResult<RefreshTokenMutation>;
export type RefreshTokenMutationOptions = Apollo.BaseMutationOptions<RefreshTokenMutation, RefreshTokenMutationVariables>;