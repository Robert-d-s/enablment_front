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
import { useAuthStore, getAccessToken } from "./authStore"; // Import store and getter
import gql from "graphql-tag";

// Define the refresh token mutation structure (matching backend resolver)
const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      access_token
    }
  }
`;

export const loggedInUserTeamsVersion = makeVar(0);

// --- Auth Link: Adds Access Token Header ---
const authLink = setContext((operation, { headers }) => {
  // Exclude Authorization header for refreshToken mutation itself
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

// --- Error Link: Handles Token Expiry and Refresh ---
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
        const originalError = extensions.originalError as OriginalError; // Cast with specific type

        // Check for specific unauthenticated error scenarios
        const isAuthError =
          extensions?.code === "UNAUTHORIZED" || // Custom code from backend guard
          originalError?.statusCode === 401 ||
          err.message.toLowerCase().includes("unauthorized") ||
          err.message.toLowerCase().includes("access denied") ||
          err.message.toLowerCase().includes("invalid token") ||
          err.message.toLowerCase().includes("expired token");

        // Don't refresh if the failed operation was RefreshToken itself!
        if (isAuthError && operation.operationName !== "RefreshToken") {
          console.log(
            `Auth error on operation '${operation.operationName}'. Initiating refresh.`
          );

          if (!isRefreshing) {
            isRefreshing = true;
            console.log("Starting token refresh via mutation...");

            // Use the client instance directly to mutate
            client
              .mutate<{ refreshToken: { access_token: string } }>({
                mutation: REFRESH_TOKEN_MUTATION,
                // No variables needed as refresh token is in cookie
                context: {
                  credentials: "include", // Crucial: ensures cookie is sent
                },
              })
              .then(({ data }) => {
                const newAccessToken = data?.refreshToken.access_token;
                if (!newAccessToken) {
                  console.error(
                    "Token refresh succeeded but no new access token received."
                  );
                  throw new Error("New access token not received."); // Trigger catch block
                }
                console.log(
                  "Token refresh successful. New access token obtained."
                );
                useAuthStore.getState().setAccessToken(newAccessToken); // Update store
                resolvePendingRequests(newAccessToken); // Retry queued requests
              })
              .catch((refreshError) => {
                console.error("Token refresh mutation failed:", refreshError);
                // Clear frontend state and redirect to login
                useAuthStore.getState().logout(); // Clear store
                pendingRequests = []; // Clear queue
                // No need to call backend logout here, refresh already failed
                if (window.location.pathname !== "/login") {
                  window.location.href = "/login"; // Force redirect
                }
              })
              .finally(() => {
                isRefreshing = false;
                console.log("Token refresh process finished.");
              });
          }

          // Return Observable to queue the original request
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
              forward(operation).subscribe(observer); // Resubscribe with updated context
            });
          });
        }
        // Handle other errors like Forbidden
        if (
          extensions?.code === "FORBIDDEN" ||
          originalError?.statusCode === 403
        ) {
          useAuthStore.getState().setForbidden(true);
        }
      }
    }

    // Handle network errors (optional, but good practice)
    if (networkError) {
      console.error(`[Network error]: ${networkError.message}`, networkError);
      // You could add specific handling for 401 network errors too if they occur
    }
  }
);

// --- HTTP Link ---
const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, // Your GraphQL endpoint
  fetchOptions: {
    method: "POST",
  },
  credentials: "include", // IMPORTANT: Send cookies (like refresh_token) with ALL requests
});

// --- Apollo Client Instance ---
const client = new ApolloClient({
  link: from([
    errorLink, // Handles errors and refresh logic
    authLink, // Adds access token header
    httpLink, // Sends the request
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" }, // Good default
    query: { fetchPolicy: "network-only", errorPolicy: "all" }, // Ensure fresh data, handle errors
    mutate: { errorPolicy: "all" },
  },
});

// --- Export client and potentially the backend logout function ---
export default client;

// Updated logout function (if needed separately, often called from UI)
export const clientLogout = async () => {
  try {
    // Call backend logout mutation (sends access token via authLink)
    await client.mutate({
      mutation: gql`
        mutation Logout {
          logout {
            success
          }
        }
      `,
      context: { credentials: "include" }, // Ensure cookies cleared even if access token expired
    });
    console.log("Backend logout mutation successful.");
  } catch (error) {
    console.error("Error calling backend logout mutation:", error);
    // Proceed with frontend logout regardless
  } finally {
    // ALWAYS clear frontend state
    useAuthStore.getState().logout();
    await client.resetStore(); // Clear Apollo cache
    console.log("Frontend state cleared.");

    // Redirect
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
};
