import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: SignInInput!) {
    login(input: $input) {
      access_token
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignUpInput!) {
    signup(input: $input) {
      success
      message
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export const SYNC_DATABASE_MUTATION = gql`
  mutation SyncDatabase {
    syncDatabase {
      success
      message
      timestamp
      details {
        teams
        projects
        issues
      }
    }
  }
`;
