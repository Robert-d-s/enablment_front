import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
  makeVar,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore, getAccessToken } from "./authStore";
import gql from "graphql-tag";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      access_token
    }
  }
`;

export const loggedInUserTeamsVersion = makeVar(0);

const authLink = setContext((operation, { headers }) => {
  if (operation.operationName === "RefreshToken") {
    return { headers };
  }
  const token = getAccessToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  return {
    headers: {
      ...headers,
      ...authHeaders,
      "content-type": "application/json",
    },
  };
});

let isRefreshing = false;
let pendingRequests: ((newAccessToken: string) => void)[] = [];

const resolvePendingRequests = (newAccessToken: string) => {
  pendingRequests.map((callback) => callback(newAccessToken));
  pendingRequests = [];
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      console.log("ErrorLink: Detected graphQLErrors:", graphQLErrors);
      for (const err of graphQLErrors) {
        console.log("GraphQL Error received:", JSON.stringify(err, null, 2));
        const extensions = err.extensions || {};
        interface OriginalError {
          statusCode?: number;
          message?: string;
        }
        const originalError = extensions.originalError as OriginalError;
        const isAuthError =
          extensions?.code === "UNAUTHORIZED" ||
          originalError?.statusCode === 401 ||
          err.message.toLowerCase().includes("unauthorized") ||
          err.message.toLowerCase().includes("access denied") ||
          err.message.toLowerCase().includes("invalid token") ||
          err.message.toLowerCase().includes("expired token");

        if (isAuthError && operation.operationName !== "RefreshToken") {
          console.log(
            `Auth error on operation '${operation.operationName}'. Initiating refresh.`
          );

          if (!isRefreshing) {
            isRefreshing = true;
            console.log("Starting token refresh via mutation...");

            client
              .mutate<{ refreshToken: { access_token: string } }>({
                mutation: REFRESH_TOKEN_MUTATION,
                context: {
                  credentials: "include",
                },
              })
              .then(({ data }) => {
                const newAccessToken = data?.refreshToken.access_token;
                if (!newAccessToken) {
                  console.error(
                    "Token refresh succeeded but no new access token received."
                  );
                  throw new Error("New access token not received.");
                }
                console.log(
                  "Token refresh successful. New access token obtained."
                );
                useAuthStore.getState().setAccessToken(newAccessToken);
                resolvePendingRequests(newAccessToken);
              })
              .catch((refreshError) => {
                console.error("Token refresh mutation failed:", refreshError);
                useAuthStore.getState().logout();
                pendingRequests = [];
                if (window.location.pathname !== "/login") {
                  window.location.href = "/login";
                }
              })
              .finally(() => {
                isRefreshing = false;
                console.log("Token refresh process finished.");
              });
          }

          return new Observable((observer) => {
            pendingRequests.push((newAccessToken) => {
              console.log(
                `Retrying operation '${operation.operationName}' with new token.`
              );
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              }));
              forward(operation).subscribe(observer);
            });
          });
        }
        if (
          extensions?.code === "FORBIDDEN" ||
          originalError?.statusCode === 403
        ) {
          useAuthStore.getState().setForbidden(true);
        }
      }
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError.message}`, networkError);
    }
  }
);

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`,
  fetchOptions: {
    method: "POST",
  },
  credentials: "include",
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
    query: { fetchPolicy: "network-only", errorPolicy: "all" },
    mutate: { errorPolicy: "all" },
  },
});

export default client;

export const clientLogout = async () => {
  try {
    await client.mutate({
      mutation: gql`
        mutation Logout {
          logout {
            success
          }
        }
      `,
      context: { credentials: "include" },
    });
    console.log("Backend logout mutation successful.");
  } catch (error) {
    console.error("Error calling backend logout mutation:", error);
  } finally {
    useAuthStore.getState().logout();
    await client.resetStore();
    console.log("Frontend state cleared.");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
};
