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
  totalHours: number;
  totalCost: number;
  rates: QueryRateDetail[];
  __typename?: string;
}

interface Team {
  id: string;
  name: string;
}

interface ProjectForSelector {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}

interface RawProject {
  id: string;
  name: string;
  teamId: string;
}

const GET_PROJECTS = gql`
  query GetRawProjects {
    projects {
      id
      name
      teamId
    }
  }
`;

const GET_ALL_TEAMS = gql`
  query GetAllSimpleTeams {
    getAllSimpleTeams {
      id
      name
    }
  }
`;

const GET_INVOICE_FOR_PROJECT = gql`
  query InvoiceForProject($input: InvoiceInput!) {
    invoiceForProject(input: $input) {
      projectId
      projectName
      totalHours
      totalCost
      rates {
        rateId
        rateName
        hours
        cost
        ratePerHour
      }
    }
  }
`;

interface GetRawProjectsData {
  projects: RawProject[];
}

interface GetAllTeamsData {
  getAllSimpleTeams: Team[];
}

interface GetInvoiceData {
  invoiceForProject: InvoiceData | null;
}

const InvoiceSummary: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const { data: projectsData } = useQuery<GetRawProjectsData>(GET_PROJECTS);
  const { data: teamsData } = useQuery<GetAllTeamsData>(GET_ALL_TEAMS);

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
        console.log("Invoice data received:", data?.invoiceForProject);
      },
      onError: (error) => {
        console.error("Error fetching invoice:", error);
        setInvoiceData(null);
      },
    });

  const teamIdToNameMap = useMemo(() => {
    if (!teamsData?.getAllSimpleTeams) return {};
    return teamsData.getAllSimpleTeams.reduce(
      (acc: Record<string, string>, team) => {
        acc[team.id] = team.name;
        return acc;
      },
      {}
    );
  }, [teamsData]);

  const projectsWithTeamNames = useMemo<ProjectForSelector[]>(() => {
    if (!projectsData?.projects || Object.keys(teamIdToNameMap).length === 0)
      return [];
    return projectsData.projects.map((project) => ({
      ...project,
      teamName: teamIdToNameMap[project.teamId] || "Unknown Team",
    }));
  }, [projectsData, teamIdToNameMap]);

  const projectTeamId = useMemo<string | undefined>(() => {
    if (!invoiceData || !projectsData?.projects) return undefined;
    return projectsData.projects.find(
      (project) => project.id === invoiceData.projectId
    )?.teamId;
  }, [projectsData, invoiceData]);

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
    if (value === null || value === undefined) return "-";
    if (isNaN(value)) return "Invalid";

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
            {" "}
            Project: {invoiceData.projectName} - Team:{" "}
            {teamIdToNameMap && projectTeamId
              ? teamIdToNameMap[projectTeamId] || "N/A"
              : "..."}
          </h4>
          <div className="p-2 space-y-1">
            {" "}
            <p className="border-b border-gray-200 pb-1">
              Total Hours: {invoiceData.totalHours?.toFixed(2) ?? "N/A"}{" "}
            </p>
            <p className="border-b border-gray-200 pb-1">
              Total Cost: {formatCurrency(invoiceData.totalCost)}
            </p>
            <div className="mt-4">
              <h5 className="font-semibold bg-slate-200 p-1">Rates Applied:</h5>
              {invoiceData.rates && invoiceData.rates.length > 0 ? (
                <ul className="list-disc list-inside pl-4 pt-1">
                  {" "}
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
          <ProjectSelector
            projects={projectsWithTeamNames}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
        </div>
        <div className="flex-grow flex flex-col md:flex-row gap-2 md:gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="End Date"
          />
        </div>
      </div>
      {renderInvoiceDetails()}
    </div>
  );
};

export default InvoiceSummary;
