import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { CREATE_RATE, DELETE_RATE, GET_RATES } from "./queries";
import { GetRatesQueryData } from "./types";

export const useRatesMutations = (selectedTeamId: string) => {
  const [createRateMutation, { loading: creatingRate }] = useMutation(
    CREATE_RATE,
    {
      update(cache, { data: { createRate: newRate } }) {
        if (!newRate || !selectedTeamId) return;
        const existingRates = cache.readQuery<GetRatesQueryData>({
          query: GET_RATES,
          variables: { teamId: selectedTeamId },
        });
        if (existingRates && existingRates.rates) {
          cache.writeQuery({
            query: GET_RATES,
            variables: { teamId: selectedTeamId },
            data: { rates: [...existingRates.rates, newRate] },
          });
        }
      },
      onError: (error) => {
        console.error("Error creating rate:", error);
        toast.error(`Failed to create rate: ${error.message}`);
      },
      onCompleted: () => {
        toast.success("Rate created successfully!");
      },
    }
  );

  const [deleteRateMutation] = useMutation(DELETE_RATE, {
    update(cache, { data: { deleteRate: deletedRateData } }) {
      if (!deletedRateData || !selectedTeamId) return;
      const deletedId = deletedRateData.id;
      const existingRates = cache.readQuery<GetRatesQueryData>({
        query: GET_RATES,
        variables: { teamId: selectedTeamId },
      });
      if (existingRates && existingRates.rates) {
        const updatedRates = existingRates.rates.filter(
          (rate) => rate.id !== deletedId
        );
        cache.writeQuery({
          query: GET_RATES,
          variables: { teamId: selectedTeamId },
          data: { rates: updatedRates },
        });
      }
    },
    onError: (error) => {
      console.error("Error deleting rate:", error);
      toast.error(`Failed to delete rate: ${error.message}`);
    },
    onCompleted: (data) => {
      if (data?.deleteRate?.id) {
        toast.success(`Rate deleted successfully!`);
      }
    },
  });

  const createRate = useCallback(
    (variables: { name: string; rate: number; teamId: string }) => {
      return createRateMutation({ variables });
    },
    [createRateMutation]
  );

  const deleteRate = useCallback(
    (rateId: number) => {
      return deleteRateMutation({ variables: { input: { rateId } } });
    },
    [deleteRateMutation]
  );

  return {
    createRate,
    deleteRate,
    creatingRate,
  };
};
