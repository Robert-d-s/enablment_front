import { useQuery, useMutation } from "@apollo/client";
import {
  RATES_QUERY,
  TOTAL_TIME_QUERY,
  CREATE_TIME_MUTATION,
  UPDATE_TIME_MUTATION,
} from "@/app/graphql/timeKeeperOperations";
import type { TimeEntry, Rate } from "../types";

interface CreateTimeData {
  startTime: string; // ISO String
  endTime?: string; // ISO String (Optional)
  projectId: string;
  userId: number;
  rateId: number;
  totalElapsedTime: number;
}

// Define the structure for the Apollo variables
interface CreateTimeMutationVariables {
  timeInputCreate: CreateTimeData; // <--- The nested object
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
      // userId: parseFloat(userId),
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

  // return {
  //   ratesData,
  //   totalTimeData,
  //   totalTimeLoading,
  //   totalTimeError,
  //   refetch,
  //   createTimeEntry: (data: {
  //     startTime: string;
  //     projectId: string;
  //     userId: number;
  //     rateId: number;
  //     totalElapsedTime: number;
  //   }): Promise<{ data: { createTime: TimeEntry } }> =>
  //     createTimeEntryMutation({
  //       variables: {
  //         timeInputCreate: {
  //           startTime: data.startTime,
  //           projectId: data.projectId,
  //           userId: data.userId,
  //           rateId: data.rateId,
  //           totalElapsedTime: data.totalElapsedTime,
  //           // No additional fields that might trigger ValidationPipe
  //         },
  //       },
  //     }) as Promise<{
  //       data: { createTime: TimeEntry };
  //     }>,
  //   updateTime: (options: {
  //     timeInputUpdate: {
  //       id: number;
  //       endTime: string;
  //       totalElapsedTime: number;
  //     };
  //   }): Promise<{ data: { updateTime: TimeEntry } }> =>
  //     updateTimeEntryMutation({
  //       variables: {
  //         timeInputUpdate: options.timeInputUpdate,
  //       },
  //     }) as Promise<{
  //       data: { updateTime: TimeEntry };
  //     }>,
  // };
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
          timeInputCreate: timeData, // <--- Correctly wrap the data
        },
        context: { credentials: "include" }, // Ensure cookies are sent
      }) as Promise<{ data: { createTime: TimeEntry } }>, // Type assertion might still be needed depending on codegen

    updateTime: (options: {
      timeInputUpdate: {
        id: number;
        endTime: string;
        totalElapsedTime: number;
      };
    }): Promise<{ data: { updateTime: TimeEntry } }> =>
      updateTimeEntryMutation({
        variables: options, // updateTime variables are already correctly structured
        context: { credentials: "include" },
      }) as Promise<{ data: { updateTime: TimeEntry } }>,
  };
};
