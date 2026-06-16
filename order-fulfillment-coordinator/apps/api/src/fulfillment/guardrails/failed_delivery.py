from __future__ import annotations

from fulfillment.config import settings
from fulfillment.models.shipment import Shipment


def failed_delivery_threshold(shipment: Shipment) -> bool:
    if not shipment.is_delayed:
        return True

    if not shipment.estimated_delivery:
        return True

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    est = shipment.estimated_delivery
    if est.tzinfo is None:
        est = est.replace(tzinfo=timezone.utc)

    hours_overdue = (now - est).total_seconds() / 3600

    threshold_hours = (settings.failed_delivery_threshold_pct / 100.0) * 72

    return hours_overdue <= threshold_hours
