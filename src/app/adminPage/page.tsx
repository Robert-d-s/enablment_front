"use client";

import React from "react";
import NavigationBar from "../components/NavigationBar";
import UserManagementSection from "@/app/components/Admin/userManagementSection";
import TotalTimeSpent from "@/app/components/Admin/totalTimeSpent";
import RatesManager from "@/app/components/Admin/ratesManager";
import InvoiceSummary from "@/app/components/Admin/invoiceSummary";
import DBSyncPage from "@/app/dbSynch/page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPage: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="container mx-auto p-4 font-roboto-condensed">
        <UserManagementSection />
        <div className="mb-6 shadow-md">
          <TotalTimeSpent />
        </div>

        <div className="mb-6 shadow-md">
          <RatesManager />
        </div>
        <div className="shadow-md">
          <InvoiceSummary />
        </div>
        <div className="mb-6 shadow-lg">
          <DBSyncPage />
        </div>
      </div>
    </>
  );
};

export default AdminPage;
