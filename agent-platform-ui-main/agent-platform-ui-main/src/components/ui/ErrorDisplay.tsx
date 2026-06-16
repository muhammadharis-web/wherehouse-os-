"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ message = "Something went wrong", onRetry, className }: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  )
}
