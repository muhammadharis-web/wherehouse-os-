"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface TextRevealProps {
  children: string
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
  delay?: number
}

export function TextReveal({ children, className, as: Tag = "p", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-20%" })

  const words = children.split(" ")

  return (
    <Tag ref={ref} className={className}>
      <span className="inline-flex flex-wrap">
        {words.map((word, i) => (
          <span key={i} className="relative inline-block overflow-hidden mr-[0.25em]">
            <motion.span
              initial={{ y: "100%" }}
              animate={isInView ? { y: 0 } : { y: "100%" }}
              transition={{
                duration: 0.6,
                delay: delay + i * 0.06,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  )
}
