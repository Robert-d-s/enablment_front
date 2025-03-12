"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useEffect, PropsWithChildren } from "react";

interface ContentWrapperProps {
  isActive: boolean;
}

export const ContentWrapper: React.FC<
  PropsWithChildren<ContentWrapperProps>
> = ({ isActive, children }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(isActive ? "visible" : "hidden");
  }, [isActive, controls]);

  const contentVariants = {
    visible: {
      opacity: 1,
      maxHeight: "1000px",
      overflow: "hidden",
      transition: { duration: 0.5 },
    },
    hidden: {
      opacity: 0,
      maxHeight: 0, // Collapse content area when hidden
      overflow: "hidden",
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div variants={contentVariants} animate={controls} initial="hidden">
      {children}
    </motion.div>
  );
};
