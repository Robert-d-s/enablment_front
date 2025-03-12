"use client";

import React from "react";
import Image from "next/image";

interface Person {
  name: string;
  roles: string[];
  images: [string, string];
}

const peopleData: Person[] = [
  {
    name: "Gustav Duus",
    images: ["/members/ceo_1.jpg", "/members/ceo_2.jpg"],
    roles: ["CEO", "Co-Founder"],
  },
  {
    name: "Joakim Larsen",
    images: ["/members/m_1.jpg", "/members/m_2.jpg"],
    roles: ["Co-Founder"],
  },
  {
    name: "George Aftincai",
    images: ["/members/gerorge_1.jpg", "/members/gerorge_2.jpg"],
    roles: ["Front-end"],
  },
  {
    name: "Riccardo Conti",
    images: ["/members/ricardo_1.jpg", "/members/ricardo_2.jpg"],
    roles: ["Front-end", "Mobile"],
  },
  {
    name: "Sam Hakimane",
    images: ["/members/sam_1.jpg", "/members/sam_2.jpg"],
    roles: ["Back-end"],
  },
  {
    name: "Jedrzej Lagodzinski",
    images: ["/members/j_1.jpg", "/members/j_2.jpg"],
    roles: ["Front-end"],
  },
  {
    name: "David Lin",
    images: ["/members/david_1.jpg", "/members/david_2.jpg"],
    roles: ["Front-end", "Design"],
  },
];

interface PeopleSectionProps {
  isActive: boolean;
}

const PeopleSection: React.FC<PeopleSectionProps> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="p-4">
      <h2 className="text-3xl font-pt-sans-bold-900 mb-4 mx-4">People</h2>
      <div className="people-section grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {peopleData.map((person, index) => (
          <PersonCard key={index} person={person} />
        ))}
      </div>
    </div>
  );
};

interface PersonCardProps {
  person: Person;
}

type RoleIconMappingType = {
  [roleName: string]: string;
};

const roleIconMapping: RoleIconMappingType = {
  CEO: "ceo.svg",
  "Co-Founder": "founder.svg",
  "Front-end": "front.svg",
  Mobile: "mobile.svg",
  "Back-end": "back.svg",
  Design: "design.svg",
};

const getIconPath = (role: string): string => {
  return `/icons/${roleIconMapping[role] || "default-icon.svg"}`;
};

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div
      className="person-card cursor-pointer overflow-hidden relative w-full h-auto shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full md:w-auto lg:w-full aspect-w-1 aspect-h-1"
        style={{ paddingTop: "calc(512 / 342 * 100%)" }}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
          style={{ paddingTop: "calc(512 / 342 * 100%)" }}
        >
          <Image
            src={person.images[0]}
            alt={`${person.name} - Base`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg"
          />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{ paddingTop: "calc(512 / 342 * 100%)" }}
        >
          <Image
            src={person.images[1]}
            alt={`${person.name} - Hover`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-4 rounded-lg">
        <div
          style={{ width: "fit-content" }}
          className="bg-black bg-opacity-40 lg:p-2 sm:p-1"
        >
          <h3 className="text-white lg:text-xl md:text-sm font-bold">
            {person.name}
          </h3>
        </div>
        {person.roles.map((role, index) => (
          <div key={index} style={{ width: "fit-content" }}>
            <div className="bg-black bg-opacity-40 flex items-center">
              <div className="relative mr-1 flex justify-center items-center w-8 h-8 sm:w-[3vw] sm:h-[3vw] lg:w-[2vw] lg:h-[2vw] md:w-[3vw] md:h-[3vw]">
                <Image
                  src={getIconPath(role)}
                  alt={`${role} icon`}
                  fill
                  className="filter invert"
                />
              </div>
              <span className="text-white lg:text-lg md:text-sm mr-2">
                {role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleSection;
