import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ErrorDisplay } from "@/components/ui/ErrorDisplay"

describe("ErrorDisplay Component", () => {
  it("renders default error message", () => {
    render(<ErrorDisplay />)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })

  it("renders custom error message", () => {
    render(<ErrorDisplay message="Custom error" />)
    expect(screen.getByText("Custom error")).toBeInTheDocument()
  })

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn()
    render(<ErrorDisplay onRetry={onRetry} />)
    const retryButton = screen.getByText("Try again")
    expect(retryButton).toBeInTheDocument()
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalled()
  })

  it("does not render retry button when onRetry is omitted", () => {
    render(<ErrorDisplay />)
    expect(screen.queryByText("Try again")).not.toBeInTheDocument()
  })

  it("has alert role for accessibility", () => {
    render(<ErrorDisplay />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
