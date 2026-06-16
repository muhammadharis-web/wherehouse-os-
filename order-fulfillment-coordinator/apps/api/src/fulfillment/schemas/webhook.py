from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class OrderPlacedWebhook(BaseModel):
    event: str = "order.placed"
    external_order_id: str
    customer_email: EmailStr
    customer_phone: str | None = None
    shipping_address: str
    shipping_zip: str
    shipping_city: str
    shipping_state: str
    shipping_country: str = "US"
    items_json: str = "[]"
    total_weight_kg: float = 0.0
    notes: str | None = None
    timestamp: datetime | None = None

    @field_validator("shipping_zip")
    @classmethod
    def validate_zip(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 5:
            raise ValueError("shipping_zip must be at least 5 characters")
        return stripped


class ShipmentEventWebhook(BaseModel):
    event: str = "shipment.updated"
    tracking_number: str
    carrier: str
    status: str
    status_detail: str | None = None
    estimated_delivery: datetime | None = None
    actual_delivery: datetime | None = None
    location: str | None = None
    timestamp: datetime | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {
            "label_created", "picked_up", "in_transit", "out_for_delivery",
            "delivered", "exception", "delayed", "returned",
        }
        if v not in allowed:
            raise ValueError(f"Invalid status: {v}. Must be one of {allowed}")
        return v


class WebhookResponse(BaseModel):
    success: bool
    message: str
    order_id: str | None = None
