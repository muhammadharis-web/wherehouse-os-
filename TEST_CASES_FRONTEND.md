# Frontend Test Cases — Warehouse OS (Agent Platform UI)

**Total: 50 Test Cases** | Framework: Vitest + React Testing Library (recommended)

---

## Category 1: Dashboard Overview (Tests 1–6)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 1 | Dashboard renders correctly | Load main dashboard page | Navigate to /dashboard | Metrics, agents, alerts panels visible |
| 2 | Metrics panel shows KPIs | Display key metrics | Observe MetricsPanel | Total orders, uptime, response time shown |
| 3 | Agent status grid loads | Display 6 agent cards | Observe AgentStatusGrid | 6 agents: Monitor, Routing, Rerouting, Prediction, Comm, CostOpt |
| 4 | Agent card status badges | Active/Idle/Error states | Check each agent card | Green (Active), Amber (Idle), Red (Error) badges |
| 5 | Alerts panel renders | Display system alerts | Observe AlertsPanel | Alert list with severity, time, message |
| 6 | Sync button works | Refresh dashboard data | Click Sync button | Spinner shows, data refreshes |

---

## Category 2: Orders Page (Tests 7–14)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 7 | Orders page renders | Navigate to /dashboard/orders | Click Orders in Dock | Table with Order ID, Customer, Status columns |
| 8 | Orders load from API | Fetch order list | Page load | Orders displayed with correct data |
| 9 | Empty state message | No orders exist | View orders page with empty DB | "No orders yet" message + AI chat suggestion |
| 10 | Loading skeleton | Data is loading | Observe during fetch | Skeleton cards animate |
| 11 | Error state | API fails | Simulate network error | Error message displayed |
| 12 | Status badges render | Each order status | Check order rows | Colored badges: Pending, Shipped, Delivered, etc. |
| 13 | Refresh button | Re-fetch orders | Click Refresh | Orders reload, spinner shows |
| 14 | Total order count badge | Header counter | Observe header | Badge shows correct total count |

---

## Category 3: Agents Page (Tests 15–22)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 15 | Agents page renders | Navigate to /dashboard/agents | Click Agents in Dock | Agent grid with search + filter |
| 16 | Agent cards show correct data | Display agent info | Observe each card | Name, status, tasks, accuracy, version |
| 17 | Search filters agents | Type in search bar | Enter agent name | List filters to matching agents |
| 18 | Status filter dropdown | Filter by status | Select "Active" filter | Only active agents shown |
| 19 | Agent dropdown menu | Click agent menu | Click 3-dot menu | View Details, Restart, Deactivate options |
| 20 | Refresh triggers monitor | Click refresh button | Click Refresh | POST /api/v1/agents/monitor called |
| 21 | Loading state | Agents loading | During fetch | Loading skeleton shown |
| 22 | Error handling | API failure | Simulate error | Error message with retry option |

---

## Category 4: Navigation & Layout (Tests 23–28)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 23 | Dock navigation works | Bottom dock bar | Click each dock item | Navigates to correct route |
| 24 | Active dock item highlighted | Current page indicator | Navigate between pages | Active item has accent background |
| 25 | Dock tooltip on hover | Hover over dock item | Hover on icon | Tooltip with label appears above |
| 26 | TopBar search input | Global search | Type in search bar | Text appears, clear button works |
| 27 | Notifications dropdown | Bell icon click | Click notification bell | Dropdown with 4 notifications |
| 28 | User dropdown menu | Avatar click | Click user avatar | Settings, Sign out options |

---

## Category 5: Chat & AI Assistant (Tests 29–36)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 29 | AI Assistant opens | Click chat button | Click bottom-right bot icon | Chat window opens with greeting |
| 30 | Send user message | Type and send | Enter text, click Send | Message appears in chat, loading indicator |
| 31 | Create order via chat | "ek order banao 3 kg ka Lahore mein" | Send order creation message | Order creates, success reply with ID |
| 32 | List orders via chat | "orders dikhao" | Send list command | Returns order list with IDs + status |
| 33 | Help via chat | "help" | Send help command | Available commands shown |
| 34 | Chat streaming response | Long response | Send any message | Text streams character by character |
| 35 | Chat error handling | API unavailable | Kill backend, send message | "AI service unavailable" error |
| 36 | Chat empty state | First open | Open chat | "I'm Warehouse OS AI" greeting message |

---

## Category 6: Authentication (Tests 37–42)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 37 | Login page renders | Navigate to /login | Open login page | Email + password form, sign in button |
| 38 | Login form validation | Empty fields | Submit empty form | Validation errors shown |
| 39 | Login success | Valid credentials | Enter admin@fulfillment.com / admin123 | Redirects to dashboard |
| 40 | Login failure | Invalid credentials | Enter wrong password | Error message "Invalid email or password" |
| 41 | Signup page renders | Navigate to /signup | Click Sign up link | Form with name, email, password, confirm |
| 42 | Signup validation | Password mismatch | Different passwords | "Passwords do not match" error |

---

## Category 7: Theme & UI (Tests 43–46)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 43 | Dark theme applies | Dark mode default | Load any page | Background #09090b, foreground #fafafa |
| 44 | Glass effect renders | Card backgrounds | Observe cards | backdrop-filter blur, rgba backgrounds |
| 45 | Gradient text effect | Hero section | Observe gradient-text class | Text gradient purple-to-indigo |
| 46 | Animations play | Framer Motion | Observe page load | Elements animate in (fade, slide, scale) |

---

## Category 8: Responsive & Performance (Tests 47–50)

| # | Test Name | Description | Steps | Expected Result |
|---|---|---|---|---|
| 47 | Mobile responsive layout | Resize to 375px width | Shrink browser | Content reflows, no horizontal scroll |
| 48 | Loading states exist | All data-fetching components | Observe any page load | Skeleton/spinner before content |
| 49 | Error boundaries work | Component crash | Simulate render error | Fallback UI, no white screen |
| 50 | Page titles set | Document title | Check each page | "Warehouse OS — ..." per page |

---

## Test Execution

```bash
cd agent-platform-ui-main
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npx vitest run
```

**Note:** Frontend currently has no test infrastructure installed. Install Vitest + Testing Library first.
