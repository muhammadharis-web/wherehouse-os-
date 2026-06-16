"use client"

import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp } from "lucide-react"
import { useCarrierAnalytics, useKPIs } from "@/hooks/use-analytics"

export function AnalyticsCharts() {
  const { data: carriers, loading: carriersLoading } = useCarrierAnalytics()
  const { data: kpis, loading: kpisLoading } = useKPIs()

  const loading = carriersLoading || kpisLoading

  const barData = loading
    ? []
    : (carriers ?? []).map((c) => ({
        label: c.carrier_name.length > 6 ? c.carrier_name.slice(0, 6) : c.carrier_name,
        inbound: c.total_shipments,
        outbound: c.on_time_shipments,
        accuracy: c.on_time_rate,
      }))

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Analytics</h3>
        </div>
        <Tabs defaultValue="7d" className="h-7">
          <TabsList className="h-7 p-0.5">
            <TabsTrigger value="24h" className="text-[10px] px-2 py-1 h-full">24H</TabsTrigger>
            <TabsTrigger value="7d" className="text-[10px] px-2 py-1 h-full">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-[10px] px-2 py-1 h-full">30D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[11px] text-muted-foreground">Total Shipments</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {loading ? "--" : (kpis?.total_orders ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-[11px] text-success font-medium">
                  {loading ? "--" : `${(kpis?.on_time_delivery_rate ?? 0).toFixed(1)}% on-time`}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[11px] text-muted-foreground">Delivered</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {loading ? "--" : (kpis?.orders_delivered ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-[11px] text-success font-medium">
                  {loading ? "--" : `${(kpis?.avg_delivery_time_days ?? 0).toFixed(1)}d avg`}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-[11px] text-muted-foreground">Failed Rate</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {loading ? "--" : `${(kpis?.failed_delivery_rate ?? 0).toFixed(1)}%`}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-[11px] text-success font-medium">
                  {loading ? "--" : `${kpis?.orders_delayed ?? 0} delayed`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Loading analytics...</span>
            </div>
          ) : barData.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No carrier data available</span>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1.5 h-48">
              {barData.map((d, i) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex gap-0.5 w-full h-full items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.inbound / (Math.max(...barData.map((x) => x.inbound)) || 1)) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                      className="flex-1 rounded-t-sm bg-accent/60"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.outbound / (Math.max(...barData.map((x) => x.outbound)) || 1)) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                      className="flex-1 rounded-t-sm bg-primary/60"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
