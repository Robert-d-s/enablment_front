import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
  makeVar,
  FieldPolicy,
  Reference,
  ApolloLink,
  NextLink,
  Operation,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore, getAccessToken } from "./authStore";
import gql from "graphql-tag";
import { TokenRefreshQueue } from "../utils/tokenRefreshQueue"; // Added import
import { networkMonitor } from "../utils/networkMonitor";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      access_token
    }
  }
`;

export const loggedInUserTeamsVersion = makeVar(0);

// Remove old refresh logic variables
// let isRefreshing = false;
// let refreshPromise: Promise<string | null> | null = null;

let apolloClientInstance: ApolloClient<object> | null = null; // Keep for now, used to initialize queue

// Instantiate the token refresh queue
const tokenRefreshQueue = new TokenRefreshQueue();

// Network monitoring link for debugging
const networkMonitorLink = new ApolloLink(
  (operation: Operation, forward: NextLink) => {
    const operationName = operation.operationName;
    const operationType =
      operation.query.definitions[0]?.kind === "OperationDefinition"
        ? operation.query.definitions[0].operation
        : "unknown";

    if (operationName) {
      networkMonitor.logRequest({
        operationName,
        type: operationType as "query" | "mutation" | "subscription",
        timestamp: Date.now(),
        variables: operation.variables,
        fetchPolicy: operation.getContext().fetchPolicy,
      });
    }

    return forward(operation);
  }
);

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

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`,
  fetchOptions: { method: "POST" },
  credentials: "include",
});

// Remove old triggerRefreshToken function
// const triggerRefreshToken = (): Promise<string | null> => { ... };

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const extensions = err.extensions || {};
        const originalError = extensions.originalError as
          | { statusCode?: number }
          | undefined;

        const isAuthError =
          (extensions?.code === "UNAUTHENTICATED" ||
            extensions?.code === "TOKEN_EXPIRED" ||
            extensions?.code === "UNAUTHORIZED" ||
            extensions?.httpStatus === 401 ||
            originalError?.statusCode === 401) &&
          operation.operationName !== "RefreshToken"; // Ensure not to loop on refresh mutation itself

        if (isAuthError) {
          console.log(
            "Auth error detected by errorLink, attempting refresh via queue."
          );
          return new Observable((observer) => {
            tokenRefreshQueue
              .processRequest()
              .then((newAccessToken) => {
                // Successfully refreshed token
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    Authorization: `Bearer ${newAccessToken}`,
                  },
                }));
                // Retry the operation
                forward(operation).subscribe(observer);
              })
              .catch((refreshError) => {
                // Refresh failed, logout is handled by the queue or if not, here.
                console.error("Token refresh process failed:", refreshError);
                // Ensure logout is called if not already handled by queue's internal failure
                if (useAuthStore.getState().isAuthenticated) {
                  useAuthStore.getState().logout();
                }
                if (
                  typeof window !== "undefined" &&
                  window.location.pathname !== "/login"
                ) {
                  window.location.href = "/login";
                }
                observer.error(refreshError); // Propagate the error to stop the operation
              });
          });
        }

        // Handle Forbidden separately if needed - Preserved logic
        if (
          extensions?.code === "FORBIDDEN" ||
          extensions?.httpStatus === 403 ||
          originalError?.statusCode === 403
        ) {
          useAuthStore.getState().setForbidden(true);
          // Allow Forbidden errors to propagate to components without retrying
        }
      }
    }

    if (networkError) {
      // Check if network error is a 401
      // Use ServerError or ServerParseError from @apollo/client which have statusCode
      if (
        "statusCode" in networkError &&
        networkError.statusCode === 401 &&
        operation.operationName !== "RefreshToken"
      ) {
        console.log(
          "Network 401 error detected, attempting refresh via queue."
        );
        return new Observable((observer) => {
          tokenRefreshQueue
            .processRequest()
            .then((newAccessToken) => {
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              }));
              forward(operation).subscribe(observer);
            })
            .catch((refreshError) => {
              console.error(
                "Token refresh process failed after network 401:",
                refreshError
              );
              if (useAuthStore.getState().isAuthenticated) {
                useAuthStore.getState().logout();
              }
              if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login"
              ) {
                window.location.href = "/login";
              }
              observer.error(refreshError);
            });
        });
      }
      console.error(
        `[Network error]: ${(networkError as Error).message}`,
        networkError
      );
    }
  }
);

const userTeamsMergePolicy: FieldPolicy<Reference[]> = {
  keyArgs: false,
  merge(_, incoming) {
    return incoming;
  },
};

const cache = new InMemoryCache({
  typePolicies: {
    User: { fields: { teams: userTeamsMergePolicy } },
    Team: { keyFields: ["id"] },
    SimpleTeamDTO: { keyFields: ["id"] },
  },
});

const client = new ApolloClient({
  link: from([networkMonitorLink, errorLink, authLink, httpLink]),
  cache: cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    },
  },
});

apolloClientInstance = client;
// Initialize the token refresh queue with the client instance and the mutation
if (apolloClientInstance) {
  tokenRefreshQueue.initialize(apolloClientInstance, REFRESH_TOKEN_MUTATION);
} else {
  console.error(
    "Failed to initialize TokenRefreshQueue: Apollo Client instance is null."
  );
}

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
  } catch (error) {
    console.error("Error calling backend logout mutation:", error); // Essential error
  } finally {
    useAuthStore.getState().logout();
    tokenRefreshQueue.reset(); // Reset the queue on logout
    await client.resetStore();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }
};
