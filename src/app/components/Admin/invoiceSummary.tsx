"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns/formatISO";
import { isValid } from "date-fns/isValid";
import ProjectSelector from "../ProjectSelector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/app/lib/utils";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/globals.css";

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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
  } = useQuery<GetProjectsData>(GET_PROJECTS_FOR_SELECTOR);

  const formattedStartDate =
    startDate && isValid(startDate) ? formatISO(startDate) : null;
  const formattedEndDate =
    endDate && isValid(endDate) ? formatISO(endDate) : null;

  const { loading: loadingInvoice, error: errorInvoice } =
    useQuery<GetInvoiceData>(GET_INVOICE_FOR_PROJECT, {
      variables: {
        input: {
          projectId: selectedProject,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
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

  const datePickerInputClass = cn(
    "w-full h-9 px-3 py-1 text-sm",
    "border border-input",
    "rounded-md",
    "bg-background",
    "shadow-sm",
    "focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "placeholder:text-muted-foreground"
  );

  const renderInvoiceDetails = () => {
    if (loadingInvoice) {
      return <p className="text-gray-500 mt-4">Loading invoice…</p>;
    }

    if (invoiceData) {
      return (
        <div className="mt-4 p-6 bg-white shadow-md rounded-lg">
          <h4 className="text-md font-bold bg-slate-200 p-2 rounded-t-lg">
            Project: {invoiceData.projectName} – Team:{" "}
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
              {invoiceData.rates.length > 0 ? (
                <ul className="list-disc list-inside pl-4 pt-1">
                  {invoiceData.rates.map((rate) => (
                    <li
                      key={rate.rateId}
                      className="border-b border-gray-100 py-1 text-sm"
                    >
                      {rate.rateName}: {rate.hours.toFixed(2)} hours at{" "}
                      {formatCurrency(rate.cost)} (
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
    <Card className="bg-black border-none p-6 shadow-md rounded-lg">
      <CardHeader className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <CardTitle className="text-lg font-bold text-white whitespace-nowrap pt-1">
          Invoice Summary
        </CardTitle>
        {/* Project Selector container */}
        <div className="flex-grow w-full md:w-auto">
          {isInitialLoading ? (
            <select
              disabled
              className="w-full h-9 px-3 py-2 bg-gray-200 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
            >
              <option>Loading Projects…</option>
            </select>
          ) : initialLoadingError ? (
            <div className="p-2 bg-red-100 text-red-700 border border-red-300 rounded">
              Error loading projects.
            </div>
          ) : (
            <ProjectSelector
              projects={projectsForSelector}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
            />
          )}
        </div>
        {/* Date Pickers container */}
        <div className="flex-grow flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-1 datepicker-wrapper">
            <Label htmlFor="startDatePicker" className="sr-only">
              Start Date
            </Label>
            <DatePicker
              id="startDatePicker"
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Start Date"
              className={datePickerInputClass}
              wrapperClassName="w-full"
              disabled={isInitialLoading}
              isClearable
              maxDate={endDate || new Date()}
              popperPlacement="bottom-start"
            />
          </div>
          <div className="flex-1 datepicker-wrapper">
            <Label htmlFor="endDatePicker" className="sr-only">
              End Date
            </Label>
            <DatePicker
              id="endDatePicker"
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              maxDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="End Date"
              className={datePickerInputClass}
              wrapperClassName="w-full"
              disabled={isInitialLoading}
              isClearable
              popperPlacement="bottom-start"
            />
          </div>
        </div>
      </CardHeader>

      {!isInitialLoading && !initialLoadingError ? (
        <CardContent>{renderInvoiceDetails()}</CardContent>
      ) : (
        // Keep loading indicator simple if projects are loading
        <CardContent>
          <p className="text-gray-400 mt-4 italic text-center">
            Loading projects...
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default InvoiceSummary;
