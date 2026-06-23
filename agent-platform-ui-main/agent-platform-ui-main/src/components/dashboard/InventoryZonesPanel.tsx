"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package } from "lucide-react"
import { useFulfillmentCenters } from "@/hooks/use-fulfillment-centers"

interface Zone {
  id: string
  name: string
  status: "optimal" | "warning" | "critical"
  utilization: number
  items: number
  agents: number
}

const statusColors = {
  optimal: "text-success border-success/30 bg-success/10",
  warning: "text-warning border-warning/30 bg-warning/10",
  critical: "text-destructive border-destructive/30 bg-destructive/10",
}
const statusBarColors = {
  optimal: "bg-gradient-to-r from-success to-success/60",
  warning: "bg-gradient-to-r from-warning to-warning/60",
  critical: "bg-gradient-to-r from-destructive to-destructive/60",
}

export function InventoryZonesPanel() {
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const { data: centers, loading } = useFulfillmentCenters()

  const zones: Zone[] = loading
    ? []
    : (centers ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        status: c.capacity_pct >= 90 ? ("critical" as const) : c.capacity_pct >= 75 ? ("warning" as const) : ("optimal" as const),
        utilization: c.capacity_pct,
        items: c.current_daily_orders,
        agents: Math.ceil(c.current_daily_orders / (c.max_daily_orders || 1) * 5) || 1,
      }))

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Inventory Zones</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">{zones.length} zones</Badge>
      </div>
      <div className="divide-y divide-border/30">
        {zones.map((zone, i) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onMouseEnter={() => setActiveZone(zone.id)}
            onMouseLeave={() => setActiveZone(null)}
            className={cn("relative px-5 py-3.5 transition-all duration-200 cursor-pointer", activeZone === zone.id && "bg-muted/30")}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <MapPin
                  className={cn(
                    "h-3.5 w-3.5",
                    zone.status === "optimal" && "text-success",
                    zone.status === "warning" && "text-warning",
                    zone.status === "critical" && "text-destructive"
                  )}
                />
                <span className="text-sm font-medium text-foreground">{zone.name}</span>
              </div>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", statusColors[zone.status])}>
                {zone.status}
              </span>
            </div>
            <div className="flex items-center gap-3 pl-5.5">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${zone.utilization}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", statusBarColors[zone.status])}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground w-8 text-right">{zone.utilization}%</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 pl-5.5">
              <span className="text-[11px] text-muted-foreground">{zone.items.toLocaleString()} orders</span>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] text-muted-foreground">{zone.agents} agents</span>
            </div>
          </motion.div>
        ))}
        {!loading && zones.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No fulfillment centers found</p>
        )}
      </div>
    </div>
  )
}
