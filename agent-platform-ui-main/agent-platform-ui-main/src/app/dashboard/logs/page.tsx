"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ScrollText, Filter, Download, Upload, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

const logs = [
  { time: "2026-06-16 14:23:12", level: "INFO", source: "Orchestrator", message: "Order #ORD-8821 routed to FC-North" },
  { time: "2026-06-16 14:22:45", level: "WARN", source: "Inventory", message: "Stock level low for SKU-WL-442 (14 remaining)" },
  { time: "2026-06-16 14:22:01", level: "INFO", source: "Prediction", message: "Demand forecast updated for next 7 days" },
  { time: "2026-06-16 14:21:30", level: "ERROR", source: "Carrier", message: "API timeout for FedEx rate request (retry 2/3)" },
  { time: "2026-06-16 14:20:55", level: "INFO", source: "Monitor", message: "Agent health check passed — all 24 agents online" },
  { time: "2026-06-16 14:20:12", level: "INFO", source: "CostOptimizer", message: "Batch optimization complete — saved $342.10" },
  { time: "2026-06-16 14:19:44", level: "WARN", source: "Routing", message: "FC-South at 89% capacity, redistribution suggested" },
  { time: "2026-06-16 14:18:30", level: "INFO", source: "System", message: "Scheduled backup completed successfully" },
]

const levelStyles: Record<string, string> = {
  INFO: "bg-blue-500/10 text-blue-500",
  WARN: "bg-amber-500/10 text-amber-500",
  ERROR: "bg-red-500/10 text-red-500",
}

export default function LogsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importedLogs, setImportedLogs] = useState<typeof logs>([])
  const [liveLogs, setLiveLogs] = useState<typeof logs>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toISOString().slice(0, 19).replace("T", " "),
        level: ["INFO", "WARN", "ERROR"][Math.floor(Math.random() * 3)] as "INFO" | "WARN" | "ERROR",
        source: ["Monitor", "Routing", "CostOptimizer", "Communication", "Prediction"][Math.floor(Math.random() * 5)],
        message: [
          "Routine health check completed",
          "Shipment status updated",
          "Rate cache refreshed",
          "Agent heartbeat received",
          `Queue depth: ${Math.floor(Math.random() * 50)}`,
        ][Math.floor(Math.random() * 5)],
      }
      setLiveLogs((prev) => [...prev.slice(-50), newLog])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [liveLogs])

  function handleExport() {
    const data = importedLogs.length ? importedLogs : logs
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (Array.isArray(parsed)) {
          setImportedLogs(parsed)
        }
      } catch { /* ignore invalid files */ }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const displayLogs = importedLogs.length ? importedLogs : [...logs, ...liveLogs]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">System Logs</h1>
            <p className="text-sm text-muted-foreground">Real-time event stream from all agents and services</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />Import
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" />Export
          </Button>
        </div>
      </motion.div>

      {importedLogs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing imported logs ({importedLogs.length} entries)</span>
          <button onClick={() => setImportedLogs([])} className="underline hover:text-foreground">Reset</button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border/50 bg-card overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/30 bg-muted/30 px-5 py-3">
          <div className="grid grid-cols-[160px_100px_140px_1fr] gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">
            <span>Timestamp</span>
            <span>Level</span>
            <span>Source</span>
            <span>Message</span>
          </div>
          {!importedLogs.length && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] text-emerald-500 font-medium flex items-center gap-1 shrink-0"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live
            </motion.span>
          )}
        </div>
        <div ref={listRef} className="divide-y divide-border/30 max-h-[480px] overflow-y-auto">
          {displayLogs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No log entries</div>
          ) : (
            displayLogs.map((log, i) => (
              <motion.div
                key={`${log.time}-${i}`}
                initial={{ opacity: 0, x: -10, backgroundColor: "rgba(59,130,246,0.08)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "rgba(59,130,246,0)" }}
                transition={{ duration: 0.3, delay: i > logs.length ? 0 : i * 0.02 }}
                className="grid grid-cols-[160px_100px_140px_1fr] gap-4 px-5 py-2.5 text-sm font-mono hover:bg-muted/10 transition-colors"
              >
                <span className="text-muted-foreground text-[12px]">{log.time}</span>
                <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelStyles[log.level] || "bg-muted text-muted-foreground"}`}>{log.level}</span>
                <span className="text-foreground/80 text-[12px]">{log.source}</span>
                <span className="text-foreground/70 text-[12px] truncate">{log.message}</span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
