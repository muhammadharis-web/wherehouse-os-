"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface AnimatedCounterProps {
  end: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  label: string
}

export function AnimatedCounter({ end, suffix = "", prefix = "", decimals = 0, duration = 2, label }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const container = containerRef.current
    if (!el || !container) return

    const ctx = gsap.context(() => {
      gsap.fromTo(el, { textContent: 0 }, {
        textContent: end,
        duration,
        ease: "power3.out",
        scrollTrigger: { trigger: container, start: "top 85%", toggleActions: "play none none reverse" },
        snap: { textContent: 1 / (end * 10) },
        onUpdate: function () {
          const num = parseFloat(this.targets()[0].textContent as string) || 0
          el.textContent = num.toFixed(decimals)
        },
      })
    })

    return () => ctx.revert()
  }, [end, duration, decimals])

  return (
    <div ref={containerRef} className="text-center">
      <p className="text-4xl font-bold tracking-tight text-foreground">{prefix}<span ref={ref}>{end.toFixed(decimals)}</span>{suffix}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
