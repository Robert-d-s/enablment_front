"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/app/components/sectionWrapper";

interface SectionAnimationProps {
  section: string;
  navigationDirection: "forward" | "backward";
  videoSrc?: string;
}

const SectionAnimation: React.FC<SectionAnimationProps> = ({
  section,
  navigationDirection,
  videoSrc,
}) => {
  return (
    <motion.div
      key={section}
      className="w-full"
      initial={{
        opacity: 0,
        x: navigationDirection === "forward" ? 100 : -100,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: navigationDirection === "forward" ? -100 : 100,
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 1,
      }}
    >
      <SectionWrapper
        id={section}
        content={section}
        color={"bg-gray-200"}
        videoSrc={videoSrc}
      />
    </motion.div>
  );
};

export default SectionAnimation;
