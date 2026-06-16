"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, X, Thermometer, Zap } from "lucide-react"
import { useState } from "react"
import { useShipments } from "@/hooks/use-shipments"

interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  message: string
  time: string
  icon: React.ReactNode
}

const typeStyles = {
  critical: { border: "border-destructive/30", bg: "bg-destructive/5", dot: "bg-destructive", icon: "text-destructive", badge: "text-destructive border-destructive/30 bg-destructive/10" },
  warning: { border: "border-warning/30", bg: "bg-warning/5", dot: "bg-warning", icon: "text-warning", badge: "text-warning border-warning/30 bg-warning/10" },
  info: { border: "border-info/30", bg: "bg-info/5", dot: "bg-info", icon: "text-info", badge: "text-info border-info/30 bg-info/10" },
}

function getAlertsFromShipments(shipments: {
  id: string
  status: string
  is_delayed: boolean
  delay_reason: string | null
  carrier_name: string
  created_at: string
}[]): Alert[] {
  return shipments
    .filter((s) => s.is_delayed || s.status === "delayed")
    .slice(0, 5)
    .map((s) => {
      const diff = Date.now() - new Date(s.created_at).getTime()
      const minutes = Math.floor(diff / 60000)
      const timeAgo = minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`

      return {
        id: s.id,
        type: s.status === "delayed" ? "critical" : "warning",
        title: s.delay_reason || `Delayed Shipment`,
        message: `Shipment via ${s.carrier_name} is delayed`,
        time: timeAgo,
        icon: s.status === "delayed" ? <Thermometer className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />,
      }
    })
}

export function AlertsPanel() {
  const { data: shipments, loading } = useShipments()
  const [dismissed, setDismissed] = useState<string[]>([])

  const allAlerts: Alert[] = loading ? [] : getAlertsFromShipments(shipments ?? [])
  const visibleAlerts = allAlerts.filter((a) => !dismissed.includes(a.id))

  const dismissAlert = (id: string) => {
    setDismissed([...dismissed, id])
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Alerts</h3>
          <Badge variant="destructive" className="text-[10px] ml-1">
            {visibleAlerts.filter((a) => a.type === "critical").length} critical
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs">Dismiss All</Button>
      </div>
      <ScrollArea className="h-[340px]">
        <div className="space-y-1 p-2">
          <AnimatePresence>
            {visibleAlerts.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center py-8">No alerts - all systems running smoothly</p>
            )}
            {visibleAlerts.map((alert) => {
              const style = typeStyles[alert.type]
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                  className={cn("group relative flex items-start gap-3 rounded-lg border px-3 py-3 transition-all", style.border, style.bg)}
                >
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", `${style.bg} ${style.icon}`)}>
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{alert.title}</span>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", style.badge)}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{alert.time}</span>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="shrink-0 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}
