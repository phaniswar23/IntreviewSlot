import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0, hoverEffect = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-panel rounded-3xl p-6 sm:p-8 ${
        hoverEffect ? "glass-panel-hover" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
