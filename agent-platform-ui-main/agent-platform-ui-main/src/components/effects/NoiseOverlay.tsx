"use client"

import { useEffect, useRef } from "react"

export function NoiseOverlay() {
  const ref = useRef<SVGFilterElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const noise = ref.current
    let animationId: number
    let phase = 0

    function animate() {
      phase += 0.01
      const baseFrequency = 0.65 + Math.sin(phase) * 0.02
      noise.setAttribute("baseFrequency", `${baseFrequency} ${baseFrequency}`)
      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay opacity-[0.03]">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise" ref={ref}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  )
}
