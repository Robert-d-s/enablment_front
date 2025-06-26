import { gql } from "@apollo/client";
import {
  AUTH_PAYLOAD_FRAGMENT,
  AUTH_USER_FRAGMENT,
  LOGOUT_RESULT_FRAGMENT,
  SYNC_RESULT_FRAGMENT,
} from "./fragments";

export const LOGIN_MUTATION = gql`
  mutation Login($input: SignInInput!) {
    login(input: $input) {
      ...AuthPayload
    }
  }
  ${AUTH_PAYLOAD_FRAGMENT}
`;

export const SIGNUP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signup(input: $input) {
      ...AuthPayload
    }
  }
  ${AUTH_PAYLOAD_FRAGMENT}
`;

export const ME_QUERY = gql`
  query Me {
    me {
      ...AuthUser
    }
  }
  ${AUTH_USER_FRAGMENT}
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      ...LogoutResult
    }
  }
  ${LOGOUT_RESULT_FRAGMENT}
`;

export const SYNC_DATABASE_MUTATION = gql`
  mutation SyncDatabase {
    synchronizeDatabase {
      ...SyncResult
    }
  }
  ${SYNC_RESULT_FRAGMENT}
`;
