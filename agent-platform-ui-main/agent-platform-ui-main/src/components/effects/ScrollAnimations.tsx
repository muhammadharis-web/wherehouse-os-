"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScrollAnimationsProps {
  children: React.ReactNode
  className?: string
  animation?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight"
  delay?: number
  stagger?: number
}

export function ScrollAnimations({ children, className, animation = "fadeUp", delay = 0, stagger = 0.1 }: ScrollAnimationsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.children.length > 0 ? Array.from(el.children) : [el]
    const animationMap = {
      fadeUp: { y: 40, opacity: 0 },
      fadeIn: { opacity: 0 },
      scaleIn: { scale: 0.9, opacity: 0 },
      slideLeft: { x: -40, opacity: 0 },
      slideRight: { x: 40, opacity: 0 },
    }
    const fromVars = animationMap[animation]

    const ctx = gsap.context(() => {
      gsap.fromTo(targets, { ...fromVars }, {
        y: 0, x: 0, scale: 1, opacity: 1,
        duration: 0.9, delay, stagger, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
      })
    })

    return () => ctx.revert()
  }, [animation, delay, stagger])

  return <div ref={ref} className={className}>{children}</div>
}
