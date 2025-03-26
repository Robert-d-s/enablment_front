"use client";

import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/app/graphql/authOperations";
import { useAuthStore } from "@/app/lib/authStore";
import { useEffect } from "react";

export const useCurrentUser = () => {
  const storeUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    skip: isAuthenticated === false,
    context: {
      credentials: "include",
    },
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        setAuthenticated(true);
      } else if (!storeUser) {
        setAuthenticated(false);
      }
    },
    onError: (error) => {
      console.error("Error fetching current user:", error);

      if (storeUser) {
        console.log(
          "Error fetching user profile, but continuing with stored user"
        );
        return;
      }

      if (
        (error.message.includes("not authenticated") ||
          error.message.includes("Invalid token") ||
          error.message.includes("Unauthorized") ||
          error.message.includes("No auth token found in cookies")) &&
        !storeUser
      ) {
        setAuthenticated(false);
        useAuthStore.getState().logout();
      }
    },
  });

  useEffect(() => {
    if (storeUser && !isAuthenticated) {
      setAuthenticated(true);
    }
  }, [storeUser, isAuthenticated, setAuthenticated]);

  return {
    currentUser: storeUser || data?.me || null,
    isLoading: loading,
    isAuthenticated,
    error,
    refetch,
  };
};

export default useCurrentUser;
