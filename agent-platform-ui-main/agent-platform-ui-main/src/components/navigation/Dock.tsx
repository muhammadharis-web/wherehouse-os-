"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Bot, GitBranch, BarChart3, Settings, Package, ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const dockItems = [
  { icon: Package, label: "Home", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders" },
  { icon: Bot, label: "Agents", href: "/dashboard/agents" },
  { icon: GitBranch, label: "Workflows", href: "/dashboard/workflows" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function Dock() {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-end gap-1.5 rounded-2xl border border-border/40 bg-background/70 px-3 py-2 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {dockItems.map((item, i) => {
          const isActive = pathname === item.href
          const isHovered = hoveredIndex === i
          const nearby = hoveredIndex !== null && Math.abs(hoveredIndex - i) <= 2
          const scale = isHovered ? 1.35 : nearby ? 1.1 : 1

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex flex-col items-center gap-1"
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute -top-8 whitespace-nowrap rounded-lg border border-border/30 bg-card px-2.5 py-1 text-[10px] font-medium text-foreground shadow-lg backdrop-blur-xl"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.div
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 rounded-xl bg-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10 h-4 w-4" />
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
