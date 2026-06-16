"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface UseGsapOptions {
  animation: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight"
  delay?: number
  stagger?: number
  triggerStart?: string
}

export function useGsap<T extends HTMLElement>(
  options: UseGsapOptions
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const animationMap = {
      fadeUp: { y: 40, opacity: 0 },
      fadeIn: { opacity: 0 },
      scaleIn: { scale: 0.9, opacity: 0 },
      slideLeft: { x: -40, opacity: 0 },
      slideRight: { x: 40, opacity: 0 },
    }

    const fromVars = animationMap[options.animation]

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { ...fromVars },
        {
          y: 0,
          x: 0,
          scale: 1,
          opacity: 1,
          duration: 0.9,
          delay: options.delay || 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: options.triggerStart || "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      )
    })

    return () => ctx.revert()
  }, [options.animation, options.delay, options.triggerStart])

  return ref
}
