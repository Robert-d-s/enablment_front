import {
  useGetRatesQuery,
  useGetTotalTimeForUserProjectQuery,
  useCreateTimeMutation,
  useUpdateTimeMutation,
  type TimeInputCreate,
  type Time,
} from "@/generated/graphql";

export const useTimeKeeperQueries = (
  currentTeamId: string | undefined,
  selectedProject: string,
  userId: string
) => {
  const { data: ratesData, error: ratesError } = useGetRatesQuery({
    variables: { teamId: currentTeamId! },
    skip: !currentTeamId,
    context: { credentials: "include" },
    errorPolicy: "all", // Return partial data even if there are errors
    onError: (error) => {
      console.error("Error fetching rates:", error);
    },
  });

  const {
    data: totalTimeData,
    loading: totalTimeLoading,
    error: totalTimeError,
    refetch,
  } = useGetTotalTimeForUserProjectQuery({
    variables: {
      userId: !isNaN(parseFloat(userId)) ? parseFloat(userId) : 0,
      projectId: selectedProject,
    },
    skip: !userId || !selectedProject,
    context: { credentials: "include" },
    errorPolicy: "all", // Return partial data even if there are errors
    onError: (error) => {
      console.error("Error fetching total time:", error);
    },
  });

  const [createTimeEntryMutation] = useCreateTimeMutation({
    onError: (error) => {
      console.error("Error creating time entry:", error);
      console.error("GraphQL errors:", error.graphQLErrors);
      console.error("Network error:", error.networkError);
    },
  });

  const [updateTimeEntryMutation] = useUpdateTimeMutation({
    onError: (error) => {
      console.error("Error updating time entry:", error);
    },
  });

  return {
    ratesData,
    ratesError,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry: (
      timeData: TimeInputCreate
    ): Promise<{ data: { createTime: Time } }> => {
      console.log("Sending GraphQL CREATE_TIME_MUTATION with variables:", {
        timeInputCreate: timeData,
      });
      return createTimeEntryMutation({
        variables: {
          timeInputCreate: timeData,
        },
        context: { credentials: "include" },
      }) as Promise<{ data: { createTime: Time } }>;
    },

    updateTime: (options: {
      timeInputUpdate: {
        id: number;
        endTime: string;
        totalElapsedTime: number;
      };
    }): Promise<{ data: { updateTime: Time } }> =>
      updateTimeEntryMutation({
        variables: options,
        context: { credentials: "include" },
      }) as Promise<{ data: { updateTime: Time } }>,
  };
};
