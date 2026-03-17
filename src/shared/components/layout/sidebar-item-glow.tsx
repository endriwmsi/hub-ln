import { AnimatePresence, motion } from "framer-motion";

export function SidebarItemGlow({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-md overflow-hidden flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Wide gradient from right to transparent */}
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-linear-to-l from-violet-700/40 via-violet-600/12 to-transparent" />

          {/* Soft bloom behind the bar */}
          <div className="absolute -right-3 top-0 bottom-0 w-10 bg-violet-600/25 blur-md" />

          {/* Bright edge bar */}
          <div
            className="absolute -right-0.5 rounded-lg w-1 h-5 bg-linear-to-b from-violet-300/90 via-white/90 to-violet-300/90"
            style={{
              boxShadow:
                "0 0 4px 1px rgba(196,181,253,0.95), 0 0 12px 3px rgba(139,92,246,0.7), 0 0 28px 7px rgba(109,40,217,0.4)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
