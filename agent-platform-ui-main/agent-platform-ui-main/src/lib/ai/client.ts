export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export interface AIContext {
  page?: string
  agents?: number
  metrics?: Record<string, string>
}

interface ChatCompletionChunk {
  choices: Array<{
    delta: { content?: string }
  }>
}

async function* mockStreamChat(messages: Message[], context?: AIContext): AsyncGenerator<ChatCompletionChunk> {
  const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""
  
  const responses: Record<string, string> = {
    "hello": "Hello! I'm Warehouse OS AI. I can help you with agent status, metrics, optimizations, and workflow management. What would you like to know?",
    "agent": "Currently 6 agents online: RoutingAgent (Routing), MonitorAgent (Monitoring), PredictionAgent (Forecasting), CostOptimizer (Cost), ReroutingAgent (Reroute), CommunicationAgent (Comms).",
    "metric": "Key metrics: 8,421 orders today (+12%), 99.97% uptime, 47ms avg response. On-time delivery at 94.2%. Zone C latency up 3ms.",
    "optim": "Recommendations: 1) Scale PredictionAgent for demand spikes 2) Reroute Zone C traffic via ReroutingAgent 3) Increase fleet allocation 15% 4) Schedule CostOptimizer audit for delayed shipments",
    "status": "System status: All agents operational. RoutingAgent processing 45 orders/min. ReroutingAgent rerouted 3 delayed shipments. CommunicationAgent sent 127 notifications last cycle.",
    "workflow": "Active workflows: Inventory Reconciliation (72%), Order Fulfillment (45%), Demand Forecasting (88% - paused), QA Batch (100% - completed).",
    "default": "I can help with: agent health, metrics, optimizations, workflow status, shipment tracking, and system alerts. Try asking about specific agents or metrics."
  }

  let response = responses.default
  for (const [keyword, resp] of Object.entries(responses)) {
    if (userMessage.includes(keyword)) {
      response = resp
      break
    }
  }

  const words = response.split(" ")
  for (const word of words) {
    yield { choices: [{ delta: { content: word + " " } }] }
    await new Promise(r => setTimeout(r, 30))
  }
}

export async function streamChat(messages: Message[], context?: AIContext) {
  const hasApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
  
  if (hasApiKey) {
    const OpenAI = (await import("openai")).default
    const openai = new OpenAI({ apiKey: hasApiKey, dangerouslyAllowBrowser: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY })
    
    const systemPrompt = `You are Warehouse OS AI — an intelligent assistant for a warehouse multi-agent system. 
You help operators manage autonomous agents, interpret metrics, and optimize workflows.
Keep responses concise, data-driven, and actionable.
${context ? `Current context: Page=${context.page || "unknown"}, Agents=${context.agents || "—"}` : ""}`

    return openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    })
  }

  return mockStreamChat(messages, context)
}
