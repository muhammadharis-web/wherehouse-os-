import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import OrdersPage from "@/app/dashboard/orders/page"

const mockOrders = [
  { id: "ord-001", external_order_id: null, customer_email: "ahmed@example.com", customer_phone: null, shipping_address: "123 Main St", shipping_zip: "10001", shipping_city: "New York", shipping_state: "NY", shipping_country: "US", items_json: "[]", total_weight_kg: 3.0, status: "pending", fulfillment_center_id: null, carrier_id: null, tracking_number: null, estimated_delivery: null, shipping_cost: null, notes: null, created_at: "2026-06-14T10:00:00Z", updated_at: "2026-06-14T10:00:00Z" },
  { id: "ord-002", external_order_id: null, customer_email: "fatima@example.com", customer_phone: null, shipping_address: "456 Oak Ave", shipping_zip: "90210", shipping_city: "Los Angeles", shipping_state: "CA", shipping_country: "US", items_json: "[]", total_weight_kg: 5.0, status: "shipped", fulfillment_center_id: null, carrier_id: null, tracking_number: "TRK-ABC", estimated_delivery: "2026-06-20", shipping_cost: 25.0, notes: null, created_at: "2026-06-13T10:00:00Z", updated_at: "2026-06-14T10:00:00Z" },
]

const mockUseOrders = vi.fn()

vi.mock("@/hooks/use-orders", () => ({
  useOrders: (...args: any[]) => mockUseOrders(...args),
}))

describe("Category 2: Orders Page", () => {
  beforeEach(() => {
    mockUseOrders.mockReturnValue({ data: { orders: mockOrders, total: 2 }, loading: false, error: null, refetch: vi.fn() })
  })

  it("Test 7: Orders page renders with table", () => {
    render(<OrdersPage />)
    expect(screen.getByText("Orders")).toBeInTheDocument()
    expect(screen.getByText("Manage and track all customer orders")).toBeInTheDocument()
  })

  it("Test 8: Orders load from API and display", () => {
    render(<OrdersPage />)
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument()
    expect(screen.getByText("fatima@example.com")).toBeInTheDocument()
    expect(screen.getByText("2 total")).toBeInTheDocument()
  })

  it("Test 9: Empty state message when no orders", () => {
    mockUseOrders.mockReturnValue({ data: { orders: [], total: 0 }, loading: false, error: null, refetch: vi.fn() })
    render(<OrdersPage />)
    expect(screen.getByText("No orders yet")).toBeInTheDocument()
  })

  it("Test 10: Loading skeleton when data is loading", () => {
    mockUseOrders.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() })
    render(<OrdersPage />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("Test 11: Error state when API fails", () => {
    mockUseOrders.mockReturnValue({ data: null, loading: false, error: "Failed to fetch", refetch: vi.fn() })
    render(<OrdersPage />)
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument()
  })

  it("Test 12: Status badges render for each order", () => {
    render(<OrdersPage />)
    expect(screen.getByText("pending")).toBeInTheDocument()
    expect(screen.getByText("shipped")).toBeInTheDocument()
  })

  it("Test 13: Refresh button refetches orders", () => {
    const refetch = vi.fn()
    mockUseOrders.mockReturnValue({ data: { orders: mockOrders, total: 2 }, loading: false, error: null, refetch })
    render(<OrdersPage />)
    fireEvent.click(screen.getByText("Refresh"))
    expect(refetch).toHaveBeenCalled()
  })

  it("Test 14: Total order count badge in header", () => {
    render(<OrdersPage />)
    expect(screen.getByText("2 total")).toBeInTheDocument()
  })
})
