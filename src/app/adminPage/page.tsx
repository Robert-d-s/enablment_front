"use client";

import React from "react";
import dynamic from "next/dynamic";
import NavigationBar from "@/app/components/Admin/NavigationBar";
import UserManagementSkeleton from "@/app/components/Admin/skeletons/UserManagementSkeleton";
import TotalTimeSpentSkeleton from "@/app/components/Admin/skeletons/TotalTimeSpentSkeleton";
import RatesManagerSkeleton from "@/app/components/Admin/skeletons/RatesManagerSkeleton";
import InvoiceSummarySkeleton from "@/app/components/Admin/skeletons/InvoiceSummarySkeleton";
import DBSyncPageSkeleton from "@/app/components/Admin/skeletons/DBSyncPageSkeleton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DynamicUserManagementSection = dynamic(
  () => import("@/app/components/Admin/userManagementSection"),
  { loading: () => <UserManagementSkeleton />, ssr: false }
);

const DynamicTotalTimeSpent = dynamic(
  () => import("@/app/components/Admin/totalTimeSpent"),
  {
    loading: () => <TotalTimeSpentSkeleton />,
    ssr: false,
  }
);

const DynamicRatesManager = dynamic(
  () => import("@/app/components/Admin/RatesManager"),
  {
    loading: () => <RatesManagerSkeleton />,
    ssr: false,
  }
);

const DynamicInvoiceSummary = dynamic(
  () => import("@/app/components/Admin/invoiceSummary"),
  {
    loading: () => <InvoiceSummarySkeleton />,
    ssr: false,
  }
);

const DynamicDBSyncPage = dynamic(() => import("@/app/dbSynch/page"), {
  loading: () => <DBSyncPageSkeleton />,
  ssr: false,
});

const DynamicNetworkDebugPanel = dynamic(
  () => import("@/app/components/Debug/NetworkDebugPanel"),
  {
    ssr: false,
  }
);

const AdminPage: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <ToastContainer
        position="top-right"
        autoClose={2000}
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
        <DynamicUserManagementSection />
        <div className="mb-6 shadow-md">
          <DynamicTotalTimeSpent />
        </div>
        <div className="mb-6 shadow-md">
          <DynamicRatesManager />
        </div>
        <div className="shadow-md">
          <DynamicInvoiceSummary />
        </div>{" "}
        <div className="mb-6 shadow-lg">
          <DynamicDBSyncPage />
        </div>
      </div>
      <DynamicNetworkDebugPanel />
    </>
  );
};

export default AdminPage;
