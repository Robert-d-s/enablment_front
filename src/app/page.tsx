"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import NavBar from "@/app/components/navBar";
import SectionWrapper from "@/app/components/sectionWrapper";
import { BackgroundBeams } from "@/app/components/ui/background-beams";
import ContactForm from "@/app/components/contactForm";
import ClientColab from "@/app/components/clientColab";
import Footer from "@/app/components/footer";

const Home: NextPage = () => {
  const sections = [
    "Home",
    "About",
    "Services",
    "People",
    "Contact",
    "Client-Portal",
  ];

  const [activeSection, setActiveSection] = useState<string>(sections[0]);
  const isContactActive = activeSection === "Contact";

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
        zIndex: sections.length - index,
        opacity: section === "Home" ? 1 : 0.5,
      };
      return acc;
    }, {} as SectionProps)
  );

  const sectionColors = ["bg-gray-200"];

  useEffect(() => {
    // Update sectionProps when activeSection changes
    const updatedProps = {
      ...sectionProps,
      [activeSection]: {
        ...sectionProps[activeSection],
        zIndex: sections.length,
        opacity: 1,
      },
    };

    // Update the zIndex and opacity for inactive sections
    sections.forEach((section) => {
      if (section !== activeSection) {
        updatedProps[section] = {
          ...updatedProps[section],
          zIndex: updatedProps[section].zIndex - 1,
          opacity: 0.5,
        };
      }
    });

    setSectionProps(updatedProps);
  }, [activeSection]);

  const handleFormSubmit = (data: {
    name: string;
    email: string;
    message: string;
  }) => {
    console.log("Form Data:", data);
    setActiveSection("Home");
  };

  return (
    <>
      <BackgroundBeams />
      <div className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <NavBar
          sections={sections}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        {/* Contact form overlay */}
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
        </AnimatePresence>

        {/* Main content container - Use CSS grid to position components */}
        <div className="grid grid-cols-12 pt-6" style={{ minHeight: "60vh" }}>
          {/* Client collaboration component for Home section - Take 3 columns on the left */}
          <div className="col-span-3">
            <AnimatePresence>
              {activeSection === "Home" && (
                <motion.div
                  className="flex justify-center items-start client-table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ClientColab
                    onContactClick={() => setActiveSection("Contact")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main section content - Take 9 columns on the right */}
          <div className="col-span-9 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {sections
                .filter((section) => section !== "Contact")
                .map((section) => {
                  // Determine the videoSrc based on the section name
                  let videoSrc;
                  if (section === "Home") {
                    videoSrc = "/video/136259 (1080p).mp4";
                  }

                  // Only render active section
                  return (
                    activeSection === section && (
                      <motion.div
                        key={section}
                        className="w-full"
                        initial={{ opacity: 0, x: 50 }} // Change y to x for horizontal animation
                        animate={{ opacity: 1, x: 0 }} // Animate from right to position
                        exit={{ opacity: 0, x: -50 }} // Exit to left
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        style={{
                          zIndex: sectionProps[section].zIndex,
                        }}
                      >
                        <SectionWrapper
                          id={section}
                          content={section}
                          isActive={true}
                          color={sectionColors[0]}
                          zIndex={sectionProps[section].zIndex}
                          videoSrc={videoSrc}
                          isContactFormActive={isContactActive}
                        />
                      </motion.div>
                    )
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
