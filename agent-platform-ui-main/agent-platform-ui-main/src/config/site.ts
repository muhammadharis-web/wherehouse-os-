export const siteConfig = {
  name: "Warehouse OS",
  description:
    "Deploy, monitor, and scale autonomous agents that manage inventory, optimize workflows, and predict demand in real time.",
  url: "https://warehouse-os.io",
  links: {
    github: "https://github.com/warehouse-os",
  },
}

export type AgentStatus = "active" | "idle" | "error" | "processing"
export type AlertType = "critical" | "warning" | "info"
export type TaskPriority = "high" | "medium" | "low"
export type TaskStatus = "pending" | "in-progress" | "completed"
export type TaskType = "pick" | "pack" | "ship" | "audit"
export type WorkflowStatus = "running" | "paused" | "completed"
export type ZoneStatus = "optimal" | "warning" | "critical"
