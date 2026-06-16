from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class KPIsResponse(BaseModel):
    total_orders: int = 0
    orders_shipped: int = 0
    orders_delivered: int = 0
    orders_delayed: int = 0
    on_time_delivery_rate: float = 0.0
    avg_delivery_time_days: float = 0.0
    total_shipping_cost: float = 0.0
    avg_shipping_cost: float = 0.0
    failed_delivery_rate: float = 0.0
    period_start: datetime | None = None
    period_end: datetime | None = None


class CarrierAnalyticsResponse(BaseModel):
    carrier_name: str
    total_shipments: int = 0
    on_time_shipments: int = 0
    delayed_shipments: int = 0
    on_time_rate: float = 0.0
    avg_cost: float = 0.0
    total_cost: float = 0.0
    avg_delivery_days: float = 0.0
