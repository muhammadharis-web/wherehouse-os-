"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string; value: string; change: string; trend: "up" | "down"
  icon: React.ReactNode; index?: number
}

function AnimatedValue({ value }: { value: string }) {
  const num = parseFloat(value.replace(/[$,%]/g, ""))
  const suffix = value.includes("%") ? "%" : value.includes("$") ? "" : ""
  const prefix = value.startsWith("$") ? "$" : ""
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isNaN(num)) { setDisplay(0); return }
    const duration = 1200
    const steps = 30
    const increment = num / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= num) {
        setDisplay(num)
        clearInterval(interval)
      } else {
        setDisplay(current)
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [num])

  if (isNaN(num)) return <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>

  return (
    <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
      {prefix}{display.toLocaleString(undefined, { maximumFractionDigits: 1 })}{suffix}
    </span>
  )
}

export function MetricCard({ title, value, change, trend, icon, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative rounded-xl glass-card p-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent pointer-events-none"
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">{title}</p>
          <AnimatedValue value={value} />
          <div className="flex items-center gap-1.5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
            </motion.div>
            <span className={cn("text-xs font-semibold", trend === "up" ? "text-success" : "text-destructive")}>{change}</span>
            <span className="text-[11px] text-muted-foreground">vs last hour</span>
          </div>
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex h-10 w-10 items-center justify-center rounded-lg glass-card-strong text-muted-foreground transition-all duration-300 group-hover:text-accent group-hover:shadow-accent/20 group-hover:shadow-lg"
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  )
}
