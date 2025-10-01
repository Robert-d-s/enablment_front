"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import NavBar from "@/app/components/navBar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import ContactForm from "@/app/components/landingPage/contactForm";
import ClientColab from "@/app/components/landingPage/clientColab";
import Footer from "@/app/components/footer";
import SectionAnimation from "@/app/components/landingPage/sectionAnimation";
import { useNavigationStore } from "@/app/lib/navigationStore";

const Home: NextPage = () => {
  const {
    sections,
    activeSection,
    navigationDirection,
    navigateToSection,
    closeContactForm: storeCloseContactForm,
  } = useNavigationStore();

  const isContactActive = activeSection === "Contact";

  const closeContactForm = () => {
    storeCloseContactForm();
  };

  const handleFormSubmit = (data: {
    name: string;
    email: string;
    message: string;
  }) => {
    console.log("Form Data:", data);
    storeCloseContactForm();
  };

  return (
    <>
      <BackgroundBeams />
      <div className="relative z-10">
        <div className="relative overflow-hidden min-h-screen">
          <NavBar />

          {/* Contact form overlay */}
          <AnimatePresence>
            {isContactActive && (
              <ContactForm
                onSubmit={handleFormSubmit}
                onClose={closeContactForm}
              />
            )}
          </AnimatePresence>

          {/* Full-screen section content */}
          <div className="relative w-full min-h-screen pt-16">
            <AnimatePresence mode="wait">
              {sections.map((section) => {
                if (section === "Contact") {
                  return null;
                }
                let videoSrc;
                if (section === "Home") {
                  videoSrc = "/video/hero_vid.mp4";
                }

                // Only render active section
                return (
                  activeSection === section && (
                    <SectionAnimation
                      key={section}
                      section={section}
                      navigationDirection={navigationDirection}
                      videoSrc={videoSrc}
                    />
                  )
                );
              })}
            </AnimatePresence>

            {/* ClientColab expandable compartment - only show on Home section */}
            <AnimatePresence>
              {activeSection === "Home" && (
                <motion.div
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 z-30"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ClientColab
                    onContactClick={() =>
                      navigateToSection("Contact", sections)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Home;
