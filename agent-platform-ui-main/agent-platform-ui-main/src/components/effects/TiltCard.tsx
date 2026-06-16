"use client"

import { useRef, type ReactNode } from "react"

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
  "aria-label"?: string
}

export function TiltCard({ children, className, intensity = 8, ...props }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function onMouseMove(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg)`
  }

  function onMouseLeave() {
    if (!ref.current) return
    ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)"
  }

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
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      className={className || undefined}
      style={{ transition: "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
      {...props}
    >
      {children}
    </div>
  )
}
