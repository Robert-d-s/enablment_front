import { useQuery, useMutation } from "@apollo/client";
import {
  RATES_QUERY,
  TOTAL_TIME_QUERY,
  CREATE_TIME_MUTATION,
  UPDATE_TIME_MUTATION,
} from "@/app/graphql/timeKeeperOperations";
import type { TimeEntry, Rate } from "../types";

interface CreateTimeData {
  startTime: string;
  endTime?: string;
  projectId: string;
  userId: number;
  rateId: number;
  totalElapsedTime: number;
}

interface CreateTimeMutationVariables {
  timeInputCreate: CreateTimeData;
}

export const useTimeKeeperQueries = (
  currentTeamId: string | undefined,
  selectedProject: string,
  userId: string
) => {
  const { data: ratesData } = useQuery<{ rates: Rate[] }>(RATES_QUERY, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId,
    context: { credentials: "include" },
  });

  const {
    data: totalTimeData,
    loading: totalTimeLoading,
    error: totalTimeError,
    refetch,
  } = useQuery(TOTAL_TIME_QUERY, {
    variables: {
      userId: !isNaN(parseFloat(userId)) ? parseFloat(userId) : 0,
      projectId: selectedProject,
    },
    skip: !userId || !selectedProject,
    context: { credentials: "include" },
  });

  const [createTimeEntryMutation] = useMutation<
    { createTime: TimeEntry },
    CreateTimeMutationVariables
  >(CREATE_TIME_MUTATION);
  const [updateTimeEntryMutation] = useMutation<{ updateTime: TimeEntry }>(
    UPDATE_TIME_MUTATION
  );

  return {
    ratesData,
    totalTimeData,
    totalTimeLoading,
    totalTimeError,
    refetch,
    createTimeEntry: (
      timeData: CreateTimeData
    ): Promise<{ data: { createTime: TimeEntry } }> =>
      createTimeEntryMutation({
        variables: {
          timeInputCreate: timeData,
        },
        context: { credentials: "include" },
      }) as Promise<{ data: { createTime: TimeEntry } }>,

    updateTime: (options: {
      timeInputUpdate: {
        id: number;
        endTime: string;
        totalElapsedTime: number;
      };
    }): Promise<{ data: { updateTime: TimeEntry } }> =>
      updateTimeEntryMutation({
        variables: options,
        context: { credentials: "include" },
      }) as Promise<{ data: { updateTime: TimeEntry } }>,
  };
};
