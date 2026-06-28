"use client"

import { WorkflowPanel } from "@/components/dashboard/WorkflowPanel"
import { motion } from "framer-motion"
import { GitBranch, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WorkflowsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Workflows</h1>
              <p className="text-sm text-muted-foreground">Manage and monitor active workflow pipelines</p>
            </div>
          </div>
        </div>
      </motion.div>

      <WorkflowPanel />
    </motion.div>
  )
}