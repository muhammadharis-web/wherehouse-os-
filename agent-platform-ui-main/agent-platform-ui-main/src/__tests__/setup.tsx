import "@testing-library/jest-dom"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, layoutId, whileHover, whileTap, ...rest } = props
      return <div {...rest}>{children}</div>
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, ...rest } = props
      return <span {...rest}>{children}</span>
    },
    tr: ({ children, ...props }: any) => {
      const { initial, animate, ...rest } = props
      return <tr {...rest}>{children}</tr>
    },
    nav: ({ children, ...props }: any) => {
      const { initial, animate, ...rest } = props
      return <nav {...rest}>{children}</nav>
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, whileTap, whileHover, ...rest } = props
      return <button {...rest}>{children}</button>
    },
    header: ({ children, ...props }: any) => {
      const { initial, animate, ...rest } = props
      return <header {...rest}>{children}</header>
    },
    p: ({ children, ...props }: any) => {
      const { initial, animate, ...rest } = props
      return <p {...rest}>{children}</p>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { on: vi.fn() } }),
  useSpring: (v: any) => v,
  useTransform: (v: any) => v,
}))

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue(null),
    post: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(null),
    patch: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(null),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message)
      this.name = "ApiError"
    }
  },
}))

vi.mock("@/contexts/SearchContext", () => ({
  SearchProvider: ({ children }: any) => <>{children}</>,
  useSearch: () => ({ query: "", setQuery: vi.fn() }),
}))

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
