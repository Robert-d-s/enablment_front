"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex items-center">
      {/* Expandable content panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-sm shadow-lg rounded-l-xl ${
          isExpanded ? "w-80 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="p-4 w-80">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tableData.map((item, index) => (
              <div key={index} className="w-full">
                <div className="bg-white shadow hover:shadow-md rounded-lg p-3 transition-shadow duration-200">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {item.client}
                  </h3>
                  <p className="text-gray-600 text-xs">Year: {item.year}</p>
                  <p className="text-gray-600 text-xs">
                    Services: {item.services}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 w-full shadow-md hover:shadow-lg text-sm"
              onClick={onContactClick}
            >
              Shall we collaborate?
            </button>
          </div>
        </div>
      </div>

      {/* Arrow tab */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl rounded-l-xl p-3 transition-all duration-300 cursor-pointer group border-r-0 flex flex-col items-center justify-center h-24"
      >
        <span className="text-sm font-semibold mb-1 transform -rotate-90 whitespace-nowrap text-gray-800">
          Cases
        </span>
        <div
          className={`transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        >
          <ChevronDown className="w-4 h-4 text-green-700 group-hover:text-green-600" />
        </div>
      </button>
    </div>
  );
};

export default ClientColab;
