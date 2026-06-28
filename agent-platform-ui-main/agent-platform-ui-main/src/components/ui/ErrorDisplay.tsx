"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ message = "Something went wrong", onRetry, className }: ErrorDisplayProps) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 0.5 }}
      >
        <AlertCircle className="h-8 w-8 text-destructive" />
      </motion.div>
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </motion.button>
      )}
    </motion.div>
  )
}
