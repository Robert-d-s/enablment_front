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
      <div className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <NavBar /> {/* Contact form overlay */}
        <AnimatePresence>
          {isContactActive && (
            <ContactForm
              onSubmit={handleFormSubmit}
              onClose={closeContactForm}
            />
          )}
        </AnimatePresence>
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
                    onContactClick={() =>
                      navigateToSection("Contact", sections)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main section content - Take 9 columns on the right */}
          <div className="col-span-9 relative">
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
