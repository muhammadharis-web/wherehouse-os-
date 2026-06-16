import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await req.json()
    const suggestions = [
      { agent: "CommunicationAgent", action: "Restart communication relay — no heartbeat detected", priority: "high" },
      { agent: "PredictionAgent", action: "Scale up demand forecasting — workload at 15% capacity", priority: "medium" },
      { agent: "ReroutingAgent", action: "Rebalance fleet — 3 drones idle in Dock 4", priority: "low" },
    ]

    return Response.json({ suggestions })
  } catch {
    return Response.json({ error: "Suggestion generation failed" }, { status: 500 })
  }
}
