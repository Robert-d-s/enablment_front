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

// Authentication link for setting headers
const authLink = setContext((operation, { headers }) => {
  // Check if the current operation is login or signup
  const isAuthOperation =
    operation.operationName === "Login" || operation.operationName === "Signup";

  // Only add the token for non-auth operations
  const token = !isAuthOperation ? localStorage.getItem("token") : null;

  return {
    headers: {
      ...headers,
      "content-type": "application/json",
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Error handling link
const errorLink = onError(
  ({ graphQLErrors, networkError, forward, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (message.includes("Invalid or expired token")) {
          logout();
        } else if (extensions?.code === "FORBIDDEN") {
          useAuthStore.getState().setForbidden(true);
        }
      });
    }
    if (networkError) {
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
      },
    }),
  ]),
  cache: new InMemoryCache(),
});

export default client;

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  useAuthStore.getState().logout();
  client.resetStore();
  window.location.href = "/login";
};
