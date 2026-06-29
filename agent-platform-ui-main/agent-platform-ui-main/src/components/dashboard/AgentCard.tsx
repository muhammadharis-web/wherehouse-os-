"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, CheckCircle2, AlertCircle, Clock, Loader2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Agent {
  id: string; name: string; role: string; status: "active" | "idle" | "error" | "processing"
  uptime: string; tasksCompleted: number; workload: number; accuracy: number
}

interface AgentCardProps { agent: Agent; index: number }

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Active" },
  idle: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Idle" },
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
  processing: { icon: Loader2, color: "text-info", bg: "bg-info/10", label: "Processing" },
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const router = useRouter()
  const status = statusConfig[agent.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => router.push("/dashboard/agents")}
      className="group relative rounded-xl glass-card cursor-pointer p-5"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg glass-card-strong", status.bg)}>
              <Bot className={cn("h-5 w-5", status.color)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/dashboard/agents")}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Restart Agent</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", status.bg, status.color)}>
            <StatusIcon className={cn("h-3 w-3", agent.status === "processing" && "animate-spin")} />
            {status.label}
          </div>
          <span className="text-xs text-muted-foreground">{agent.uptime}</span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Workload</span>
            <span className="font-medium text-foreground">{agent.workload}%</span>
          </div>
          <Progress value={agent.workload} className="h-1.5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-medium text-foreground">{agent.accuracy}%</span>
          </div>
          <Progress value={agent.accuracy} className="h-1.5" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3 text-xs text-muted-foreground">
          <span>{agent.tasksCompleted} tasks</span>
          <Badge variant="secondary" className="text-[10px]">v2.4.1</Badge>
        </div>
      </div>
    </motion.div>
  )
}
