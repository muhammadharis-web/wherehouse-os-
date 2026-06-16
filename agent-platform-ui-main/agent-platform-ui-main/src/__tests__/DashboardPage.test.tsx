import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import DashboardPage from "@/app/dashboard/page"

vi.mock("@/hooks/use-analytics", () => ({
  useKPIs: () => ({
    data: { total_orders: 8421, orders_shipped: 3200, orders_delivered: 2800, orders_delayed: 45, on_time_delivery_rate: 94.2, avg_shipping_cost: 24.50, total_shipping_cost: 205800.00 },
    loading: false, error: null, refetch: vi.fn(),
  }),
  useCarrierAnalytics: () => ({ data: [], loading: false, error: null }),
}))

vi.mock("@/hooks/use-orders", () => ({
  useOrders: () => ({
    data: { orders: [], total: 0 },
    loading: false, error: null, refetch: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-agents", () => ({
  useAgentMonitor: () => ({
    data: { cycle_id: "cyc-001", shipments_checked: 150, delays_detected: 12, reroutes_initiated: 3, notifications_sent: 24, anomalies_found: 2, events: [], completed_at: "2026-06-15T10:00:00Z" },
    loading: false, error: null, refetch: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-shipments", () => ({
  useShipments: () => ({ data: [], loading: false, error: null }),
}))

describe("Category 1: Dashboard Overview", () => {
  it("Test 1: Dashboard renders correctly", () => {
    render(<DashboardPage />)
    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByText("Real-time warehouse intelligence and agent coordination")).toBeInTheDocument()
  })

  it("Test 2: Metrics panel shows KPIs", () => {
    render(<DashboardPage />)
    expect(screen.getByText("Active Agents")).toBeInTheDocument()
    expect(screen.getByText("Orders Processed")).toBeInTheDocument()
    expect(screen.getByText("On-Time Delivery")).toBeInTheDocument()
    expect(screen.getByText("Avg Shipping Cost")).toBeInTheDocument()
  })

  it("Test 3: Agent status grid loads", () => {
    render(<DashboardPage />)
    expect(screen.getByText("Agent Status")).toBeInTheDocument()
  })

  it("Test 4: Live badge renders", () => {
    render(<DashboardPage />)
    const liveBadges = screen.getAllByText("Live")
    expect(liveBadges.length).toBeGreaterThan(0)
  })

  it("Test 5: Alerts panel renders", () => {
    render(<DashboardPage />)
    const alertHeaders = screen.getAllByText("Alerts")
    expect(alertHeaders.length).toBeGreaterThan(0)
  })

  it("Test 6: Sync button works", () => {
    render(<DashboardPage />)
    const syncButton = screen.getByText("Sync")
    expect(syncButton).toBeInTheDocument()
    fireEvent.click(syncButton)
    expect(screen.getByText("Syncing...")).toBeInTheDocument()
  })
})
