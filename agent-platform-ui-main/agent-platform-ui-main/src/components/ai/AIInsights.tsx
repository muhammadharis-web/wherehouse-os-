"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  metric: string
  insight: string
  severity: "info" | "warning" | "critical"
}

const severityConfig = {
  info: { icon: Info, color: "text-info", bg: "bg-info/10", border: "border-info/20" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  critical: { icon: TrendingUp, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/ai/insight", {
          method: "POST",
          body: JSON.stringify({ data: { agents: 24, orders: 8421, uptime: 99.97, latency: 47 } }),
        })
        const data = await res.json()
        setInsights(data.insights || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  if (loading) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
      </div>
      <div className="grid gap-2">
        {insights.map((insight, i) => {
          const config = severityConfig[insight.severity]
          const Icon = config.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn("flex items-start gap-3 rounded-xl border p-3", config.border, config.bg)}
            >
              <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
              <div>
                <p className="text-xs font-medium text-foreground">{insight.metric}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{insight.insight}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
