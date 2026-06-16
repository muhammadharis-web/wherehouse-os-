"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CursorFollower() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const dotX = useSpring(cursorX, { stiffness: 300, damping: 30 })
  const dotY = useSpring(cursorY, { stiffness: 300, damping: 30 })
  const isVisible = useRef(false)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      cursorX.set(e.clientX - 12)
      cursorY.set(e.clientY - 12)
      if (!isVisible.current) {
        isVisible.current = true
      }
    }
    function onMouseLeave() {
      cursorX.set(-100)
      cursorY.set(-100)
      isVisible.current = false
    }
    window.addEventListener("mousemove", onMouseMove)
    document.body.addEventListener("mouseleave", onMouseLeave)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      document.body.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [cursorX, cursorY])

  return (
    <motion.div
      className="pointer-events-none fixed z-[100] h-6 w-6 rounded-full mix-blend-difference"
      style={{
        x: dotX,
        y: dotY,
        background: "rgb(250,250,250)",
        filter: "blur(1px)",
      }}
    />
  )
}
