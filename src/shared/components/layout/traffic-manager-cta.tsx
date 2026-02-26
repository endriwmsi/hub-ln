"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSidebar } from "@/shared/components/ui/sidebar";

export function TrafficManagerCTA() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="relative mx-2 mb-0 overflow-hidden rounded-xl group"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500" />
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: [
            "linear-gradient(0deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)",
            "linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)",
            "linear-gradient(240deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)",
            "linear-gradient(360deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        style={{
          padding: "2px",
        }}
      >
        <div className="h-full w-full rounded-xl bg-background" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 p-4 rounded-xl bg-linear-to-br from-purple-50/90 via-pink-50/80 to-orange-50/90 dark:from-purple-950/50 dark:via-pink-950/30 dark:to-orange-950/50 backdrop-blur-xl border border-purple-200/50 dark:border-white/5">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-5">
          <svg width="100%" height="100%" aria-hidden="true">
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/15 dark:bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="relative space-y-3">
          {/* Icon */}
          {/* <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 dark:border-purple-500/30"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <IconSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </motion.div> */}

          {/* Text */}
          <div className="space-y-1">
            <motion.h3
              className="text-sm font-bold bg-linear-to-r from-purple-700 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 100%",
              }}
            >
              Precisa de um Gestor de Tráfego?
            </motion.h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              Torne-se parceiro e tenha diversos benefícios!
            </p>
          </div>

          {/* CTA Button */}
          <motion.button
            className="w-full py-2 px-3 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 60px -15px rgba(168, 85, 247, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/gestor" className="w-full h-full">
              <span className="flex items-center justify-center gap-1.5">
                Saiba mais
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  →
                </motion.span>
              </span>
            </Link>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
