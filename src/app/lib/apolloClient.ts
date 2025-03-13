"use client";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  makeVar,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

interface User {
  id: string;
  email: string;
}

export const isForbiddenVar = makeVar(false);
export const currentUserVar = makeVar<User | null>(null);

let profileFetchPromise: Promise<User | null> | null = null;

const tryRestoreUser = () => {
  if (typeof window === "undefined") return;

  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      currentUserVar(userData);
      console.log("User restored from cache", userData.email);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown parsing error";
      console.error("Failed to parse stored user data", errorMessage);
      localStorage.removeItem("currentUser");
    }
  }
};

if (typeof window !== "undefined") {
  tryRestoreUser();
}

export const fetchUserProfile = async (token: string): Promise<User | null> => {
  // Return existing promise if there's a fetch in progress
  if (profileFetchPromise) {
    console.log("Using existing profile fetch promise");
    return profileFetchPromise;
  }

  // If we already have user data and not forcing refresh, use the cached version
  const existingUser = currentUserVar();
  if (existingUser) {
    console.log("Using cached user data for:", existingUser.email);
    return Promise.resolve(existingUser);
  }

  console.log("Fetching user profile from server");

  // Create and store the promise
  profileFetchPromise = new Promise<User | null>(async (resolve) => {
    try {
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const userData: User = await response.json();
      currentUserVar(userData);

      // Cache in localStorage for persistence across page refreshes
      localStorage.setItem("currentUser", JSON.stringify(userData));

      console.log("User profile fetched successfully:", userData.email);
      resolve(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      resolve(null);
    } finally {
      // Clear the promise reference when done
      profileFetchPromise = null;
    }
  });

  return profileFetchPromise;
};

// Authentication link for setting headers
const authLink = setContext(async (_, { headers }) => {
  const token: string | null = localStorage.getItem("token");

  if (token && !currentUserVar()) {
    await fetchUserProfile(token);
  }

  return {
    headers: {
      ...headers,
      "content-type": "application/json",
      "x-apollo-operation-name": "GraphQLQueriesAndMutations",
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
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
        } else if (extensions?.code === "FORBIDDEN") {
          isForbiddenVar(true);
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
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isForbidden: {
            read() {
              return isForbiddenVar();
            },
          },
          currentUser: {
            read() {
              return currentUserVar();
            },
          },
        },
      },
    },
  }),
});

export default client;

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  currentUserVar(null);
  client.resetStore();
  window.location.href = "/login";
};
