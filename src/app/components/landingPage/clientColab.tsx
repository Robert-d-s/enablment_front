"use client";

import React from "react";

// Define the TypeScript type for the table data
type ClientServiceData = {
  client: string;
  year: number;
  services: string;
};
interface ServiceTableProps {
  onContactClick: () => void;
}

// Sample data array
const tableData: ClientServiceData[] = [
  {
    client: "Modstrøm",
    year: 2023,
    services: "Climate Footprint Reporting: Scope 1 and 2",
  },
  { client: "Junkfood", year: 2023, services: "Climate Footprint Reporting" },
  { client: "Confidential", year: 2023, services: "Cloud, User Platform" },
  { client: "Shipping Company", year: 2023, services: "Cloud, User Platform" },
  { client: "B93", year: 2023, services: "Website, UI & UX" },
  {
    client: "B:A:M",
    year: 2024,
    services: "Video Streaming Platform and Mobil App",
  },
  { client: "H5", year: 2024, services: "Website" },
];

const ClientColab: React.FC<ServiceTableProps> = ({ onContactClick }) => {
  return (
    <div className="flex flex-col mx-2 z-10">
      <p className="text-3xl font-semibold mb-2 text-center bg-white shadow rounded-lg sm:text-2xl">
        Our Happy Collaborators
      </p>
      {tableData.map((item, index) => (
        <div key={index} className="w-full pb-2">
          <div className="bg-white shadow rounded-lg sm:p-1 sm:text-sm">
            <h3 className="text-lg sm:text-md font-semibold">{item.client}</h3>
            <p className="text-gray-900 font-roboto">Year: {item.year}</p>
            <p className="text-gray-900 font-roboto">
              Services: {item.services}
            </p>
          </div>
        </div>
      ))}
      <div className="flex mt-2">
        <button
          className="bg-green-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 "
          onClick={onContactClick}
        >
          Shall we collaborate ?
        </button>
      </div>
    </div>
  );
};

export default ClientColab;
