import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: SignInInput!) {
    login(input: $input) {
      access_token
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      id
      email
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
      message
    }
  }
`;
