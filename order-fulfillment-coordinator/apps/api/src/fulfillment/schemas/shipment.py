from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ShipmentRead(BaseModel):
    id: str
    order_id: str
    carrier_name: str
    tracking_number: str
    status: str
    estimated_delivery: datetime | None = None
    actual_delivery: datetime | None = None
    origin_zip: str
    destination_zip: str
    weight_kg: float
    shipping_cost: float | None = None
    carrier_status_detail: str | None = None
    is_delayed: bool = False
    delay_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ShipmentRerouteRequest(BaseModel):
    new_carrier_name: str = Field(..., min_length=1)
    reason: str = Field(..., min_length=1)

    @field_validator("new_carrier_name")
    @classmethod
    def validate_carrier(cls, v: str) -> str:
        return v.strip()


class ShipmentRerouteResponse(BaseModel):
    shipment_id: str
    previous_carrier: str
    new_carrier: str
    new_tracking_number: str
    new_estimated_delivery: datetime | None = None
    additional_cost: float = 0.0
    reroute_details: dict[str, Any] = {}
