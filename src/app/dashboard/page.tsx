import React from "react";
import TimeKeeper from "./timeKeeper";
import TotalTimeSpent from "./time";
import RatesManager from "./ratesManager";
import IssuesComponent from "./issues2";
import { logout } from "../lib/apolloClient";

const handleLogout = () => {
  logout();
};
export default function Dashboard() {
  return (
    <div>
      <div className="dashboard-container px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <TimeKeeper />
          </div>
          <div>
            <TotalTimeSpent />
          </div>
          <div>
            <RatesManager />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <IssuesComponent />
        </div>
      </div>
    </div>
  );
}
