"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface NavbarProps {
  sections: string[];
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({
  sections = [],
  setActiveSection,
  activeSection,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSectionClick = (section: string) => {
    if (section === "Client-Portal") {
      router.push("/login");
    } else {
      setActiveSection(section);
    }
    setIsMenuOpen(false);
  };

  const menuIconVariants = {
    opened: {
      rotate: 90,
      scale: 1.2,
    },
    closed: {
      rotate: 0,
      scale: 1,
    },
  };

  const menuVariants = {
    opened: {
      opacity: 1,
      y: "90%",
      transition: {
        y: { stiffness: 1000, velocity: -100 },
        duration: 0.3,
      },
      // Explicitly define display property for the opened state to ensure visibility
      display: "flex",
    },
    closed: {
      opacity: [1, 0],
      y: "-50%",
      transition: {
        y: { stiffness: 1000 },
        opacity: { duration: 0.3 },
        duration: 0.3,
      },
      transitionEnd: {
        // Keep display as "none" only for small screens; adjust as necessary based on your design
        display: "none",
      },
    },
  };

  return (
    <nav
      className="relative flex items-center justify-center content-center p-4"
      style={{ minHeight: "64px" }}
    >
      <div className="absolute left-0 pl-4">
        <Image
          src="/icons/logo.svg"
          alt="Logo"
          width={100}
          height={50}
          priority
          // className="filter invert"
        />
      </div>
      <motion.div
        className="lg:hidden z-20 absolute right-4 "
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        variants={menuIconVariants}
        animate={isMenuOpen ? "opened" : "closed"}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          ></path>
        </svg>
      </motion.div>
      <motion.div
        variants={menuVariants}
        initial="closed"
        animate={isMenuOpen ? "opened" : "closed"}
        className={`menu-container absolute md:top-auto md:relative md:flex md:flex-row md:items-center md:space-x-4 `}
      >
        {sections.map((section) => (
          <div
            key={section}
            className="flex items-center"
            onMouseEnter={() => setHoveredSection(section)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div
              className={`h-4 w-4 rounded-full  cursor-pointer transition duration-800 ease-in-out ${
                activeSection === section
                  ? "bg-green-500"
                  : hoveredSection === section
                  ? "bg-gray-500"
                  : "bg-transparent border-2 border-black"
              }`}
              onClick={() => handleSectionClick(section)}
            />
            <button
              // className="text-black py-2 px-4"
              className={`py-2 px-4 ${
                section === "Contact"
                  ? "text-white font-bold rounded-lg  px-2 mx-2 py-0 bg-green-700"
                  : "text-black"
              }`}
              onClick={() => handleSectionClick(section)}
            >
              {section}
            </button>
          </div>
        ))}
      </motion.div>
    </nav>
  );
};

export default Navbar;
