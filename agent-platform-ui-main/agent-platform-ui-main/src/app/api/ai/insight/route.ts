import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await req.json()
    const insights = [
      { metric: "Active Agents", insight: "6 agents online — 2 underutilized (PredictionAgent, CommunicationAgent)", severity: "info" },
      { metric: "Orders Processed", insight: "8,421 orders today — +12% vs yesterday. Scaling recommended.", severity: "info" },
      { metric: "System Uptime", insight: "99.97% — no degradation detected", severity: "info" },
      { metric: "Avg Response", insight: "47ms — within SLA. Zone C latency up 3ms", severity: "warning" },
    ]

    return Response.json({ insights })
  } catch {
    return Response.json({ error: "Insight generation failed" }, { status: 500 })
  }
}
