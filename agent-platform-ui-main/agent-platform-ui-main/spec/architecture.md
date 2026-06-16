# Warehouse OS — Architecture Specification v2

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Landing │ │ Dashboard│ │ AI Chat  │ │ Agent Controls │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│       └───────────┴────────────┴───────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                     Component Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ UI Prims │ │ Effects  │ │  Layout  │ │  AI Comps     │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       Service Layer                          │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │   OpenAI SDK     │ │   Local State    │                  │
│  └──────────────────┘ └──────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│                       Config Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Theme   │ │  Routes  │ │  Types   │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## 2. AI Integration Spec

### 2.1 OpenAI SDK Service
- **File:** `src/lib/ai/client.ts`
- Creates a reusable OpenAI client instance
- Uses edge-compatible fetch for streaming

### 2.2 AI Chat Assistant
- **Component:** `src/components/ai/AIAssistant.tsx`
- Floating chat bubble → expands to full chat panel
- Context-aware: knows current dashboard page/agent state
- Streaming responses with markdown rendering

### 2.3 AI Agent Advisor
- **Component:** `src/components/ai/AgentAdvisor.tsx`
- Suggests agent optimizations based on workload data
- Natural language explanations of agent behavior

### 2.4 AI Analytics Interpreter
- **Component:** `src/components/ai/AnalyticsInsight.tsx`
- Auto-generates insights from metrics data
- Highlights anomalies and trends

## 3. Data Contracts

```typescript
interface AIRequest {
  messages: Message[]
  context?: {
    page: string
    metrics?: MetricSnapshot
    agents?: AgentStatus[]
  }
}

interface AIResponse {
  id: string
  content: string
  role: "assistant"
  suggestions?: Action[]
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}
```

## 4. API Route Spec

```
POST /api/ai/chat
  Body: { messages: Message[], context?: Context }
  Response: Stream<AIResponse>

POST /api/ai/insight
  Body: { data: MetricSnapshot }
  Response: { insight: string, severity: 'info'|'warning'|'critical' }

POST /api/ai/suggest
  Body: { agents: AgentStatus[] }
  Response: { suggestions: Suggestion[] }
```

## 5. Component Tree

```
RootLayout
├── NoiseOverlay
├── CursorFollower
├── Page (Landing)
│   ├── WarehouseHero (Three.js)
│   └── LandingSections
└── Page (Dashboard)
    ├── TopBar
    ├── Dock
    ├── MetricsPanel
    ├── AgentStatusGrid
    │   └── AgentCard (x6)
    ├── AlertsPanel
    ├── AnalyticsCharts
    ├── InventoryZonesPanel
    ├── TaskQueuePanel
    ├── WorkflowPanel
    ├── ActivityLog
    ├── FlowVisualization
    └── AIAssistant (floating)
```

## 6. Performance Budget

- Lighthouse score ≥ 90
- First load JS < 200kb (excluding Three.js)
- AI responses stream in < 2s
- Animations @ 60fps
- Three.js only on landing hero
