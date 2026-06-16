from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.agents.monitor import MonitorAgent
from fulfillment.agents.rerouting import ReroutingAgent
from fulfillment.agents.communication import CommunicationAgent
from fulfillment.agents.prediction import PredictionAgent
from fulfillment.agents.cost_optimizer import CostOptimizer
from fulfillment.schemas.agent import MonitorRequest, MonitorResponse
from fulfillment.guardrails.sla import sla_compliance
from fulfillment.guardrails.cost import cost_cap
from fulfillment.guardrails.notifications import notification_frequency
from fulfillment.guardrails.failed_delivery import failed_delivery_threshold
from fulfillment.models.agent_event import AgentEvent

logger = logging.getLogger(__name__)


class FulfillmentOrchestrator:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.monitor = MonitorAgent(db)
        self.rerouting = ReroutingAgent(db)
        self.communication = CommunicationAgent(db)
        self.prediction = PredictionAgent(db)
        self.cost_optimizer = CostOptimizer(db)

    async def run_monitor_cycle(self, request: MonitorRequest | None = None) -> MonitorResponse:
        cycle_id = str(uuid4())
        checked = 0
        delays = 0
        reroutes = 0
        notifications = 0
        anomalies = 0
        events: list[dict] = []

        try:
            shipments = await self.monitor.get_active_shipments(
                entity_ids=request.entity_ids if request else None
            )
        except Exception as exc:
            logger.error("Failed to fetch active shipments: %s", exc)
            return MonitorResponse(
                cycle_id=cycle_id,
                shipments_checked=0,
                delays_detected=0,
                reroutes_initiated=0,
                notifications_sent=0,
                anomalies_found=1,
                events=[{"type": "cycle_error", "detail": str(exc)}],
                completed_at=datetime.now(timezone.utc),
            )

        checked = len(shipments)

        for shipment in shipments:
            try:
                delay_result = await self.monitor.check_delay(shipment)
            except Exception as exc:
                logger.error("Delay check failed for shipment %s: %s", shipment.id, exc)
                anomalies += 1
                continue

            if delay_result["is_delayed"]:
                delays += 1
                if not sla_compliance(shipment):
                    events.append({
                        "type": "sla_breach",
                        "shipment_id": shipment.id,
                        "detail": "SLA compliance check failed",
                    })
                    anomalies += 1

                if not failed_delivery_threshold(shipment):
                    events.append({
                        "type": "failed_delivery_risk",
                        "shipment_id": shipment.id,
                        "detail": "Failed delivery threshold exceeded",
                    })
                    anomalies += 1

                reroute_result = await self.rerouting.evaluate_reroute(shipment)
                if reroute_result["should_reroute"]:
                    if cost_cap(shipment.shipping_cost or 0, reroute_result.get("new_cost", 0)):
                        try:
                            executed = await self.rerouting.execute_reroute(shipment, reroute_result)
                            if executed:
                                reroutes += 1
                                events.append({
                                    "type": "reroute_executed",
                                    "shipment_id": shipment.id,
                                    "detail": executed,
                                })
                                if await notification_frequency(shipment.order_id, self.db):
                                    notif_result = await self.communication.send_delay_alert(
                                        shipment=shipment,
                                        delay_reason=delay_result.get("reason", "Unknown"),
                                    )
                                    if notif_result:
                                        notifications += 1
                                        events.append({
                                            "type": "notification_sent",
                                            "shipment_id": shipment.id,
                                            "detail": notif_result,
                                        })
                        except Exception as exc:
                            logger.error("Reroute execution failed for shipment %s: %s", shipment.id, exc)
                            anomalies += 1

                try:
                    pred = await self.prediction.predict_failure(shipment)
                    if pred.get("failure_probability", 0) > 0.5:
                        anomalies += 1
                        events.append({
                            "type": "high_failure_risk",
                            "shipment_id": shipment.id,
                            "failure_probability": pred["failure_probability"],
                        })
                    await self._log_event("PredictionAgent", "failure_prediction", shipment.id, pred)
                except Exception as exc:
                    logger.error("Prediction failed for shipment %s: %s", shipment.id, exc)

                await self._log_event("MonitorAgent", "delay_detected", shipment.id, delay_result)

        try:
            analysis = await self.cost_optimizer.analyze_cycle(cycle_id)
            if analysis:
                events.append({"type": "cost_analysis", "detail": analysis})
        except Exception as exc:
            logger.error("Cost analysis failed for cycle %s: %s", cycle_id, exc)

        return MonitorResponse(
            cycle_id=cycle_id,
            shipments_checked=checked,
            delays_detected=delays,
            reroutes_initiated=reroutes,
            notifications_sent=notifications,
            anomalies_found=anomalies,
            events=events,
            completed_at=datetime.now(timezone.utc),
        )

    async def _log_event(
        self,
        agent_name: str,
        event_type: str,
        entity_id: str | None,
        details: dict,
    ) -> None:
        event = AgentEvent(
            id=str(uuid4()),
            agent_name=agent_name,
            event_type=event_type,
            entity_id=entity_id,
            summary=f"{agent_name} - {event_type}",
            details_json=json.dumps(details, default=str),
            risk_score=details.get("risk_score"),
        )
        self.db.add(event)
