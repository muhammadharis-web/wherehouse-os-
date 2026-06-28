"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import {
  Settings, Bell, Shield, Palette, Globe, Database,
  ChevronRight, Save, RotateCcw, ToggleLeft, ToggleRight,
  Moon, Sun, Check, RefreshCw, Trash2, Download,
  Loader2, AlertTriangle, X,
} from "lucide-react"
import { useSettings, type AppSettings } from "@/contexts/SettingsContext"
import { api } from "@/lib/api"

interface SectionDef {
  id: string
  label: string
  icon: typeof Settings
  desc: string
}

const sections: SectionDef[] = [
  { id: "general", label: "General", icon: Settings, desc: "Application name, timezone, and language preferences" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Configure alert channels and notification types" },
  { id: "security", label: "Security", icon: Shield, desc: "Authentication, session, and access controls" },
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme, layout, and visual preferences" },
  { id: "integrations", label: "Integrations", icon: Globe, desc: "API endpoints, webhooks, and external services" },
  { id: "data", label: "Data Management", icon: Database, desc: "Retention, backups, and data lifecycle policies" },
]

function SectionNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <nav className="lg:w-56 shrink-0">
      <div className="space-y-1">
        {sections.map((sec) => {
          const isActive = active === sec.id
          return (
            <button
              key={sec.id}
              onClick={() => onSelect(sec.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <sec.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{sec.label}</span>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? "rotate-90" : ""}`} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function Toggle({ value, onChange, label, disabled }: { value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed ${
          value ? "bg-accent" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type, error, disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <Input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-8 text-sm ${error ? "border-destructive" : ""}`}
        disabled={disabled}
      />
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
        type === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {type === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-0.5 rounded hover:bg-black/10 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

function SettingsSection({
  section,
  settings,
  onUpdate,
  saving,
}: {
  section: SectionDef
  settings: AppSettings
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  saving?: boolean
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateUrl = (val: string): string | undefined => {
    if (!val) return undefined
    try {
      new URL(val)
      return undefined
    } catch {
      return "Invalid URL format"
    }
  }

  const validateNumber = (val: string, min?: number, max?: number): string | undefined => {
    const n = Number(val)
    if (isNaN(n)) return "Must be a number"
    if (min !== undefined && n < min) return `Minimum value is ${min}`
    if (max !== undefined && n > max) return `Maximum value is ${max}`
    return undefined
  }

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleField = (field: string, value: string, validator?: (v: string) => string | undefined) => {
    if (validator) {
      const err = validator(value)
      if (err) {
        setErrors((prev) => ({ ...prev, [field]: err }))
        return
      }
    }
    clearError(field)
    onUpdate(field as keyof AppSettings, value as never)
  }

  const renderField = () => {
    switch (section.id) {
      case "general":
        return (
          <div className="space-y-4">
            <Field label="Application Name" value={settings.appName} onChange={(v) => onUpdate("appName", v)} disabled={saving} />
            <Field label="Timezone" value={settings.timezone} onChange={(v) => onUpdate("timezone", v)} disabled={saving} />
            <Field label="Language" value={settings.language} onChange={(v) => onUpdate("language", v)} disabled={saving} />
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-1">
            <Toggle label="Email Alerts" value={settings.emailAlerts} onChange={(v) => onUpdate("emailAlerts", v)} disabled={saving} />
            <Toggle label="SMS Alerts" value={settings.smsAlerts} onChange={(v) => onUpdate("smsAlerts", v)} disabled={saving} />
            <Separator className="my-1" />
            <Toggle label="Delay Notifications" value={settings.delayNotifications} onChange={(v) => onUpdate("delayNotifications", v)} disabled={saving} />
            <Toggle label="Anomaly Alerts" value={settings.anomalyAlerts} onChange={(v) => onUpdate("anomalyAlerts", v)} disabled={saving} />
          </div>
        )

      case "security":
        return (
          <div className="space-y-4">
            <Toggle label="Two-Factor Authentication" value={settings.twoFactor} onChange={(v) => onUpdate("twoFactor", v)} disabled={saving} />
            <Field
              label="Session Timeout (minutes)"
              value={String(settings.sessionTimeout)}
              onChange={(v) => handleField("sessionTimeout", v, (val) => validateNumber(val, 5, 480))}
              type="number"
              error={errors.sessionTimeout}
              disabled={saving}
            />
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3 mt-2">
              <p className="text-xs text-muted-foreground">
                <Shield className="h-3 w-3 inline mr-1" />
                Session timeout applies to all dashboard users. Users will be automatically logged out after inactivity.
              </p>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="text-sm text-foreground">Theme</span>
                <p className="text-xs text-muted-foreground mt-0.5">{settings.theme === "dark" ? "Dark mode" : "Light mode"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate("theme", "dark")}
                  disabled={saving}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    settings.theme === "dark"
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate("theme", "light")}
                  disabled={saving}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    settings.theme === "light"
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
              </div>
            </div>
            <Toggle label="Compact Mode" value={settings.compactMode} onChange={(v) => onUpdate("compactMode", v)} disabled={saving} />
          </div>
        )

      case "integrations":
        return (
          <div className="space-y-4">
            <Field
              label="API Endpoint"
              value={settings.apiEndpoint}
              onChange={(v) => handleField("apiEndpoint", v, validateUrl)}
              error={errors.apiEndpoint}
              disabled={saving}
            />
            <Field
              label="Webhook URL"
              value={settings.webhookUrl}
              onChange={(v) => handleField("webhookUrl", v, (val) => val && !val.startsWith("https://") ? "Must start with https://" : undefined)}
              placeholder="https://hooks.example.com/events"
              error={errors.webhookUrl}
              disabled={saving}
            />
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3 mt-2 flex items-center gap-2">
              <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Changes to API endpoint take effect after page reload. Webhook URL is used for real-time shipment events.
              </p>
            </div>
          </div>
        )

      case "data":
        return (
          <div className="space-y-4">
            <Field
              label="Auto Cleanup (days)"
              value={String(settings.autoCleanupDays)}
              onChange={(v) => handleField("autoCleanupDays", v, (val) => validateNumber(val, 1, 365))}
              type="number"
              error={errors.autoCleanupDays}
              disabled={saving}
            />
            <Toggle label="Automatic Backups" value={settings.autoBackup} onChange={(v) => onUpdate("autoBackup", v)} disabled={saving} />
            <Separator className="my-2" />
            <div className="flex items-center gap-3 pt-2">
              <ClearCacheButton />
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-xl" disabled={saving}>
                <Download className="h-3.5 w-3.5" />
                Export Data
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="rounded-xl border-border/50 bg-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <section.icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{section.label}</h2>
          <p className="text-xs text-muted-foreground">{section.desc}</p>
        </div>
      </div>
      <Separator className="mb-5" />
      {renderField()}
    </Card>
  )
}

function ClearCacheButton() {
  const [open, setOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [done, setDone] = useState(false)

  const handleClear = () => {
    setClearing(true)
    setTimeout(() => {
      localStorage.clear()
      setClearing(false)
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
      }, 1200)
    }, 600)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-xl">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
          Clear Local Cache
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            Clear Local Cache
          </DialogTitle>
          <DialogDescription>
            This will remove all locally stored data including settings, cached API responses, and preferences. Your data on the server will not be affected.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xl">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-xl"
            onClick={handleClear}
            disabled={clearing || done}
          >
            {clearing ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Clearing...</>
            ) : done ? (
              <><Check className="h-3.5 w-3.5" /> Cleared</>
            ) : (
              <><Trash2 className="h-3.5 w-3.5" /> Clear</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings, hasChanges } = useSettings()
  const [activeSection, setActiveSection] = useState("general")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await api.put("/api/v1/settings", settings)
      setToast({ message: "Settings saved successfully", type: "success" })
    } catch {
      setToast({ message: "Failed to save settings to server", type: "error" })
    } finally {
      setSaving(false)
    }
  }, [settings])

  const activeSectionData = useMemo(() => sections.find((s) => s.id === activeSection)!, [activeSection])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: -45, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg"
            >
              <Settings className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground/80 mt-0.5">Manage your warehouse OS configuration</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <AnimatePresence>
            {saving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge variant="default" className="text-[10px] gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving
                </Badge>
              </motion.div>
            )}
            {hasChanges && !saving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge variant="warning" className="text-[10px] gap-1">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-warning"
                  />
                  Unsaved
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-xl hover:text-destructive transition-colors"
            onClick={resetSettings}
            disabled={saving}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-xl"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        <SectionNav active={activeSection} onSelect={setActiveSection} />

        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SettingsSection
              section={activeSectionData}
              settings={settings}
              onUpdate={updateSetting}
              saving={saving}
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
