"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useNavigationStore } from "@/app/lib/navigationStore";
import logo from "../../../public/logo.svg";

const NavBar: React.FC = () => {
  const router = useRouter();
  const {
    sections,
    activeSection,
    hoveredSection,
    isMenuOpen,
    setHoveredSection,
    setMenuOpen,
    navigateToSection,
  } = useNavigationStore();

  useEffect(() => {
    const handleResize = () => {
      // On desktop, we don't use the mobile menu state at all
      // On mobile, ensure menu starts closed
      if (window.innerWidth < 1024) {
        setMenuOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMenuOpen]);

  const handleSectionClick = (section: string) => {
    if (section === "Client-Portal") {
      router.push("/login");
    } else {
      navigateToSection(
        section as
          | "Home"
          | "About"
          | "Services"
          | "People"
          | "Contact"
          | "Client-Portal",
        sections
      );
    }

    if (window.innerWidth < 1024) {
      setMenuOpen(false);
    }
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
  } as const;

  const menuBackdropVariants = {
    opened: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  } as const;

  const getMobileMenuItemClasses = (section: string) => {
    const isActive = activeSection === section;
    const isHovered = hoveredSection === section;

    const baseClasses =
      "group relative flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-3 text-base font-medium text-slate-900 transition-colors duration-200 ease-out shadow-sm backdrop-blur-lg bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

    if (isActive) {
      return `${baseClasses} border border-emerald-200 bg-emerald-50 text-emerald-700`;
    }

    if (isHovered) {
      return `${baseClasses} border border-slate-200 bg-slate-50`;
    }

    return `${baseClasses} border border-transparent`;
  };

  const getDesktopMenuItemClasses = (section: string) => {
    const isActive = activeSection === section;
    const isHovered = hoveredSection === section;
    const isContact = section === "Contact";

    const baseClasses =
      "relative flex items-center gap-2 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-600 transition-colors duration-200";

    if (isContact) {
      return `${baseClasses} rounded-full bg-emerald-500 px-5 text-white shadow-[0_10px_20px_rgba(16,185,129,0.25)] hover:bg-emerald-400`;
    }

    if (isActive) {
      return `${baseClasses} text-slate-900 after:absolute after:left-4 after:right-4 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-emerald-400`;
    }

    if (isHovered) {
      return `${baseClasses} text-slate-800`;
    }

    return baseClasses;
  };

  const getDesktopDotClasses = (section: string) => {
    const isActive = activeSection === section;
    const isHovered = hoveredSection === section;

    return `block h-2 w-2 rounded-full border transition-colors duration-200 ${
      isActive
        ? "border-emerald-500 bg-emerald-500"
        : isHovered
        ? "border-emerald-400 bg-emerald-200"
        : "border-slate-300"
    }`;
  };
  return (
    <nav
      className="relative z-50 w-full bg-white/85 backdrop-blur-lg"
      style={{ minHeight: "64px" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 md:gap-4 lg:gap-8 lg:px-10">
        <div className="flex shrink-0 items-center">
          <Image
            src={logo}
            alt="Enablement logo"
            priority
            className="h-6 w-auto max-w-[120px] md:h-7 md:max-w-[140px] lg:h-8 lg:max-w-[160px]"
            sizes="(max-width: 768px) 120px, (max-width: 1024px) 140px, 160px"
          />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          {/* Burger Icon – visible on mobile only */}
          <motion.button
            className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="h-0.5 w-6 rounded-full bg-gray-800"
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 8 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.span
              className="h-0.5 w-6 rounded-full bg-gray-800"
              animate={{ opacity: isMenuOpen ? 0 : 1, x: isMenuOpen ? -10 : 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.span
              className="h-0.5 w-6 rounded-full bg-gray-800"
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -8 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.button>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {sections.map((section) => (
              <button
                key={`desktop-${section}`}
                type="button"
                onMouseEnter={() => setHoveredSection(section)}
                onMouseLeave={() => setHoveredSection(null)}
                onFocus={() => setHoveredSection(section)}
                onBlur={() => setHoveredSection(null)}
                onClick={() => handleSectionClick(section)}
                className={getDesktopMenuItemClasses(section)}
              >
                {section !== "Contact" && (
                  <span
                    className={getDesktopDotClasses(section)}
                    aria-hidden="true"
                  />
                )}
                <span>{section}</span>
              </button>
            ))}
          </div>

          {/* Mobile menu – hidden on large screens */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate={isMenuOpen ? "opened" : "closed"}
            className="menu-container fixed top-20 left-4 right-4 mx-auto flex-col items-stretch rounded-3xl border border-white/20 bg-white/95 p-6 shadow-[0_20px_40px_rgba(15,118,110,0.15)] lg:hidden z-40 gap-3"
          >
            {sections.map((section) => {
              const isActive = activeSection === section;
              const isHovered = hoveredSection === section;

              return (
                <motion.button
                  key={`mobile-${section}`}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -2 }}
                  onMouseEnter={() => setHoveredSection(section)}
                  onMouseLeave={() => setHoveredSection(null)}
                  onFocus={() => setHoveredSection(section)}
                  onBlur={() => setHoveredSection(null)}
                  onClick={() => handleSectionClick(section)}
                  className={getMobileMenuItemClasses(section)}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      isActive
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : isHovered
                        ? "border-emerald-300 bg-emerald-100/40 text-emerald-500"
                        : "border-slate-200 bg-white/60 text-slate-400"
                    }`}
                    aria-hidden="true"
                  >
                    <span className="text-sm font-semibold">{"•"}</span>
                  </span>
                  <span className="flex-1 text-left uppercase tracking-[0.15em] font-medium text-slate-900">
                    {section}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>
      {/* Menu Container Backdrop */}
      <motion.div
        variants={menuBackdropVariants}
        initial="closed"
        animate={isMenuOpen ? "opened" : "closed"}
        className="fixed inset-0 z-30 bg-slate-900/45 backdrop-blur-sm lg:hidden"
        style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </nav>
  );
};

export default NavBar;
