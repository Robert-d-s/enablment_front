// src/app/hooks/useTimeKeeperQueries.ts
import { useQuery, useMutation } from "@apollo/client";
import {
  RATES_QUERY,
  TOTAL_TIME_QUERY,
  CREATE_TIME_MUTATION,
} from "@/app/graphql/timeKeeperOperations";
import type { TimeEntry } from "../types";

export const useTimeKeeperQueries = (
  currentTeamId: string,
  selectedProject: string,
  userId: string
) => {
  const { data: ratesData } = useQuery(RATES_QUERY, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId,
  });

  const {
    data: totalTimeData,
    loading: totalTimeLoading,
    error: totalTimeError,
    refetch,
  } = useQuery(TOTAL_TIME_QUERY, {
    variables: {
      userId: parseFloat(userId),
      projectId: selectedProject,
    },
    skip: !userId || !selectedProject,
  });

  // Wrap the mutation function so that it accepts only an object with variables.
  const [rawCreateTimeEntry] = useMutation<{ createTime: TimeEntry }>(
    CREATE_TIME_MUTATION
  );
  const createTimeEntry = async (variables: {
    timeInputCreate: Partial<TimeEntry>;
  }): Promise<void> => {
    await rawCreateTimeEntry({ variables });
  };

  return {
    ratesData,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry,
  };
};
