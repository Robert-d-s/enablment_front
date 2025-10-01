"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="flex flex-col mx-2 z-10 w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between text-lg md:text-xl lg:text-2xl font-semibold mb-2 bg-white shadow-lg hover:shadow-xl rounded-lg p-3 md:p-4 transition-all duration-300 cursor-pointer group"
      >
        <span className="text-left">Our Happy Collaborators</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-green-700 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-green-700 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-2 pb-2">
          {tableData.map((item, index) => (
            <div key={index} className="w-full">
              <div className="bg-white shadow hover:shadow-md rounded-lg p-2 md:p-3 transition-shadow duration-200">
                <h3 className="text-sm md:text-base font-semibold text-gray-800">{item.client}</h3>
                <p className="text-gray-600 font-roboto text-xs md:text-sm">Year: {item.year}</p>
                <p className="text-gray-600 font-roboto text-xs md:text-sm">
                  Services: {item.services}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex mt-3">
          <button
            className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full transition-colors duration-300 w-full shadow-md hover:shadow-lg"
            onClick={onContactClick}
          >
            Shall we collaborate?
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientColab;
