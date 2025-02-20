"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import ProjectSelector from "../components/ProjectSelector";

interface Rate {
  rateId: string;
  rateName: string;
  hours: number;
  cost: number;
  ratePerHour: number;
}

interface InvoiceData {
  projectId: string;
  projectName: string;
  totalHours: number;
  totalCost: number;
  rates: Rate[];
}

// GraphQL queries
const GET_PROJECTS = gql`
  query {
    projects {
      id
      name
      teamId
    }
  }
`;

const GET_ALL_TEAMS = gql`
  query {
    getAllSimpleTeams {
      id
      name
    }
  }
`;

const GET_INVOICE_FOR_PROJECT = gql`
  query InvoiceForProject(
    $projectId: String!
    $startDate: DateTime!
    $endDate: DateTime!
  ) {
    invoiceForProject(
      projectId: $projectId
      startDate: $startDate
      endDate: $endDate
    ) {
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

const InvoiceDashboard: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const { data: projectsData } = useQuery(GET_PROJECTS);
  const { data: teamsData } = useQuery(GET_ALL_TEAMS);

  const {
    loading: loadingInvoice,
    error: errorInvoice,
    data: invoiceDataResponse,
    refetch,
  } = useQuery(GET_INVOICE_FOR_PROJECT, {
    variables: {
      projectId: selectedProject,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    },
    skip: !selectedProject || !startDate || !endDate,
  });

  useEffect(() => {
    if (invoiceDataResponse) {
      setInvoiceData(invoiceDataResponse.invoiceForProject);
    }
  }, [invoiceDataResponse]);

  useEffect(() => {
    if (selectedProject && startDate && endDate) {
      refetch();
    }
  }, [selectedProject, startDate, endDate, refetch]);

  interface Team {
    id: string;
    name: string;
  }

  interface Project {
    id: string;
    name: string;
    teamId: string;
  }

  const teamIdToNameMap = teamsData?.getAllSimpleTeams.reduce(
    (acc: Record<string, string>, team: Team) => {
      acc[team.id] = team.name;
      return acc;
    },
    {}
  );

  const projectTeamName = projectsData?.projects.find(
    (project: Project) => project.id === invoiceData?.projectId
  )?.teamId;

  const projectsWithTeamNames = projectsData?.projects.map(
    (project: Project) => ({
      ...project,
      teamName: teamIdToNameMap
        ? teamIdToNameMap[project.teamId]
        : "Unknown Team",
    })
  );

  useEffect(() => {
    console.log("teamIdToNameMap", teamIdToNameMap);
    console.log("invoiceData", invoiceData);
    console.log("Invoice Data Rates:", invoiceData?.rates);

    if (selectedProject && startDate && endDate) {
      refetch();
    }
  }, [
    selectedProject,
    startDate,
    endDate,
    refetch,
    teamIdToNameMap,
    invoiceData,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: "code",
      notation: "compact",
    })
      .format(value)
      .replace("DKK", "")
      .trim();
  };

  return (
    <div className="p-6 bg-black shadow-md ">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
        <h3 className="text-lg font-bold text-white">Invoice Summary</h3>

        <div className="flex-grow">
          <ProjectSelector
            projects={projectsWithTeamNames || []}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
        </div>

        <div className="flex-grow md:flex md:space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Handling loading, error, and invoice data display */}
      {loadingInvoice && <p>Loading...</p>}
      {errorInvoice && (
        <div className="bg-red-50 border-l-8 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-600">{errorInvoice.message}</p>
        </div>
      )}
      {invoiceData && (
        <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
          <h4 className="text-md font-bold bg-slate-200">
            Project: {invoiceData.projectName} - Team:{" "}
            {teamIdToNameMap && projectTeamName
              ? teamIdToNameMap[projectTeamName] || "Team Not Found"
              : "Loading Teams..."}
          </h4>
          <p className="border-b border-gray-200 shadow-sm">
            Total Hours: {invoiceData.totalHours.toFixed(2)}
          </p>
          <p className="border-b border-gray-200 shadow-sm">
            Total Cost: {formatCurrency(invoiceData.totalCost)}
          </p>
          <div className="mt-4">
            <h5 className="font-semibold bg-slate-200">Rates Applied:</h5>
            <ul>
              {invoiceData.rates.map((rate: Rate) => (
                <li
                  className="border-b border-gray-200 shadow-sm"
                  key={rate.rateId}
                >
                  {rate.rateName}: {rate.hours.toFixed(2)} hours at{" "}
                  {formatCurrency(rate.cost)} (
                  {formatCurrency(rate.ratePerHour)} DKK / h)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard;
