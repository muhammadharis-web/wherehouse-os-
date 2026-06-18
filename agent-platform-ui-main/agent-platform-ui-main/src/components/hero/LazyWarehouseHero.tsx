"use client"

import dynamic from "next/dynamic"

const WarehouseHero = dynamic(() => import("@/components/hero/WarehouseHero").then((m) => ({ default: m.WarehouseHero })), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
    </div>
  ),
})

export function LazyWarehouseHero() {
  return <WarehouseHero />
}
