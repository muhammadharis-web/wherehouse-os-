from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.models.shipment import Shipment, ShipmentStatus

logger = logging.getLogger(__name__)

MAX_SHIPMENTS_PER_CYCLE = 200


class MonitorAgent:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_active_shipments(
        self, entity_ids: list[str] | None = None, offset: int = 0
    ) -> list[Shipment]:
        query = select(Shipment).where(
            Shipment.status.notin_([
                ShipmentStatus.DELIVERED,
                ShipmentStatus.RETURNED,
            ])
        )
        if entity_ids:
            query = query.where(Shipment.id.in_(entity_ids))
        query = query.order_by(Shipment.updated_at.asc()).offset(offset).limit(MAX_SHIPMENTS_PER_CYCLE)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_active_shipments(self, entity_ids: list[str] | None = None) -> int:
        from sqlalchemy import func
        query = select(func.count(Shipment.id)).where(
            Shipment.status.notin_([
                ShipmentStatus.DELIVERED,
                ShipmentStatus.RETURNED,
            ])
        )
        if entity_ids:
            query = query.where(Shipment.id.in_(entity_ids))
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def check_delay(self, shipment: Shipment) -> dict:
        now = datetime.now(timezone.utc)
        is_delayed = False
        reason = None
        risk_score = 0.0

        if shipment.estimated_delivery and now > shipment.estimated_delivery:
            diff_hours = (now - shipment.estimated_delivery).total_seconds() / 3600
            is_delayed = True
            reason = f"Past estimated delivery by {diff_hours:.1f} hours"
            risk_score = min(diff_hours / 24, 1.0)

        if not is_delayed and shipment.last_polled_at:
            hours_since_poll = (now - shipment.last_polled_at).total_seconds() / 3600
            if hours_since_poll > 24:
                is_delayed = True
                reason = f"No status update in {hours_since_poll:.1f} hours"
                risk_score = 0.3

        if is_delayed:
            shipment.is_delayed = True
            shipment.delay_reason = reason
            shipment.status = ShipmentStatus.DELAYED

        shipment.last_polled_at = now

        return {
            "is_delayed": is_delayed,
            "reason": reason,
            "risk_score": risk_score,
            "checked_at": now.isoformat(),
        }
