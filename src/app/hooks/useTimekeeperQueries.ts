import { useQuery, useMutation } from "@apollo/client";
import {
  RATES_QUERY,
  TOTAL_TIME_QUERY,
  CREATE_TIME_MUTATION,
  UPDATE_TIME_MUTATION,
} from "@/app/graphql/timeKeeperOperations";
import type { TimeEntry, Rate } from "../types";

export const useTimeKeeperQueries = (
  currentTeamId: string,
  selectedProject: string,
  userId: string
) => {
  const { data: ratesData } = useQuery<{ rates: Rate[] }>(RATES_QUERY, {
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

  const [createTimeEntryMutation] = useMutation<{ createTime: TimeEntry }>(
    CREATE_TIME_MUTATION
  );
  const [updateTimeEntryMutation] = useMutation<{ updateTime: TimeEntry }>(
    UPDATE_TIME_MUTATION
  );

  return {
    ratesData,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry: (options: {
      timeInputCreate: Partial<TimeEntry>;
    }): Promise<{ data: { createTime: TimeEntry } }> =>
      createTimeEntryMutation({ variables: options }) as Promise<{
        data: { createTime: TimeEntry };
      }>,
    updateTime: (options: {
      timeInputUpdate: {
        id: number;
        endTime: string;
        totalElapsedTime: number;
      };
    }): Promise<{ data: { updateTime: TimeEntry } }> =>
      updateTimeEntryMutation({ variables: options }) as Promise<{
        data: { updateTime: TimeEntry };
      }>,
  };
};
