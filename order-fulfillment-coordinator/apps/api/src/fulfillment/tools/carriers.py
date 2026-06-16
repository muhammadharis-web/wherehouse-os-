from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.models.carrier_rate import CarrierRate

logger = logging.getLogger(__name__)


async def list_carriers(db: AsyncSession) -> list[dict[str, Any]]:
    result = await db.execute(
        select(CarrierRate.carrier_name).distinct().where(CarrierRate.is_active)
    )
    return [{"carrier_name": row[0]} for row in result.all()]


async def get_carrier_rate(
    db: AsyncSession,
    carrier_name: str,
    origin_zip: str,
    destination_zip: str,
    weight_kg: float,
) -> dict[str, Any] | None:
    result = await db.execute(
        select(CarrierRate)
        .where(CarrierRate.is_active)
        .where(CarrierRate.carrier_name == carrier_name)
        .where(CarrierRate.origin_zip == origin_zip)
        .where(CarrierRate.destination_zip == destination_zip)
        .where(CarrierRate.weight_kg_min <= weight_kg)
        .where(CarrierRate.weight_kg_max >= weight_kg)
        .order_by(CarrierRate.base_rate.asc())
        .limit(1)
    )
    rate = result.scalar_one_or_none()
    if rate is None:
        return None
    return {
        "id": rate.id,
        "carrier_name": rate.carrier_name,
        "service_name": rate.service_name,
        "base_rate": rate.base_rate,
        "rate_per_kg": rate.rate_per_kg,
        "total_estimated": rate.base_rate + (rate.rate_per_kg * weight_kg),
        "estimated_days_min": rate.estimated_days_min,
        "estimated_days_max": rate.estimated_days_max,
    }


async def shop_rates(
    db: AsyncSession,
    origin_zip: str,
    destination_zip: str,
    weight_kg: float,
) -> list[dict[str, Any]]:
    result = await db.execute(
        select(CarrierRate)
        .where(CarrierRate.is_active)
        .where(CarrierRate.origin_zip == origin_zip)
        .where(CarrierRate.destination_zip == destination_zip)
        .where(CarrierRate.weight_kg_min <= weight_kg)
        .where(CarrierRate.weight_kg_max >= weight_kg)
        .order_by(CarrierRate.base_rate.asc())
    )
    rates = list(result.scalars().all())
    return [
        {
            "id": r.id,
            "carrier_name": r.carrier_name,
            "service_name": r.service_name,
            "base_rate": r.base_rate,
            "rate_per_kg": r.rate_per_kg,
            "total_estimated": r.base_rate + (r.rate_per_kg * weight_kg),
            "estimated_days_min": r.estimated_days_min,
            "estimated_days_max": r.estimated_days_max,
        }
        for r in rates
    ]
