// src/app/adminPage/page.tsx
"use client";

import React from "react";
import NavigationBar from "../components/NavigationBar";
import UserManagementSection from "@/app/components/Admin/userManagementSection";
import TotalTimeSpent from "@/app/components/Admin/totalTimeSpent";
import RatesManager from "@/app/components/Admin/ratesManager";
import InvoiceSummary from "@/app/components/Admin/invoiceSummary";
import DBSyncPage from "@/app/dbSynch/page";

const AdminPage: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 font-roboto-condensed">
        <div className="mb-6 shadow-lg">
          <DBSyncPage />
        </div>
        <UserManagementSection />
        <div className="mb-6 shadow-md">
          <TotalTimeSpent />
        </div>
        {/*
        <div className="mb-6 shadow-md">
          <RatesManager />
        </div>
        <div className="shadow-md">
          <InvoiceSummary />
        </div>
         */}
      </div>
    </>
  );
};

export default AdminPage;
