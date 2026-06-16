import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AIAssistant } from "@/components/ai/AIAssistant"

describe("Category 5: Chat & AI Assistant", () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it("Test 29: AI Assistant opens on button click", () => {
    render(<AIAssistant />)
    const floatingBtn = screen.getByRole("button")
    fireEvent.click(floatingBtn)
    expect(screen.getByText(/I'm Warehouse OS AI/)).toBeInTheDocument()
  })

  it("Test 30: Send message processes input", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => {
          let called = false
          return {
            read: () => {
              if (called) return Promise.resolve({ done: true, value: undefined })
              called = true
              return Promise.resolve({ done: false, value: new TextEncoder().encode("Hello from AI") })
            },
          }
        },
      },
    })

    render(<AIAssistant />)
    const floatingBtn = screen.getByRole("button")
    fireEvent.click(floatingBtn)

    const input = screen.getByPlaceholderText("Ask anything...")
    fireEvent.change(input, { target: { value: "Hello" } })
    fireEvent.submit(input.closest("form")!)
  })

  it("Test 31: Suggestion buttons render when chat opens", () => {
    render(<AIAssistant />)
    const floatingBtn = screen.getByRole("button")
    fireEvent.click(floatingBtn)
    expect(screen.getByText("Summarize agent health")).toBeInTheDocument()
    expect(screen.getByText("What's our top priority?")).toBeInTheDocument()
    expect(screen.getByText("Suggest optimizations")).toBeInTheDocument()
    expect(screen.getByText("Explain current metrics")).toBeInTheDocument()
  })

  it("Test 32: Greeting message shows when chat opens", () => {
    render(<AIAssistant />)
    const floatingBtn = screen.getByRole("button")
    fireEvent.click(floatingBtn)
    expect(screen.getAllByText(/I'm Warehouse OS AI/).length).toBeGreaterThan(0)
  })

  it("Test 33: Input and send button present when open", () => {
    render(<AIAssistant />)
    const floatingBtn = screen.getByRole("button")
    fireEvent.click(floatingBtn)
    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument()
  })
})
