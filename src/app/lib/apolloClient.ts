import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
  makeVar,
  FieldPolicy,
  Reference,
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

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let apolloClientInstance: ApolloClient<object> | null = null;

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

const triggerRefreshToken = (): Promise<string | null> => {
  if (!apolloClientInstance) {
    console.error("Apollo Client instance not available for token refresh."); // Essential error
    return Promise.resolve(null);
  }
  return apolloClientInstance
    .mutate<{ refreshToken: { access_token: string } }>({
      mutation: REFRESH_TOKEN_MUTATION,
      context: { credentials: "include" },
    })
    .then(({ data }) => {
      const newAccessToken = data?.refreshToken.access_token;
      if (!newAccessToken) {
        throw new Error("New access token not received.");
      }
      useAuthStore.getState().setAccessToken(newAccessToken);
      return newAccessToken;
    })
    .catch((refreshError) => {
      console.error("Token refresh mutation failed:", refreshError); // Essential error
      return null;
    });
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const extensions = err.extensions || {};
        const originalError = extensions.originalError as
          | { statusCode?: number }
          | undefined; // Keep for potential use

        const isAuthError =
          extensions?.code === "UNAUTHENTICATED" ||
          extensions?.code === "TOKEN_EXPIRED" ||
          extensions?.code === "UNAUTHORIZED" ||
          extensions?.httpStatus === 401 || // Check code from your filter
          (originalError?.statusCode === 401 &&
            operation.operationName !== "RefreshToken") || // Check originalError if available
          err.message.toLowerCase().includes("expired token") || // Fallback message checks
          err.message.toLowerCase().includes("no authentication token found");

        if (isAuthError && operation.operationName !== "RefreshToken") {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = triggerRefreshToken().finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
          }

          return new Observable((observer) => {
            if (!refreshPromise) {
              observer.error(
                new Error("Token refresh not initiated correctly.")
              );
              return;
            }
            refreshPromise
              .then((newAccessToken) => {
                if (newAccessToken) {
                  operation.setContext(({ headers = {} }) => ({
                    headers: {
                      ...headers,
                      Authorization: `Bearer ${newAccessToken}`,
                    },
                  }));
                  forward(operation).subscribe(observer);
                } else {
                  // Refresh definitively failed, newAccessToken is null
                  useAuthStore.getState().logout();
                  if (
                    typeof window !== "undefined" &&
                    window.location.pathname !== "/login"
                  ) {
                    window.location.href = "/login";
                  }
                  observer.error(
                    new Error("Token refresh failed. User logged out.")
                  );
                }
              })
              .catch((error) => {
                // Catch errors from the refreshPromise chain itself
                useAuthStore.getState().logout(); // Ensure logout on unexpected promise errors
                if (
                  typeof window !== "undefined" &&
                  window.location.pathname !== "/login"
                ) {
                  window.location.href = "/login";
                }
                observer.error(error);
              });
          });
        }

        // Handle Forbidden separately if needed
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
      console.error(`[Network error]: ${networkError.message}`, networkError); // Essential error
      // Potentially handle global network error state here
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
  link: from([errorLink, authLink, httpLink]),
  cache: cache,
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
    query: { fetchPolicy: "network-only", errorPolicy: "all" },
    mutate: { errorPolicy: "all" },
  },
});

apolloClientInstance = client;

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
    await client.resetStore();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }
};
