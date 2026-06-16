"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { useAgentMonitor } from "@/hooks/use-agents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, RefreshCw, Search, Filter, Loader2 } from "lucide-react"

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { data: monitorData, loading, refetch } = useAgentMonitor()

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    refetch()
  }

  return (
    <div className="space-y-8" key={refreshKey}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Agents</h1>
              <p className="text-sm text-muted-foreground">Manage and monitor all warehouse agents</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[160px] text-sm">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 text-xs rounded-xl"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Agent Status</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-subtle" />
              Live
            </Badge>
          </div>
        </div>
        <ErrorBoundary>
          <AgentStatusGrid key={refreshKey} />
        </ErrorBoundary>
      </div>
    </div>
  )
}