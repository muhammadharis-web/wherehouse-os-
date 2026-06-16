from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class MonitorRequest(BaseModel):
    entity_ids: list[str] | None = None
    force_check_delays: bool = False


class MonitorResponse(BaseModel):
    cycle_id: str
    shipments_checked: int = 0
    delays_detected: int = 0
    reroutes_initiated: int = 0
    notifications_sent: int = 0
    anomalies_found: int = 0
    events: list[dict[str, Any]] = []
    completed_at: datetime
