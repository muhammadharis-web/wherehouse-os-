"use client"

import { api } from "@/lib/api"
import { useApi } from "./use-api"

export interface MonitorResponse {
  cycle_id: string
  shipments_checked: number
  delays_detected: number
  reroutes_initiated: number
  notifications_sent: number
  anomalies_found: number
  events: Record<string, unknown>[]
  completed_at: string
}

export function useAgentMonitor() {
  return useApi(() => api.post<MonitorResponse>("/api/v1/agents/monitor"), [])
}
