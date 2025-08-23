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
import { LOGOUT_MUTATION } from "@/app/graphql/authOperations";
import { TokenRefreshQueue } from "../utils/tokenRefreshQueue";
import { networkMonitor } from "../utils/networkMonitor";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
    }
  }
`;

export const loggedInUserTeamsVersion = makeVar(0);

let apolloClientInstance: ApolloClient<object> | null = null;

const tokenRefreshQueue = new TokenRefreshQueue();

const debugLink = new ApolloLink((operation: Operation, forward: NextLink) => {
  console.log("🚀 GraphQL Request:", {
    operationName: operation.operationName,
    variables: operation.variables,
    query: operation.query.loc?.source.body,
  });

  return forward(operation).map((response) => {
    console.log("✅ GraphQL Response:", {
      operationName: operation.operationName,
      data: response.data,
      errors: response.errors,
    });
    return response;
  });
});

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

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const extensions = err.extensions || {};
        const httpStatus = (extensions as { httpStatus?: number }).httpStatus;

        const isUnauth =
          extensions?.code === "UNAUTHENTICATED" || httpStatus === 401;

        if (isUnauth && operation.operationName !== "RefreshToken") {
          console.log(
            "Auth error detected by errorLink, attempting refresh via queue."
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
                console.error("Token refresh process failed:", refreshError);
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

        if (extensions?.code === "FORBIDDEN" || httpStatus === 403) {
          useAuthStore.getState().setForbidden(true);
        }
      }
    }

    if (networkError) {
      const statusCode =
        (networkError as { statusCode?: number }).statusCode ?? undefined;
      if (statusCode === 401 && operation.operationName !== "RefreshToken") {
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
  link: from([debugLink, networkMonitorLink, errorLink, authLink, httpLink]),
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
      mutation: LOGOUT_MUTATION,
      context: { credentials: "include" },
    });
  } catch (error) {
    console.error("Error calling backend logout mutation:", error);
  } finally {
    useAuthStore.getState().logout();
    tokenRefreshQueue.reset();
    await client.clearStore();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }
};
