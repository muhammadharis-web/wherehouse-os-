import { Sidebar } from "@/components/layout/Sidebar"
import { Dock } from "@/components/navigation/Dock"
import { TopBar } from "@/components/navigation/TopBar"
import { AIAssistant } from "@/components/ai/AIAssistant"
import { CursorFollower } from "@/components/effects/CursorFollower"
import { SearchProvider } from "@/contexts/SearchContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="min-h-screen pb-24 bg-grid-subtle bg-ambient" role="region" aria-label="Dashboard">
        <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
          Skip to dashboard content
        </a>
        <CursorFollower />
        <Sidebar />
        <TopBar />
        <div id="dashboard-content" className="pt-16 pl-[260px] pr-6 max-w-7xl mx-auto outline-none max-md:pl-4 max-md:pr-4 max-md:pt-14" tabIndex={-1}>
          {children}
        </div>
        <Dock />
        <AIAssistant />
      </div>
    </SearchProvider>
  )
}
