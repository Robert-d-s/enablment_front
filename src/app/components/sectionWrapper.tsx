"use client";

import React from "react";
import PeopleSection from "@/app/components/peopleSection";
import AboutSection from "@/app/components/aboutSection";
import ServicesSection from "@/app/components/servicesSection";

interface SectionProps {
  id: string;
  content: string;
  color: string;
  videoSrc?: string;
}

const SectionWrapper: React.FC<SectionProps> = ({
  id,
  content,
  color,
  videoSrc,
}) => {
  return (
    <div
      className={`section border-2 border-green-600 rounded-tl-3xl rounded-tr-3xl shadow-lg ${color} responsive-section`}
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {id === "People" ? (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <PeopleSection isActive={true} />
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
        <>
          <h2 className="text-2xl font-bold mb-4">{content}</h2>
          <p className="text-gray-700">
            Placeholder content for the {content} section.
          </p>
        </>
      )}
    </div>
  );
};

export default SectionWrapper;
