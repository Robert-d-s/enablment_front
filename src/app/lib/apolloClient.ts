import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  makeVar,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
// import { createClient } from "graphql-ws";
// import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
// import { getMainDefinition } from "@apollo/client/utilities";

interface User {
  id: string;
  email: string;
}

// Authentication link for setting headers
const authLink = setContext((_, { headers }) => {
  const token: string | null = localStorage.getItem("token");
  if (token) {
    fetchUserProfile(token);
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
          window.location.href = "/login";
        } else if (extensions?.code === "FORBIDDEN") {
          isForbiddenVar(true); // Update the reactive variable on forbidden error
        }
      });
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
    return forward(operation);
  }
);

export const isForbiddenVar = makeVar(false);
export const currentUserVar = makeVar<User | null>(null);

// `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`

const client = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    createHttpLink({
      uri: (operation) =>
        operation.getContext().useLinearApi
          ? `https://api.linear.app/graphql`
          : `http://localhost:8080/graphql`,
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
        },
      },
    },
  }),
});

// const client = new ApolloClient({
//   link: from([errorLink, splitLink]),
//   cache: new InMemoryCache(),
// });

export default client;

export const fetchUserProfile = async (token: string) => {
  try {
    const response = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch user data");
    const userData: User = await response.json();
    currentUserVar(userData); // Update the reactive variable
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Handle error appropriately
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  client.resetStore();
  window.location.href = "/login";
};
