"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSettings } from "@/contexts/SettingsContext"
import { useRouter } from "next/navigation"

const WARNING_BEFORE = 60

export function SessionTimer({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [remaining, setRemaining] = useState(0)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    setShowWarning(false)

    const timeoutMs = settings.sessionTimeout * 60 * 1000
    timerRef.current = setTimeout(() => handleExpire(), timeoutMs)

    const warningMs = timeoutMs - WARNING_BEFORE * 1000
    if (warningMs > 0) {
      warningRef.current = setTimeout(() => {
        setShowWarning(true)
        setRemaining(WARNING_BEFORE)
        const interval = setInterval(() => {
          setRemaining((r) => {
            if (r <= 1) {
              clearInterval(interval)
              return 0
            }
            return r - 1
          })
        }, 1000)
      }, warningMs)
    }
  }, [settings.sessionTimeout])

  function handleExpire() {
    localStorage.removeItem("warehouse-os-settings")
    setShowWarning(false)
    router.push("/")
  }

  function stayLoggedIn() {
    setShowWarning(false)
    resetTimer()
  }

  useEffect(() => {
    if (settings.sessionTimeout <= 0) return

    resetTimer()

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click", "wheel"]
    function onActivity() { resetTimer() }
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [settings.sessionTimeout, resetTimer])

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border/40 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">Session Expiring Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session will expire in <strong className="text-accent">{remaining}s</strong> due to inactivity.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={stayLoggedIn}
                className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleExpire}
                className="flex-1 rounded-xl border border-border/40 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 active:scale-95"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  )
}
