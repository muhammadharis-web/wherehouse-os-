"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Bot, GitBranch, Activity, Settings,
  ChevronLeft, ChevronRight, Package, BarChart3, Users,
  Sun, Moon, X, Menu,
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const { settings, updateSetting } = useSettings()
  const isDark = settings.theme === "dark"

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
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
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5 py-4">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
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
                {!collapsed && isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute right-2 h-1.5 w-1.5 rounded-full bg-accent"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-muted hover:text-foreground", pathname === item.href && "bg-accent/10 text-accent")}>
            <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={() => updateSetting("theme", isDark ? "light" : "dark")}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
          suppressHydrationWarning
        >
          <motion.div
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          </motion.div>
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-1 hidden lg:flex w-full items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground transition-all duration-200 hover:bg-muted"
          suppressHydrationWarning
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </motion.div>
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-30 flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-background/70 text-muted-foreground shadow-lg backdrop-blur-xl transition-colors hover:text-foreground hover:bg-muted/50"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col glass-sidebar transition-all duration-300",
          collapsed ? "w-[68px] max-lg:w-[240px]" : "w-[240px]",
          "max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:h-screen max-lg:z-50",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}
