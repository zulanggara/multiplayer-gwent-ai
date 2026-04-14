"use client";

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Props {
  value: number;
  className?: string;
}

/**
 * Renders a numeric score with a tiny flip animation when the value changes.
 * Each distinct value renders as its own motion element so AnimatePresence
 * can cross-fade old and new.
 */
export function AnimatedScore({ value, className }: Props) {
  return (
    <div className={clsx("relative inline-flex", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -6, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 6, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
