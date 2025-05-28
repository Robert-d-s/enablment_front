"use client";

import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/app/graphql/authOperations";
import { useAuthStore } from "@/app/lib/authStore";

interface MeQueryResult {
  me: {
    id: number;
    email: string;
    role: string;
  } | null;
}

export const useCurrentUser = () => {
  const {
    user: storeUser,
    accessToken,
    isAuthenticated,
    setUser,
    logout,
  } = useAuthStore();

  const { data, loading, error, refetch } = useQuery<MeQueryResult>(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first", // Use cache for subsequent calls
    skip: !accessToken,
    context: {
      credentials: "include",
    },
    onCompleted: (data) => {
      if (data?.me) {
        console.log("ME_QUERY successful, user data:", data.me);
        setUser(data.me);
        if (!isAuthenticated) useAuthStore.setState({ isAuthenticated: true });
      } else {
        console.log("ME_QUERY returned null user, logging out.");
        if (accessToken) {
          logout();
        }
      }
    },
    onError: (error) => {
      console.error("Error fetching current user:", error);
      const isAuthError =
        error.graphQLErrors.some(
          (gqlError) =>
            gqlError.extensions?.code === "UNAUTHORIZED" ||
            gqlError.message.includes("Unauthorized")
        ) || error.networkError?.message.includes("401");

      if (isAuthError && accessToken) {
        console.log("ME_QUERY failed with auth error, logging out.");
        logout();
      }

      if (
        (error.message.includes("not authenticated") ||
          error.message.includes("Invalid token") ||
          error.message.includes("Unauthorized") ||
          error.message.includes("No auth token found in cookies")) &&
        !storeUser
      ) {
        useAuthStore.getState().logout();
      }
    },
  });
  const derivedIsAuthenticated = !!accessToken;
  return {
    currentUser: storeUser || data?.me || null,
    isLoading: loading,
    isAuthenticated: derivedIsAuthenticated,
    error,
    refetch,
  };
};

export default useCurrentUser;
