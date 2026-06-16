import { NextRequest } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Array<{ role: string; content: string }> }
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")

    if (!lastUserMsg) {
      return new Response("No message found", { status: 400 })
    }

    const res = await fetch(`${API_BASE}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: lastUserMsg.content }),
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(text, { status: res.status })
    }

    const data = await res.json()
    const reply = data.reply || "I couldn't process that request."

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(reply))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: "AI service unavailable" }),
      { status: 500 }
    )
  }
}
