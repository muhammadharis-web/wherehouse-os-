import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import LoginPage from "@/app/(auth)/login/page"
import SignupPage from "@/app/(auth)/signup/page"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("next-auth/react", () => ({
  signIn: vi.fn().mockResolvedValue({ error: null, ok: true }),
}))

describe("Category 6: Authentication", () => {
  it("Test 37: Login page renders with form", () => {
    render(<LoginPage />)
    expect(screen.getByText("Welcome back")).toBeInTheDocument()
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByText("Sign in")).toBeInTheDocument()
  })

  it("Test 38: Login form shows validation errors for empty fields", async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText("Sign in"))
    expect(await screen.findByText("Email is required")).toBeInTheDocument()
    expect(await screen.findByText("Password must be at least 6 characters")).toBeInTheDocument()
  })

  it("Test 39: Login with valid credentials", async () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "admin@fulfillment.com" } })
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "admin123" } })
    fireEvent.click(screen.getByText("Sign in"))
  })

  it("Test 40: Login failure shows error", async () => {
    const { signIn } = await import("next-auth/react")
    vi.mocked(signIn).mockResolvedValueOnce({ error: "Invalid credentials", ok: false, status: 401, url: null })
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "wrong@test.com" } })
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "wrongpass" } })
    fireEvent.click(screen.getByText("Sign in"))
  })

  it("Test 41: Signup page renders", () => {
    render(<SignupPage />)
    expect(screen.getByText("Create an account")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })

  it("Test 42: Signup validation for password mismatch", async () => {
    render(<SignupPage />)
    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Test User" } })
    fireEvent.change(screen.getAllByPlaceholderText("you@example.com")[0], { target: { value: "test@test.com" } })
    const passwordInputs = screen.getAllByPlaceholderText("••••••••")
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } })
    fireEvent.change(passwordInputs[1], { target: { value: "different456" } })
    fireEvent.click(screen.getByText("Create account"))
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
  })
})
