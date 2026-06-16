"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/lib/ai/client"

const suggestions = [
  "Summarize agent health",
  "What's our top priority?",
  "Suggest optimizations",
  "Explain current metrics",
]

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", content: "I'm Warehouse OS AI. Ask me about agent status, metrics, or optimizations." },
  ])
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamContent])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return

    idCounter.current += 1
    const userMsg: Message = { id: `msg-${idCounter.current}`, role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setStreaming(true)
    setStreamContent("")

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!res.ok) throw new Error("Failed")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let content = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          content += decoder.decode(value, { stream: true })
          setStreamContent(content)
        }
      }

      idCounter.current += 1
      setMessages((prev) => [...prev, { id: `msg-${idCounter.current}`, role: "assistant", content }])
      setStreamContent("")
    } catch {
      idCounter.current += 1
      setMessages((prev) => [...prev, { id: `msg-${idCounter.current}`, role: "assistant", content: "AI service unavailable. Check your API key." }])
    } finally {
      setStreaming(false)
    }
  }, [messages, streaming])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] rounded-2xl border border-border/40 bg-card/90 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gradient-to-r from-accent/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Warehouse OS AI</p>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-accent text-white rounded-br-md"
                        : "bg-muted/50 text-foreground rounded-bl-md border border-border/20"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {streaming && streamContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted/50 px-4 py-2.5 text-sm text-foreground border border-border/20">
                      {streamContent}
                      <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse" />
                    </div>
                  </div>
                )}
                {streaming && !streamContent && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-muted/50 px-4 py-3 border border-border/20">
                      <Loader2 className="h-4 w-4 text-accent animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border/30">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="text-[10px] px-2 py-1 rounded-full border border-border/30 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSend(input) }} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 h-9 rounded-xl border border-border/30 bg-muted/30 px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button type="submit" disabled={!input.trim() || streaming}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow active:scale-95"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </motion.button>
    </>
  )
}
