"use client";

import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/app/graphql/authOperations";
import { useAuthStore } from "@/app/lib/authStore";

export const useCurrentUser = () => {
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    skip: !localStorage.getItem("token"),
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
    },
    onError: (error) => {
      console.error("Error fetching current user:", error);
      // If we get an authentication error, clear the user
      if (
        error.message.includes("not authenticated") ||
        error.message.includes("Invalid token")
      ) {
        useAuthStore.getState().logout();
      }
    },
  });

  return {
    currentUser: storeUser || data?.me || null,
    isLoading: loading,
    error,
    refetch,
  };
};

export default useCurrentUser;
