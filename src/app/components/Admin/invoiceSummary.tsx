"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { formatISO } from "date-fns/formatISO";
import { isValid } from "date-fns/isValid";
import ProjectSelector from "../ProjectSelector";
import ErrorMessage from "@/app/components/Admin/ErrorMessage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "./DateRangePicker";
import {
  useGetProjectsForInvoiceSelectorQuery,
  useInvoiceForProjectLazyQuery,
  type InvoiceForProjectQuery,
} from "@/generated/graphql";

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
  rates?: QueryRateDetail[] | null;
  __typename?: string;
}

interface ProjectForSelector {
  id: string;
  name: string;
  teamName?: string;
}

const InvoiceSummary: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Callback functions for DateRangePicker
  const onStartDateChange = useCallback(
    (date: Date | null) => setStartDate(date),
    []
  );
  const onEndDateChange = useCallback(
    (date: Date | null) => setEndDate(date),
    []
  );

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
  } = useGetProjectsForInvoiceSelectorQuery();

  const formattedStartDate =
    startDate && isValid(startDate)
      ? formatISO(startDate, { representation: "date" })
      : null;
  const formattedEndDate =
    endDate && isValid(endDate)
      ? formatISO(endDate, { representation: "date" })
      : null;

  const [
    getInvoiceForProject,
    { loading: loadingInvoice, error: errorInvoice },
  ] = useInvoiceForProjectLazyQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: InvoiceForProjectQuery) => {
      setInvoiceData(data?.invoiceForProject ?? null);
    },
    onError: (error: Error) => {
      console.error("Error fetching invoice:", error);
      setInvoiceData(null);
    },
  });

  // Trigger the lazy query when parameters change
  useEffect(() => {
    if (selectedProject && startDate && endDate) {
      getInvoiceForProject({
        variables: {
          input: {
            projectId: selectedProject,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          },
        },
      });
    }
  }, [
    selectedProject,
    startDate,
    endDate,
    formattedStartDate,
    formattedEndDate,
    getInvoiceForProject,
  ]);

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

  if (projectsLoading) {
    return null;
  }

  if (projectsError) {
    return (
      <Card className="bg-black border-none p-6 shadow-md rounded-lg min-h-[150px]">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white whitespace-nowrap pt-1">
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage
            error={projectsError}
            context="loading projects for invoice summary"
          />
        </CardContent>
      </Card>
    );
  }

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
              {invoiceData.rates && invoiceData.rates.length > 0 ? (
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

  const isDatePickerDisabled =
    projectsForSelector.length === 0 || !selectedProject;

  return (
    <Card className="bg-black border-none p-6 shadow-md rounded-lg">
      <CardHeader className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <CardTitle className="text-lg font-bold text-white whitespace-nowrap pt-1">
          Invoice Summary
        </CardTitle>
        {/* Project Selector container */}
        <div className="flex-grow w-full md:w-auto">
          <ProjectSelector
            projects={projectsForSelector}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
        </div>{" "}
        {/* Date Pickers container */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          disabled={isDatePickerDisabled}
          startLabel="Start Date"
          endLabel="End Date"
          className="flex-grow"
        />
      </CardHeader>
      <CardContent>{renderInvoiceDetails()}</CardContent>
    </Card>
  );
};

export default InvoiceSummary;
