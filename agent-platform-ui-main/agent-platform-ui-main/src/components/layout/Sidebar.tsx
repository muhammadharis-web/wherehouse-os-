"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Bot, GitBranch, Activity, Settings,
  ChevronLeft, ChevronRight, Package, BarChart3, Users,
  Sun, Moon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSettings } from "@/contexts/SettingsContext"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Bot, label: "Agents", href: "/dashboard/agents" },
  { icon: GitBranch, label: "Workflows", href: "/dashboard/workflows" },
  { icon: Activity, label: "Monitoring", href: "/dashboard/monitoring" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Users, label: "Team", href: "/dashboard/team" },
]

const bottomItems = [{ icon: Settings, label: "Settings", href: "/dashboard/settings" }]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { settings, updateSetting } = useSettings()
  const isDark = settings.theme === "dark"

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col glass-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary shadow-lg">
          <Package className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap overflow-hidden"
            >
              Warehouse OS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive ? "bg-accent/10 text-accent" : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-lg bg-accent/10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <item.icon className="relative z-10 h-4 w-4 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">{item.label}</motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted hover:text-foreground", pathname === item.href && "bg-accent/10 text-accent")}>
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={() => updateSetting("theme", isDark ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted hover:text-foreground"
          suppressHydrationWarning
        >
          {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="mt-1 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-muted" suppressHydrationWarning>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
