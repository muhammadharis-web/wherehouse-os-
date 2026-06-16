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
    <span className="text-2xl font-bold tracking-tight text-foreground">
      {prefix}{display.toLocaleString(undefined, { maximumFractionDigits: 1 })}{suffix}
    </span>
  )
}

export function MetricCard({ title, value, change, trend, icon, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300 hover:border-accent/20 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.08)]"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <AnimatedValue value={value} />
          <div className="flex items-center gap-1">
            {trend === "up" ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
            <span className={cn("text-xs font-medium", trend === "up" ? "text-success" : "text-destructive")}>{change}</span>
            <span className="text-xs text-muted-foreground">vs last hour</span>
          </div>
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-muted-foreground transition-colors group-hover:border-accent/30 group-hover:text-accent"
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  )
}
