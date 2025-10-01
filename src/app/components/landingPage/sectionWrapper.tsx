"use client";

import React from "react";
import PeopleSection from "@/app/components/landingPage/peopleSection";
import AboutSection from "@/app/components/landingPage/aboutSection";
import ServicesSection from "@/app/components/landingPage/servicesSection";

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
        <div className="w-full h-full relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
          <video
            className="video w-full h-full overflow-hidden rounded-tl-3xl rounded-tr-3xl object-cover absolute inset-0"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center md:justify-start md:items-end p-4 md:p-8 lg:p-12">
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-white p-4 md:p-6 bg-black bg-opacity-60 rounded-lg text-center md:text-left max-w-2xl">
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
