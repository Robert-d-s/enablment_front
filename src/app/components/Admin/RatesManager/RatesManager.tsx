"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamSelector } from "./TeamSelector";
import { RateForm } from "./RateForm";
import { RatesList } from "./RatesList";
import { useRatesMutations } from "./useRatesMutations";
import { useRatesForm } from "./useRatesForm";
import { GET_ALL_SIMPLE_TEAMS, GET_RATES } from "./queries";
import { GetRatesQueryData, GetAllTeamsQueryData } from "./types";

const RatesManager = () => {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [processingDeleteId, setProcessingDeleteId] = useState<number | null>(
    null
  );

  const {
    loading: teamsLoading,
    error: teamsError,
    data: teamsData,
  } = useQuery<GetAllTeamsQueryData>(GET_ALL_SIMPLE_TEAMS);

  const {
    loading: ratesLoading,
    error: ratesError,
    data: ratesData,
  } = useQuery<GetRatesQueryData>(GET_RATES, {
    variables: { teamId: selectedTeamId },
    skip: !selectedTeamId,
    fetchPolicy: "cache-and-network",
  });

  const { createRate, deleteRate, creatingRate } =
    useRatesMutations(selectedTeamId);

  const {
    rateName,
    rateValue,
    formError,
    setRateName,
    handleRateValueChange,
    validateForm,
    resetForm,
  } = useRatesForm(() => {
    // Success callback - form will be reset automatically
  });

  const handleCreateRate = useCallback(() => {
    if (!validateForm(selectedTeamId)) return;

    createRate({
      name: rateName.trim(),
      rate: Number(rateValue),
      teamId: selectedTeamId,
    })
      .then(() => {
        resetForm();
      })
      .catch(() => {
        // Error handling is done in the mutation hook
      });
  }, [
    createRate,
    rateName,
    rateValue,
    selectedTeamId,
    validateForm,
    resetForm,
  ]);

  const handleDeleteRate = useCallback(
    (rateId: number) => {
      if (processingDeleteId) return;
      setProcessingDeleteId(rateId);
      deleteRate(rateId).finally(() => {
        setProcessingDeleteId(null);
      });
    },
    [deleteRate, processingDeleteId]
  );

  const isActionLoading = creatingRate || processingDeleteId !== null;

  return (
    <Card className="p-4 bg-gray-50 shadow-md rounded-lg border">
      <CardHeader className="border-b pb-2 mb-4">
        <CardTitle className="font-bold text-lg">Manage Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <TeamSelector
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          teams={teamsData?.getAllSimpleTeams}
          loading={teamsLoading}
          error={teamsError}
        />

        {selectedTeamId && (
          <RateForm
            rateName={rateName}
            rateValue={rateValue}
            formError={formError}
            isActionLoading={isActionLoading}
            creatingRate={creatingRate}
            onRateNameChange={setRateName}
            onRateValueChange={handleRateValueChange}
            onCreateRate={handleCreateRate}
          />
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Existing Rates for Team:</h4>
          {selectedTeamId ? (
            <RatesList
              rates={ratesData?.rates}
              loading={ratesLoading}
              error={ratesError}
              processingDeleteId={processingDeleteId}
              isActionLoading={isActionLoading}
              onDeleteRate={handleDeleteRate}
            />
          ) : (
            <p className="text-gray-500 italic">
              Select a team to view and manage rates.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatesManager;
