"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Team {
  id: string;
  name: string;
  __typename?: "SimpleTeamDTO";
}

interface Rate {
  id: number;
  name: string;
  rate: number;
  teamId?: string;
  __typename?: "Rate";
}

interface GetRatesQueryData {
  rates: Rate[];
}

interface GetAllTeamsQueryData {
  getAllSimpleTeams: Team[];
}

const GET_ALL_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams_RatesManager {
    getAllSimpleTeams {
      id
      name
      __typename
    }
  }
`;

const CREATE_RATE = gql`
  mutation CreateRate_RatesManager(
    $name: String!
    $rate: Int!
    $teamId: String!
  ) {
    createRate(rateInputCreate: { name: $name, rate: $rate, teamId: $teamId }) {
      id
      name
      rate
      teamId
      __typename
    }
  }
`;

const DELETE_RATE = gql`
  mutation DeleteRate_RatesManager($rateId: Int!) {
    deleteRate(rateId: $rateId) {
      id
    }
  }
`;

const GET_RATES = gql`
  query GetRates_RatesManager($teamId: String!) {
    rates(teamId: $teamId) {
      id
      name
      rate
      __typename
    }
  }
`;

const RatesManager = () => {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [rateName, setRateName] = useState("");
  const [rateValue, setRateValue] = useState<number | string>("");
  const [formError, setFormError] = useState<string | null>(null);
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
        setRateName("");
        setRateValue("");
        setFormError(null);
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
      setProcessingDeleteId(null);
    },
    onCompleted: (data) => {
      if (data?.deleteRate?.id) {
        toast.success(`Rate deleted successfully!`);
      }
      setProcessingDeleteId(null);
    },
  });

  const handleRateValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRateValue(value === "" ? "" : parseInt(value, 10) || 0);
    if (value !== "" && isNaN(parseInt(value, 10))) {
      setFormError("Rate value must be a number.");
    } else {
      setFormError(null);
    }
  };

  const handleCreateRate = useCallback(() => {
    setFormError(null);
    if (!selectedTeamId) {
      setFormError("Please select a team.");
      return;
    }
    if (!rateName.trim()) {
      setFormError("Please enter a rate name.");
      return;
    }
    if (rateValue === "" || isNaN(Number(rateValue)) || Number(rateValue) < 0) {
      setFormError("Please enter a valid non-negative rate value.");
      return;
    }
    if (formError) return;

    createRateMutation({
      variables: {
        name: rateName.trim(),
        rate: Number(rateValue),
        teamId: selectedTeamId,
      },
    });
  }, [createRateMutation, rateName, rateValue, selectedTeamId, formError]);

  const handleDeleteRate = useCallback(
    (rateId: number) => {
      if (processingDeleteId) return;
      setProcessingDeleteId(rateId);
      deleteRateMutation({ variables: { rateId } });
    },
    [deleteRateMutation, processingDeleteId]
  );

  const isActionLoading = creatingRate || processingDeleteId !== null;

  return (
    <Card className="p-4 bg-gray-50 shadow-md rounded-lg border">
      <CardHeader className="border-b pb-2 mb-4">
        <CardTitle className="font-bold text-lg">Manage Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="teamSelectorRates" className="block text-sm font-medium text-gray-700 mb-1">
            Select Team
          </Label>
          <Select
            value={selectedTeamId}
            onValueChange={setSelectedTeamId}
            disabled={teamsLoading}
          >
            <SelectTrigger
              id="teamSelectorRates"
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            >
              <SelectValue placeholder={teamsLoading ? "Loading Teams..." : "-- Select a Team --"} />
            </SelectTrigger>
            <SelectContent>
              {teamsData?.getAllSimpleTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {teamsError && (
            <p className="text-red-500 text-xs mt-1">{teamsError.message}</p>
          )}
        </div>

        {selectedTeamId && (
          <div className="mb-4 p-4 border rounded-md bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <Label
                htmlFor="rateName"
                className="block text-sm font-medium text-gray-700"
              >
                New Rate Name
              </Label>
              <Input
                id="rateName"
                type="text"
                className="w-full p-2 mt-1 border border-gray-300 rounded disabled:bg-gray-100"
                value={rateName}
                onChange={(e) => setRateName(e.target.value)}
                placeholder="e.g., Standard Rate"
                disabled={isActionLoading}
              />
            </div>
            <div>
              <Label
                htmlFor="rateValue"
                className="block text-sm font-medium text-gray-700"
              >
                Rate Value (DKK)
              </Label>
              <Input
                id="rateValue"
                type="number"
                className="w-full p-2 mt-1 border border-gray-300 rounded disabled:bg-gray-100"
                value={rateValue}
                onChange={handleRateValueChange}
                placeholder="e.g., 800"
                min="0"
                step="1"
                disabled={isActionLoading}
              />
            </div>
            <div>
              <Button
                className="w-full p-2 bg-black text-white rounded hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleCreateRate}
                disabled={isActionLoading || !!formError}
              >
                {creatingRate ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>{" "}
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>{" "}
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Rate"
                )}
              </Button>
              {formError && (
                <p className="text-red-500 text-xs mt-1">{formError}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Existing Rates for Team:</h4>
          {selectedTeamId ? (
            <>
              {ratesLoading && (
                <p className="text-gray-500 italic">Loading rates...</p>
              )}
              {ratesError && (
                <p className="text-red-500">
                  Error loading rates: {ratesError.message}
                </p>
              )}
              {!ratesLoading &&
                !ratesError &&
                ratesData?.rates &&
                ratesData.rates.length === 0 && (
                  <p className="text-gray-500 italic">
                    No rates defined for this team yet.
                  </p>
                )}
              {!ratesLoading &&
                !ratesError &&
                ratesData?.rates &&
                ratesData.rates.length > 0 && (
                  <div className="border rounded-md max-h-60 overflow-y-auto bg-white">
                    <ul className="divide-y divide-gray-200">
                      {ratesData.rates.map((rate: Rate) => {
                        const isDeletingThisRate = processingDeleteId === rate.id;
                        return (
                          <li
                            key={rate.id}
                            className="flex justify-between items-center p-3 hover:bg-gray-50"
                          >
                            <div>
                              <span className="font-medium mr-2">
                                {rate.name}
                              </span>
                              <span className="text-gray-600">
                                ({rate.rate} DKK/h)
                              </span>
                            </div>
                            <Button
                              className="p-1 px-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                              onClick={() => handleDeleteRate(rate.id)}
                              disabled={isActionLoading || isDeletingThisRate}
                            >
                              {isDeletingThisRate ? (
                                <svg
                                  className="animate-spin h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  {" "}
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>{" "}
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>{" "}
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  {" "}
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />{" "}
                                </svg>
                              )}
                              {isDeletingThisRate ? "Deleting..." : "Delete"}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </>
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
