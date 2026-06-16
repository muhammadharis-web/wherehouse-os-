"use client"

import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { MetricsPanel } from "@/components/dashboard/MetricsPanel"
import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid"
import { ActivityLog } from "@/components/dashboard/ActivityLog"
import { WorkflowPanel } from "@/components/dashboard/WorkflowPanel"
import { TaskQueuePanel } from "@/components/dashboard/TaskQueuePanel"
import { AlertsPanel } from "@/components/dashboard/AlertsPanel"
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts"
import { InventoryZonesPanel } from "@/components/dashboard/InventoryZonesPanel"
import { FlowVisualization } from "@/components/dashboard/FlowVisualization"
import { TiltCard } from "@/components/effects/TiltCard"
import { RotatingBorder } from "@/components/effects/RotatingBorder"
import { AIInsights } from "@/components/ai/AIInsights"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { LayoutDashboard, RefreshCw, Sparkles } from "lucide-react"

function PanelSkeleton() {
  return <SkeletonCard className="h-64" />
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2000)
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Overview</h1>
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Real-time warehouse intelligence and agent coordination</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-xl" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync"}
        </Button>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <ErrorBoundary>
          <Suspense fallback={<PanelSkeleton />}>
            <MetricsPanel />
          </Suspense>
        </ErrorBoundary>
      </motion.div>

      <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <AIInsights />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <h2 className="text-sm font-semibold text-foreground">Agent Status</h2>
          </div>
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <RotatingBorder className="rounded-xl">
                <div className="rounded-xl bg-card/80 backdrop-blur-sm">
                  <AgentStatusGrid />
                </div>
              </RotatingBorder>
            </Suspense>
          </ErrorBoundary>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Alerts</h2>
        <ErrorBoundary>
          <Suspense fallback={<PanelSkeleton />}>
            <TiltCard intensity={5}>
              <AlertsPanel />
            </TiltCard>
          </Suspense>
        </ErrorBoundary>
      </motion.div>

      <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Analytics</h2>
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <TiltCard intensity={4}>
                <AnalyticsCharts />
              </TiltCard>
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Inventory Zones</h2>
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <RotatingBorder className="rounded-xl">
                <div className="rounded-xl bg-card/80 backdrop-blur-sm">
                  <InventoryZonesPanel />
                </div>
              </RotatingBorder>
            </Suspense>
          </ErrorBoundary>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Task Queue</h2>
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <TaskQueuePanel />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Workflows</h2>
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <WorkflowPanel />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Activity Log</h2>
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              <ActivityLog />
            </Suspense>
          </ErrorBoundary>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Flow Map</h2>
        <ErrorBoundary>
          <Suspense fallback={<PanelSkeleton />}>
            <FlowVisualization />
          </Suspense>
        </ErrorBoundary>
      </motion.div>
    </motion.div>
  )
}
