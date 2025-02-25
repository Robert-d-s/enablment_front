"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import logo from "../../../public/logo.svg";

interface NavbarProps {
  sections: string[];
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const NavBar: React.FC<NavbarProps> = ({
  sections = [],
  setActiveSection,
  activeSection,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Automatically set the menu open on desktop and closed on mobile.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };

    // Run on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSectionClick = (section: string) => {
    if (section === "Client-Portal") {
      router.push("/login");
    } else {
      setActiveSection(section);
    }
    // On mobile, close the menu after selection.
    if (window.innerWidth < 1024) {
      setIsMenuOpen(false);
    }
  };

  const menuIconVariants = {
    opened: {
      rotate: 90,
      scale: 1.2,
      transition: { duration: 0.2 },
    },
    closed: {
      rotate: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  const menuVariants = {
    opened: {
      opacity: 1,
      y: 0,
      display: "flex",
      transition: {
        y: { stiffness: 100, velocity: -100, type: "spring" },
        opacity: { duration: 0.3 },
      },
    },
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        y: { stiffness: 100 },
        opacity: { duration: 0.3 },
      },
      transitionEnd: {
        display: "none",
      },
    },
  };

  return (
    <nav
      className="relative flex items-center justify-center p-4"
      style={{ minHeight: "64px" }}
    >
      <div className="absolute left-0 pl-4">
        <Image src={logo} alt="Logo" priority />
      </div>
      {/* Burger Icon – visible on mobile only */}
      <motion.div
        className="lg:hidden z-20 absolute right-4 cursor-pointer"
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
      {/* Menu Container */}
      <motion.div
        variants={menuVariants}
        initial="closed"
        animate={isMenuOpen ? "opened" : "closed"}
        className="menu-container absolute md:top-auto md:relative md:flex md:flex-row md:items-center md:space-x-4"
      >
        {sections.map((section) => (
          <div
            key={section}
            className="flex items-center"
            onMouseEnter={() => setHoveredSection(section)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div
              className={`h-4 w-4 rounded-full cursor-pointer transition duration-800 ease-in-out ${
                activeSection === section
                  ? "bg-green-500"
                  : hoveredSection === section
                  ? "bg-gray-500"
                  : "bg-transparent border-2 border-black"
              }`}
              onClick={() => handleSectionClick(section)}
            />
            <button
              className={`py-2 px-4 ${
                section === "Contact"
                  ? "text-white font-bold rounded-lg px-2 mx-2 py-0 bg-green-700"
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

export default NavBar;
