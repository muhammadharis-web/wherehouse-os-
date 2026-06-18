"use client"

import { useEffect, useRef } from "react"

interface RotatingBorderProps {
  children: React.ReactNode
  className?: string
  speed?: number
  "aria-label"?: string
}

export function RotatingBorder({ children, className, speed = 4, ...props }: RotatingBorderProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let angle = 0
    let id: number

    function animate() {
      angle = (angle + 0.5) % 360
      el!.style.setProperty("--border-angle", `${angle}deg`)
      id = requestAnimationFrame(animate)
    }

    id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [speed])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      ref.current?.click()
    }
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={className || undefined}
      style={{
        position: "relative",
        borderRadius: "inherit",
      }}
      suppressHydrationWarning
      {...props}
    >
      <div
        style={{
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: "0.5px",
          background: "conic-gradient(from var(--border-angle, 0deg), rgba(139,92,246,0.4), rgba(99,102,241,0.1), rgba(139,92,246,0.05), rgba(99,102,241,0.1), rgba(139,92,246,0.4))",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          transition: "all 0.1s",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
