# Backend Test Cases — Warehouse OS (Order Fulfillment Coordinator)

**Total: 50 Test Cases** | Framework: pytest + pytest-asyncio

---

## Category 1: Agent Orchestration (Tests 1–8)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 1 | Orchestrator creates structured cycle | Run monitor cycle with active shipments | Active shipments in DB | MonitorResponse with cycle_id, shipments_checked |
| 2 | Routing Agent generates valid plan | Route order through fulfillment system | Order with weight, destination | Dict with FC, carrier, tracking_number, cost |
| 3 | Empty input validation | Empty MonitorRequest | No entity_ids | Valid default payload accepted |
| 4 | Invalid JSON payload | Malformed MonitorRequest | entity_ids="not_a_list" | Pydantic ValidationError |
| 5 | Monitor Agent fetches active shipments | Get non-delivered shipments | DB with shipments | List of active shipments, max 200 |
| 6 | Monitor Agent checks delay | Check if shipment is delayed | Shipment past ETA | is_delayed bool, reason, risk_score |
| 7 | Reroute evaluation | Find alternative carrier | Delayed shipment, current carrier | should_reroute bool, alternative info |
| 8 | Reroute execution | Execute carrier switch | Shipment + new carrier data | Updated carrier, tracking number |

---

## Category 2: Agent Logic (Tests 9–16)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 9 | Prediction Agent probability calc | Calculate failure probability | Delayed shipment data | failure_probability ≤ 0.95 |
| 10 | Cost Optimizer cycle analysis | Analyze shipping costs | Cycle ID, shipment stats | Analysis dict with recommendations |
| 11 | Communication Agent sends alerts | Send delay notification | Delayed shipment, reason | 2 notifications sent (email+SMS) |
| 12 | Communication fallback (no API keys) | Send alert without Twilio/SendGrid | Missing API keys | simulated=True, no crash |
| 13 | Order creation via chat endpoint | Parse "ek order banao" message | Urdu/English mixed text | Order created with extracted fields |
| 14 | Order creation with email only | Partial order info | Message with email only | Missing field response with guidance |
| 15 | Chat list orders | "orders dikhao" command | Existing orders | Formatted order list |
| 16 | Chat help response | "help" command | Help keyword | Available commands listed |

---

## Category 3: API Endpoints (Tests 17–24)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 17 | POST /api/auth/login valid | Login with demo user | admin@fulfillment.com / admin123 | access_token, user object |
| 18 | POST /api/auth/login invalid | Login with wrong password | Wrong credentials | 401 Unauthorized |
| 19 | POST /api/auth/register | Register new user | New email + password | access_token for new user |
| 20 | GET /api/v1/orders/ list | List all orders | No params | OrderListResponse with orders array |
| 21 | POST /api/v1/orders/ create | Create new order | OrderCreate payload | Created order with ID |
| 22 | GET /api/v1/orders/{id} | Get single order by ID | Existing order ID | OrderRead with full details |
| 23 | PATCH /api/v1/orders/{id} | Update order | Update fields | Updated order |
| 24 | DELETE /api/v1/orders/{id} | Delete order | Existing order ID | 204 No Content |

---

## Category 4: Shipments & Routing (Tests 25–32)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 25 | GET /api/v1/shipments/ | List shipments | Status filter optional | Shipment array |
| 26 | GET /api/v1/shipments/{id} | Get single shipment | Shipment ID | Shipment details |
| 27 | POST /api/v1/orders/{id}/route | Route an order | Order ID | RouteResponse with FC, carrier |
| 28 | POST /api/v1/shipments/{id}/reroute | Reroute a shipment | Shipment ID + new carrier | Updated shipment |
| 29 | GET /api/v1/carriers/rates | List carrier rates | Origin/destination/weight | CarrierRate array |
| 30 | POST /api/v1/fulfillment-centers/ | Create FC | FC data | Created FC |
| 31 | GET /api/v1/analytics/kpis | Get dashboard KPIs | None | KPIs with totals, rates |
| 32 | GET /api/v1/analytics/carriers | Get carrier analytics | None | Carrier performance data |

---

## Category 5: Guardrails & Validation (Tests 33–40)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 33 | SLA compliance check | Shipment 48h overdue | Shipment past ETA | sla_compliance returns False |
| 34 | Cost cap enforcement | Cost increase > 40% | Current $10, new $15 | cost_cap returns False |
| 35 | Failed delivery threshold | 10% of 72h overdue | Hours overdue = 8 | threshold check passes |
| 36 | Carrier diversity check | Same carrier swap | FedEx → FedEx | carrier_diversity returns False |
| 37 | Address validation - invalid | P.O. Box address | "P.O. Box 123", "10001" | is_valid=False |
| 38 | Address validation - valid | Street address | "123 Main St", "10001" | is_valid=True |
| 39 | Notification frequency limit | Max 4 per order | 5th notification attempt | Blocked by guardrail |
| 40 | Order validation - missing fields | OrderCreate without email | Partial payload | Pydantic ValidationError |

---

## Category 6: Security & Auth (Tests 41–44)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 41 | Unauthorized API access | No auth token | None token | HTTPException 403 |
| 42 | Expired JWT handling | Expired token simulation | None token | HTTPException 403 |
| 43 | JWT token generation | Login creates valid JWT | Valid credentials | Token with sub, email, role, exp |
| 44 | Demo users exist | Check predefined users | None | 3 users: admin, operator, viewer |

---

## Category 7: Infrastructure & Config (Tests 45–50)

| # | Test Name | Description | Input | Expected Result |
|---|---|---|---|---|
| 45 | Database engine configured | Check SQLAlchemy setup | None | engine is not None |
| 46 | Celery task retry config | Monitor cycle task | None | max_retries=3 |
| 47 | Dockerfile exists | Deployment config | None | File exists at apps/api/Dockerfile |
| 48 | CI/CD pipeline exists | GitHub Actions | None | .github/workflows/ci.yml exists |
| 49 | CORS middleware enabled | API access control | None | CORS origins configured |
| 50 | Health endpoint | /health GET | None | {"status": "ok", "version": "0.1.0"} |

---

## Test Execution

```bash
cd order-fulfillment-coordinator/apps/api
uv run pytest tests/ -v
```

All 50 backend test cases pass. Results logged to `evaluation_report.json`.
