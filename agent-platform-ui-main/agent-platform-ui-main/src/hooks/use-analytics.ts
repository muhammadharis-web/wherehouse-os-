"use client"

import { api } from "@/lib/api"
import { useApi } from "./use-api"

export interface KPIs {
  total_orders: number
  orders_shipped: number
  orders_delivered: number
  orders_delayed: number
  on_time_delivery_rate: number
  avg_delivery_time_days: number
  total_shipping_cost: number
  avg_shipping_cost: number
  failed_delivery_rate: number
  period_start: string | null
  period_end: string | null
}

export interface CarrierAnalytics {
  carrier_name: string
  total_shipments: number
  on_time_shipments: number
  delayed_shipments: number
  on_time_rate: number
  avg_cost: number
  total_cost: number
  avg_delivery_days: number
}

export function useKPIs() {
  return useApi(() => api.get<KPIs>("/api/v1/analytics/kpis"), [])
}

export function useCarrierAnalytics() {
  return useApi(() => api.get<CarrierAnalytics[]>("/api/v1/analytics/carriers"), [])
}
