import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  count?: number
}

export function SkeletonCard({ className, count = 1 }: SkeletonCardProps) {
  const items = Array.from({ length: count })

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className={cn("animate-pulse space-y-3 rounded-xl border border-border/50 bg-card p-4", className)}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-1/4 rounded bg-muted" />
            </div>
          </div>
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-20 rounded-lg bg-muted" />
            <div className="h-8 w-20 rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </>
  )
}
