"use client";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "./authStore";

// Authentication link for setting headers - with cookies, we don't need to manually add the token
const authLink = setContext((_operation, { headers }) => {
  return {
    headers: {
      ...headers,
      "content-type": "application/json",
    },
    // Include credentials for all requests
    credentials: "include",
  };
});

// Error handling link
const errorLink = onError(
  ({ graphQLErrors, networkError, forward, operation }) => {
    // Check if this operation should skip error handling
    const context = operation.getContext();
    const skipErrorHandling = context.skipErrorHandling;

    if (graphQLErrors && !skipErrorHandling) {
      graphQLErrors.forEach(({ message, extensions }) => {
        // Check for authentication errors
        const isAuthError =
          message.includes("Invalid or expired token") ||
          message.includes("Unauthorized") ||
          message.includes("No auth token found");

        // Get the operation name safely
        const operationName = operation.operationName || "";

        if (isAuthError) {
          // Ignore auth errors for login/signup operations
          if (!["Login", "Signup"].includes(operationName)) {
            console.log("Auth error detected, logging out:", message);
            useAuthStore.getState().setAuthenticated(false);

            // Only redirect to login if it's not already a login operation
            if (window.location.pathname !== "/login") {
              logout();
            }
          }
        } else if (extensions?.code === "FORBIDDEN") {
          useAuthStore.getState().setForbidden(true);
        }
      });
    }
    if (networkError && !skipErrorHandling) {
      console.log(`[Network error]: ${networkError}`);
    }
    return forward(operation);
  }
);

const client = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    createHttpLink({
      uri: (operation) =>
        operation.getContext().useLinearApi
          ? `${process.env.NEXT_PUBLIC_LINEAR_API_URL}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`,
      fetchOptions: {
        method: "POST",
        credentials: "include", // Important: include credentials in all requests
      },
    }),
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "network-only", // Ensures we're using fresh data with new auth cookies
      errorPolicy: "all", // Return partial results on error if possible
    },
    mutate: {
      errorPolicy: "all", // Return partial results on error if possible
    },
  },
});

export default client;

export const logout = async () => {
  try {
    // Call logout endpoint to clear the cookie on the server
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error during logout:", error);
  }

  // Clear local state
  useAuthStore.getState().logout();
  client.resetStore();

  // Only redirect if not already at login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};
