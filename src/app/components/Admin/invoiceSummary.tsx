// src/app/components/Admin/invoiceSummary.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import ProjectSelector from "../ProjectSelector";

interface QueryRateDetail {
  rateId: number;
  rateName: string;
  hours: number;
  cost: number;
  ratePerHour: number;
  __typename?: string;
}

interface InvoiceData {
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  totalHours: number;
  totalCost: number;
  rates: QueryRateDetail[];
  __typename?: string;
}

interface ProjectForSelector {
  id: string;
  name: string;
  teamName?: string;
}

interface RawProject {
  id: string;
  name: string;
  teamId: string;
  teamName?: string;
  __typename?: string;
}

interface GetProjectsData {
  projects: RawProject[];
}

interface GetInvoiceData {
  invoiceForProject: InvoiceData | null;
}

const GET_PROJECTS_FOR_SELECTOR = gql`
  query GetProjectsForInvoiceSelector {
    projects {
      id
      name
      teamName
      __typename
    }
  }
`;

const GET_INVOICE_FOR_PROJECT = gql`
  query InvoiceForProject($input: InvoiceInput!) {
    invoiceForProject(input: $input) {
      projectId
      projectName
      teamId
      teamName
      totalHours
      totalCost
      rates {
        rateId
        rateName
        hours
        cost
        ratePerHour
        __typename
      }
      __typename
    }
  }
`;

const InvoiceSummary: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
  } = useQuery<GetProjectsData>(GET_PROJECTS_FOR_SELECTOR);

  const { loading: loadingInvoice, error: errorInvoice } =
    useQuery<GetInvoiceData>(GET_INVOICE_FOR_PROJECT, {
      variables: {
        input: {
          projectId: selectedProject,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        },
      },
      skip: !selectedProject || !startDate || !endDate,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        setInvoiceData(data?.invoiceForProject ?? null);
      },
      onError: (error) => {
        console.error("Error fetching invoice:", error);
        setInvoiceData(null);
      },
    });

  const projectsForSelector = useMemo<ProjectForSelector[]>(() => {
    if (!projectsData?.projects) return [];
    return projectsData.projects.map((project) => ({
      id: project.id,
      name: project.name,
      teamName: project.teamName || "Unknown Team",
    }));
  }, [projectsData]);

  useEffect(() => {
    console.log("Invoice State Update:", {
      selectedProject,
      startDate,
      endDate,
      invoiceData,
      loadingInvoice,
      errorInvoice,
    });
  }, [
    selectedProject,
    startDate,
    endDate,
    invoiceData,
    loadingInvoice,
    errorInvoice,
  ]);

  const formatCurrency = (value: number | null | undefined): string => {
    if (
      value === null ||
      value === undefined ||
      typeof value !== "number" ||
      isNaN(value)
    )
      return "-";
    try {
      return new Intl.NumberFormat("da-DK", {
        style: "currency",
        currency: "DKK",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (e) {
      console.error("Error formatting currency:", e);
      return String(value);
    }
  };

  const isInitialLoading = projectsLoading;
  const initialLoadingError = projectsError;

  const renderInvoiceDetails = () => {
    if (loadingInvoice) {
      return <p className="text-gray-400 mt-4">Loading Invoice...</p>;
    }
    if (errorInvoice) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded">
          <p className="font-bold">Error Loading Invoice</p>
          <p>{errorInvoice.message}</p>
        </div>
      );
    }
    if (invoiceData) {
      return (
        <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
          <h4 className="text-md font-bold bg-slate-200 p-2 rounded-t-lg">
            Project: {invoiceData.projectName} - Team:{" "}
            {invoiceData.teamName ?? "N/A"}
          </h4>
          <div className="p-2 space-y-1">
            <p className="border-b border-gray-200 pb-1">
              Total Hours: {invoiceData.totalHours?.toFixed(2) ?? "N/A"}
            </p>
            <p className="border-b border-gray-200 pb-1">
              Total Cost: {formatCurrency(invoiceData.totalCost)}
            </p>
            <div className="mt-4">
              <h5 className="font-semibold bg-slate-200 p-1">Rates Applied:</h5>
              {invoiceData.rates && invoiceData.rates.length > 0 ? (
                <ul className="list-disc list-inside pl-4 pt-1">
                  {invoiceData.rates.map((rate: QueryRateDetail) => (
                    <li
                      className="border-b border-gray-100 py-1 text-sm"
                      key={rate.rateId}
                    >
                      {rate.rateName}: {rate.hours?.toFixed(2) ?? "N/A"} hours
                      at {formatCurrency(rate.cost)} (
                      {formatCurrency(rate.ratePerHour)} / h)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm pt-1">
                  No specific rates applied for this period.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (selectedProject && startDate && endDate) {
      return (
        <p className="text-gray-400 mt-4">
          No invoice data found for the selected criteria.
        </p>
      );
    }
    return (
      <p className="text-gray-500 mt-4">
        Please select a project and date range.
      </p>
    );
  };

  return (
    <div className="p-6 bg-black shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <h3 className="text-lg font-bold text-white">Invoice Summary</h3>
        <div className="flex-grow">
          {isInitialLoading && (
            <select
              className="w-full p-2 bg-gray-200 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
              disabled
            >
              <option>Loading Projects...</option>
            </select>
          )}
          {initialLoadingError && (
            <div className="p-2 bg-red-100 text-red-700 border border-red-300 rounded">
              Error loading projects/teams.
            </div>
          )}
          {!isInitialLoading && !initialLoadingError && (
            <ProjectSelector
              projects={projectsForSelector}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
            />
          )}
        </div>
        <div className="flex-grow flex flex-col md:flex-row gap-2 md:gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Start Date"
            disabled={isInitialLoading}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="End Date"
            disabled={isInitialLoading}
            min={startDate}
          />
        </div>
      </div>
      {!isInitialLoading && !initialLoadingError ? (
        renderInvoiceDetails()
      ) : (
        <p className="text-gray-500 mt-4 italic">Loading initial data...</p>
      )}
    </div>
  );
};

export default InvoiceSummary;
