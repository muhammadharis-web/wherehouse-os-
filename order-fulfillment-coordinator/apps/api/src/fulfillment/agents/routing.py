from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.models.carrier_rate import CarrierRate
from fulfillment.models.fulfillment_center import FulfillmentCenter
from fulfillment.models.order import Order, OrderStatus
from fulfillment.models.shipment import Shipment, ShipmentStatus

logger = logging.getLogger(__name__)


class RoutingError(Exception):
    pass


class RoutingAgent:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def select_fulfillment_center(self, order: Order) -> FulfillmentCenter | None:
        result = await self.db.execute(
            select(FulfillmentCenter)
            .where(FulfillmentCenter.is_active)
            .where(FulfillmentCenter.current_daily_orders < FulfillmentCenter.max_daily_orders)
            .order_by(FulfillmentCenter.capacity_pct.asc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_best_rates(
        self,
        origin_zip: str,
        destination_zip: str,
        weight_kg: float,
        max_cost: float | None = None,
    ) -> list[CarrierRate]:
        query = (
            select(CarrierRate)
            .where(CarrierRate.is_active)
            .where(CarrierRate.origin_zip == origin_zip)
            .where(CarrierRate.destination_zip == destination_zip)
            .where(CarrierRate.weight_kg_min <= weight_kg)
            .where(CarrierRate.weight_kg_max >= weight_kg)
            .order_by(CarrierRate.base_rate.asc())
        )
        if max_cost is not None:
            query = query.where(CarrierRate.base_rate <= max_cost)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def route_order(self, order: Order) -> dict:
        fc = await self.select_fulfillment_center(order)
        if fc is None:
            raise RoutingError("No available fulfillment center with capacity")

        rates = await self.get_best_rates(
            origin_zip=fc.zip_code,
            destination_zip=order.shipping_zip,
            weight_kg=order.total_weight_kg,
        )
        if not rates:
            raise RoutingError("No suitable carrier rates found for route")

        best_rate = rates[0]
        shipping_cost = best_rate.base_rate + (best_rate.rate_per_kg * order.total_weight_kg)

        tracking_number = f"TRK-{uuid4().hex[:12].upper()}"

        order.fulfillment_center_id = fc.id
        order.carrier_id = best_rate.id
        order.tracking_number = tracking_number
        order.shipping_cost = shipping_cost
        order.status = OrderStatus.PROCESSING
        order.estimated_delivery = datetime.now(timezone.utc)

        shipment = Shipment(
            id=str(uuid4()),
            order_id=order.id,
            carrier_name=best_rate.carrier_name,
            tracking_number=tracking_number,
            status=ShipmentStatus.LABEL_CREATED,
            estimated_delivery=order.estimated_delivery,
            origin_zip=fc.zip_code,
            destination_zip=order.shipping_zip,
            weight_kg=order.total_weight_kg,
            shipping_cost=shipping_cost,
        )
        self.db.add(shipment)

        fc.current_daily_orders += 1

        return {
            "fulfillment_center": {"id": fc.id, "name": fc.name},
            "carrier": {"id": best_rate.id, "name": best_rate.carrier_name, "service": best_rate.service_name},
            "tracking_number": tracking_number,
            "shipping_cost": shipping_cost,
            "estimated_delivery": order.estimated_delivery.isoformat(),
            "estimated_days": f"{best_rate.estimated_days_min}-{best_rate.estimated_days_max}",
        }
