import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: SignInInput!) {
    login(input: $input) {
      access_token
      user {
        id
        email
        role
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signup(input: $input) {
      access_token
      user {
        id
        email
        role
      }
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

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export const SYNC_DATABASE_MUTATION = gql`
  mutation SyncDatabase {
    synchronizeDatabase {
      status
      message
      timestamp
    }
  }
`;
