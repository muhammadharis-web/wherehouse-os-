"use client"

import { useSettings } from "@/contexts/SettingsContext"
import { Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { settings, updateSetting } = useSettings()
  const isDark = settings.theme === "dark"

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => updateSetting("theme", isDark ? "light" : "dark")}
      className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-background/70 text-muted-foreground shadow-lg backdrop-blur-xl transition-colors hover:text-foreground hover:bg-muted/50 max-lg:hidden"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
