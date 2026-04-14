"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  log: string[];
}

export function GameLog({ log }: Props) {
  return (
    <div className="panel-leather rounded p-2 w-full max-w-sm max-h-48 overflow-y-auto text-[11px] text-amber-100/85 space-y-0.5 font-serif">
      <div className="text-amber-300 font-display text-xs tracking-widest mb-1">
        EVENT LOG
      </div>
      <AnimatePresence initial={false}>
        {log
          .slice()
          .reverse()
          .slice(0, 30)
          .map((line, i) => (
            <motion.div
              key={`${log.length - i}-${line}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="leading-snug"
            >
              › {line}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
