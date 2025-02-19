"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Navbar from "@/app/nav/page";
import Section from "@/app/section/page";
import { BackgroundBeams } from "@/app/components/ui/background-beams";
import ContactForm from "@/app/contact/page";
import ServiceTable from "@/app/table/page";
import FooterComponent from "@/app/footer/page";

const Home: NextPage = () => {
  const sections = [
    "Home",
    "About",
    "Services",
    "People",
    "Contact",
    "Client-Portal",
  ];

  console.log("Page - sections data:", sections);

  const [activeSection, setActiveSection] = useState<string>(sections[0]);
  const isContactActive = activeSection === "Contact";
  const backgroundFadeVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 0.5,
      transition: { duration: 0.4, delay: 0.2, ease: "easeOut" },
    },
  };
  const closeContactForm = () => {
    setActiveSection("Home");
  };

  // Initialize sectionProps with all sections and their default properties
  interface SectionProps {
    [key: string]: { zIndex: number; opacity: number };
  }

  const [sectionProps, setSectionProps] = useState<SectionProps>(
    sections.reduce((acc, section, index) => {
      acc[section as keyof SectionProps] = {
        zIndex: sections.length - index, // Stack sections with initial z-index
        opacity: section === "Home" ? 1 : 0.5, // Only the Home section is fully opaque initially
      };
      return acc;
    }, {} as SectionProps)
  );

  const sectionColors = ["bg-gray-200"];

  useEffect(() => {
    console.log("Component re-rendered");
    // Update sectionProps when activeSection changes
    const updatedProps = {
      ...sectionProps,
      [activeSection]: {
        ...sectionProps[activeSection],
        zIndex: sections.length,
        opacity: 1,
      }, // Bring active section to front and make it fully opaque
    };

    // Update the zIndex and opacity for inactive sections
    sections.forEach((section) => {
      if (section !== activeSection) {
        updatedProps[section] = {
          ...updatedProps[section],
          zIndex: updatedProps[section].zIndex - 1, // Move back
          opacity: 0.5, // Fade
        };
      }
    });
  }, [activeSection]);

  const handleFormSubmit = (data: {
    name: string;
    email: string;
    message: string;
  }) => {
    console.log("Form Data:", data);

    setActiveSection("Home");
  };
  const isActiveSectionCorrectlySet = (section: string) =>
    activeSection === section;

  return (
    <>
      <BackgroundBeams />
      <div className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <Navbar
          sections={sections}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        <div className="sections-container flex flex-col st-top">
          <AnimatePresence>
            {isContactActive && (
              <motion.div
                className="fixed inset-0 z-40 flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="contactOverlay"
              >
                <div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={closeContactForm}
                ></div>
                <div className="z-50">
                  <ContactForm
                    onSubmit={handleFormSubmit}
                    onClose={closeContactForm}
                  />
                </div>
              </motion.div>
            )}

            <div className="flex pt-6">
              {activeSection === "Home" && (
                <div className="flex justify-center items-start client-table">
                  <ServiceTable
                    onContactClick={() => setActiveSection("Contact")}
                  />
                </div>
              )}

              {sections
                .filter(
                  (section) =>
                    section !== "Contact" &&
                    isActiveSectionCorrectlySet(section)
                )
                .map((section, index) => {
                  // Determine the videoSrc based on the section name
                  let videoSrc;
                  if (section === "Home") {
                    videoSrc = "/video/136259 (1080p).mp4";
                  }

                  return (
                    <Section
                      key={section}
                      id={section}
                      content={section}
                      isActive={activeSection === section}
                      color={sectionColors[index % sectionColors.length]}
                      zIndex={
                        activeSection === section
                          ? sections.length
                          : sections.length - index
                      }
                      videoSrc={videoSrc}
                      isContactFormActive={isContactActive}
                    />
                  );
                })}
            </div>
          </AnimatePresence>
        </div>
      </div>
      <FooterComponent />
    </>
  );
};

export default Home;
