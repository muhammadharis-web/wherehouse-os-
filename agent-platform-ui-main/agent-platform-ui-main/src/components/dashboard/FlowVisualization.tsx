"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Bot, Package, Zap, Globe, ArrowRight } from "lucide-react"

interface Node {
  id: string
  label: string
  type: "agent" | "process" | "zone" | "output"
  x: number
  y: number
  status: "active" | "idle" | "warning"
  subtitle: string
}

interface Edge {
  from: string
  to: string
}

const nodes: Node[] = [
  { id: "n1", label: "RoutingAgent", type: "agent", x: 10, y: 25, status: "active", subtitle: "Order Router" },
  { id: "n2", label: "MonitorAgent", type: "agent", x: 10, y: 50, status: "active", subtitle: "Shipment Monitor" },
  { id: "n3", label: "PredictionAgent", type: "agent", x: 10, y: 75, status: "idle", subtitle: "Failure Predictor" },
  { id: "n4", label: "Inbound", type: "process", x: 33, y: 22, status: "active", subtitle: "Receiving" },
  { id: "n5", label: "Sorting", type: "process", x: 33, y: 47, status: "active", subtitle: "Classification" },
  { id: "n6", label: "Packing", type: "process", x: 33, y: 72, status: "idle", subtitle: "Order Assembly" },
  { id: "n7", label: "Zone A", type: "zone", x: 56, y: 18, status: "active", subtitle: "Fast-Moving Goods" },
  { id: "n8", label: "Zone B", type: "zone", x: 56, y: 43, status: "active", subtitle: "Bulk Storage" },
  { id: "n9", label: "Zone C", type: "zone", x: 56, y: 68, status: "warning", subtitle: "Cold Storage" },
  { id: "n10", label: "Outbound", type: "output", x: 79, y: 43, status: "active", subtitle: "Shipping Dock" },
]

const edges: Edge[] = [
  { from: "n1", to: "n4" }, { from: "n1", to: "n5" },
  { from: "n2", to: "n5" }, { from: "n2", to: "n6" },
  { from: "n3", to: "n6" },
  { from: "n4", to: "n7" }, { from: "n5", to: "n8" }, { from: "n6", to: "n9" },
  { from: "n7", to: "n10" }, { from: "n8", to: "n10" }, { from: "n9", to: "n10" },
]

const nodeIcons = { agent: Bot, process: Zap, zone: Package, output: Globe }

const statusColors = {
  active: {
    bg: "bg-success/15",
    border: "border-success/35",
    dot: "bg-success",
    glow: "shadow-[0_0_14px_-2px_rgba(34,197,94,0.4)]",
    text: "text-success",
  },
  idle: {
    bg: "bg-warning/12",
    border: "border-warning/25",
    dot: "bg-warning",
    glow: "",
    text: "text-warning",
  },
  warning: {
    bg: "bg-destructive/12",
    border: "border-destructive/25",
    dot: "bg-destructive",
    glow: "shadow-[0_0_14px_-2px_rgba(239,68,68,0.4)]",
    text: "text-destructive",
  },
}

export function FlowVisualization() {
  const [dashOffset, setDashOffset] = useState(0)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number; delay: number }[]>([])

  useEffect(() => {
    const interval = setInterval(() => setDashOffset((prev) => (prev + 1) % 100), 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      delay: Math.random() * 5,
    }))
    setParticles(p)
  }, [])

  const getNodeCenter = (id: string) => {
    const node = nodes.find((n) => n.id === id)
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/20">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Flow Visualization</h3>
            <p className="text-[11px] text-muted-foreground/70">Real-time warehouse pipeline</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-subtle" />
          Live
        </Badge>
      </div>

      <div className="relative px-6 py-6">
        <div className="relative w-full" style={{ height: 380 }}>
          <div className="absolute inset-0 flex pointer-events-none">
            {["Agents", "Process", "Zones", "Output"].map((label, i) => {
              const left = [10, 32, 55, 78][i]
              return (
                <div key={label} className="absolute" style={{ left: `${left - 7}%`, top: "0.5%" }}>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded bg-zinc-800/80">
                    <span className="text-[9px] font-semibold text-zinc-400 tracking-wider uppercase">{label}</span>
                  </div>
                </div>
              )
            })}
            {[10, 32, 55, 78].map((x) => (
              <div
                key={`div-${x}`}
                className="absolute top-0 bottom-0 w-px bg-border/20"
                style={{ left: `${x}%` }}
              />
            ))}
          </div>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(113,113,122)" />
                <stop offset="100%" stopColor="rgb(82,82,91)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <line x1="10" y1="7" x2="10" y2="93" stroke="rgb(39,39,42)" strokeWidth="0.3" strokeDasharray="1 2" />
            <line x1="32" y1="7" x2="32" y2="93" stroke="rgb(39,39,42)" strokeWidth="0.3" strokeDasharray="1 2" />
            <line x1="55" y1="7" x2="55" y2="93" stroke="rgb(39,39,42)" strokeWidth="0.3" strokeDasharray="1 2" />
            <line x1="78" y1="7" x2="78" y2="93" stroke="rgb(39,39,42)" strokeWidth="0.3" strokeDasharray="1 2" />

            {edges.map((edge) => {
              const from = getNodeCenter(edge.from)
              const to = getNodeCenter(edge.to)
              const dx = to.x - from.x
              const dy = to.y - from.y
              const len = Math.sqrt(dx * dx + dy * dy)
              const nx = dx / len
              const ny = dy / len
              const pad = 8
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x + nx * pad}
                  y1={from.y + ny * pad}
                  x2={to.x - nx * pad}
                  y2={to.y - ny * pad}
                  stroke="url(#edgeGrad)"
                  strokeWidth="0.8"
                  strokeDasharray="3 4"
                  strokeDashoffset={-dashOffset}
                  filter="url(#glow)"
                  opacity="0.7"
                />
              )
            })}
          </svg>

          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-accent/20"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{
                y: [0, -30, 0, 20, 0],
                opacity: [0.2, 0.6, 0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 6 + p.speed * 5,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {nodes.map((node, i) => {
            const Icon = nodeIcons[node.type]
            const sc = statusColors[node.status]
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
                className={cn(
                  "absolute flex flex-col items-start rounded-lg border transition-all cursor-default",
                  sc.bg, sc.border, sc.glow
                )}
                style={{
                  left: `${node.x - 9}%`,
                  top: `${node.y - 6}%`,
                  width: "18%",
                }}
              >
                <div className="flex items-center gap-2 px-2.5 pt-2 pb-0.5 w-full">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", sc.dot, node.status === "active" && "animate-pulse-subtle")} />
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", sc.text)} />
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap leading-none">
                    {node.label}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground px-2.5 pb-2 pt-0 leading-tight">
                  {node.subtitle}
                </span>
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border/30">
          <span className="text-[11px] font-medium text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-[11px] text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="text-[11px] text-muted-foreground">Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-[11px] text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Agent</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Process</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Zone</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Output</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
