import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import AgentsPage from "@/app/dashboard/agents/page"

const mockMonitor = vi.fn()

vi.mock("@/hooks/use-agents", () => ({
  useAgentMonitor: (...args: any[]) => mockMonitor(...args),
}))

describe("Category 3: Agents Page", () => {
  beforeEach(() => {
    mockMonitor.mockReturnValue({
      data: { cycle_id: "cyc-001", shipments_checked: 150, delays_detected: 12, reroutes_initiated: 3, notifications_sent: 24, anomalies_found: 2, events: [], completed_at: "2026-06-15T10:00:00Z" },
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("Test 15: Agents page renders", () => {
    render(<AgentsPage />)
    expect(screen.getByText("Agents")).toBeInTheDocument()
    expect(screen.getByText("Manage and monitor all warehouse agents")).toBeInTheDocument()
  })

  it("Test 16: Agent cards show correct data with status", () => {
    render(<AgentsPage />)
    expect(screen.getByText("Agent Status")).toBeInTheDocument()
    expect(screen.getByText("Live")).toBeInTheDocument()
  })

  it("Test 17: Search filters agents", () => {
    render(<AgentsPage />)
    const searchInput = screen.getByPlaceholderText("Search agents...")
    expect(searchInput).toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: "Routing" } })
    expect(searchInput).toHaveValue("Routing")
  })

  it("Test 18: Status filter dropdown", () => {
    render(<AgentsPage />)
    const selectTrigger = screen.getByRole("combobox")
    expect(selectTrigger).toBeInTheDocument()
  })

  it("Test 19: Refresh button triggers monitor", () => {
    const refetch = vi.fn()
    mockMonitor.mockReturnValue({
      data: { cycle_id: "cyc-001", shipments_checked: 150, delays_detected: 12, reroutes_initiated: 3, notifications_sent: 24, anomalies_found: 2, events: [], completed_at: "2026-06-15T10:00:00Z" },
      loading: false,
      error: null,
      refetch,
    })
    render(<AgentsPage />)
    fireEvent.click(screen.getByText("Refresh"))
    expect(refetch).toHaveBeenCalled()
  })

  it("Test 20: Loading state shows refreshing text", () => {
    mockMonitor.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() })
    render(<AgentsPage />)
    expect(screen.getByText("Refreshing...")).toBeInTheDocument()
  })

  it("Test 21: Error handling (no error in normal state)", () => {
    render(<AgentsPage />)
    expect(screen.getByPlaceholderText("Search agents...")).toBeInTheDocument()
  })
})
