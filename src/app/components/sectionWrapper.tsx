"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";
import { ContentWrapper } from "../components/contentWrapper";
import PeopleSection from "@/app/components/peopleSection";
import AboutSection from "@/app/components/aboutSection";
import ServicesSection from "@/app/components/servicesSection";

interface SectionProps {
  id: string;
  content: string;
  isActive: boolean;
  color: string;
  zIndex: number;
  videoSrc?: string;
  isContactFormActive: boolean;
}

const getSectionVariants = (isContactFormActive: boolean) => ({
  inactive: isContactFormActive
    ? {
        opacity: 1,
        scale: 1,
        y: 0,
        zIndex: 6,
      }
    : {
        y: -40,
        opacity: 0.7,
        scale: 0.95,
        zIndex: 6,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
  active: {
    y: 0,
    opacity: 1,
    scale: 1,
    zIndex: 6,
    transition: {
      y: {
        duration: 0.2,
        type: "spring",
        from: "40vh",
        stiffness: 70,
        damping: 15,
      },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  },
  exit: {
    y: 50,
    opacity: 0,
    transition: { duration: 0.5 },
  },
});

const SectionWrapper: React.FC<SectionProps> = ({
  id,
  content,
  isActive,
  color,
  zIndex,
  videoSrc,
  isContactFormActive,
}) => {
  const controls = useAnimation();
  const sectionVariants = getSectionVariants(isContactFormActive);

  useEffect(() => {
    controls.start(isActive ? "active" : "inactive");
  }, [isActive, controls, isContactFormActive]);

  return (
    <motion.div
      layoutId={id}
      variants={sectionVariants}
      initial="initial"
      animate={controls}
      exit="exit"
      transition={{ duration: 0.5, type: "easeOut" }}
      className={`section border-2 border-green-600 rounded-tl-3xl rounded-tr-3xl shadow-lg ${color} responsive-section`}
      style={{
        position: "absolute",
        width: "75%",
        top: 100,
        right: 0,
        bottom: 0,
        boxSizing: "border-box",
        zIndex: zIndex,
      }}
    >
      {id === "People" ? (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <PeopleSection isActive={isActive} />
        </div>
      ) : id === "About" ? (
        <AboutSection />
      ) : id === "Services" ? (
        <ServicesSection />
      ) : videoSrc ? (
        <div className="w-full h-full">
          <video
            className="video w-full h-full overflow-hidden rounded-tl-3xl rounded-tr-3xl object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="flex overlay-text lg:bottom-48 p-4 lg:relative md:flex ">
            <h2 className="lg:text-4xl font-bold text-white p-4 bg-black bg-opacity-50 rounded-lg sm:text-lg">
              We enable Collaborators
              <br /> to create delightful technical solutions
            </h2>
          </div>
        </div>
      ) : (
        <ContentWrapper isActive={isActive}>
          <h2 className="text-2xl font-bold mb-4">{content}</h2>
          <p className="text-gray-700">
            Placeholder content for the {content} section.
          </p>
        </ContentWrapper>
      )}
    </motion.div>
  );
};

export default SectionWrapper;
