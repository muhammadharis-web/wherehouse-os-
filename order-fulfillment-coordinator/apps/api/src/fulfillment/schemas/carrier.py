from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CarrierRateRequest(BaseModel):
    origin_zip: str = Field(..., min_length=5)
    destination_zip: str = Field(..., min_length=5)
    weight_kg: float = Field(..., gt=0)

    @field_validator("origin_zip", "destination_zip")
    @classmethod
    def strip_zip(cls, v: str) -> str:
        return v.strip()


class CarrierRateResponse(BaseModel):
    id: str
    carrier_name: str
    service_name: str
    origin_zip: str
    destination_zip: str
    weight_kg_min: float
    weight_kg_max: float
    base_rate: float
    rate_per_kg: float
    estimated_days_min: int
    estimated_days_max: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FulfillmentCenterRead(BaseModel):
    id: str
    name: str
    address: str
    zip_code: str
    city: str
    state: str
    country: str
    latitude: float | None = None
    longitude: float | None = None
    is_active: bool
    capacity_pct: float
    max_daily_orders: int
    current_daily_orders: int

    model_config = {"from_attributes": True}
