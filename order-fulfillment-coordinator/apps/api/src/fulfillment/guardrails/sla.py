from __future__ import annotations

from datetime import datetime, timezone

from fulfillment.config import settings
from fulfillment.models.shipment import Shipment


def sla_compliance(shipment: Shipment) -> bool:
    if not shipment.estimated_delivery:
        return True

    now = datetime.now(timezone.utc)
    est = shipment.estimated_delivery
    if est.tzinfo is None:
        est = est.replace(tzinfo=timezone.utc)

    hours_overdue = (now - est).total_seconds() / 3600
    if hours_overdue > settings.sla_critical_hours:
        return False

    return True
