import { NextRequest } from "next/server"
import { streamChat, type Message } from "@/lib/ai/client"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages: Partial<Message>[] }
    const messages: Message[] = (body.messages || []).map((m, i) => ({
      id: m.id || `msg-${i}`,
      role: (m.role as Message["role"]) || "user",
      content: m.content || "",
    }))

    const lastUserMsg = [...messages].reverse().find(m => m.role === "user")
    if (!lastUserMsg) {
      return new Response(JSON.stringify({ error: "No user message" }), { status: 400 })
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: lastUserMsg.content }),
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      const replyText = data.reply || ""

      const enc = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(enc.encode(replyText))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      })
    }

    const aiStream = await streamChat(messages)

    const enc = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of aiStream) {
            const content = chunk.choices?.[0]?.delta?.content || ""
            if (content) {
              controller.enqueue(enc.encode(content))
            }
          }
        } catch {
          controller.enqueue(enc.encode("Sorry, I couldn't process that request."))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
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