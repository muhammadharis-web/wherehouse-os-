from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.models.shipment import Shipment

logger = logging.getLogger(__name__)


async def compute_shipment_stats(
    db: AsyncSession,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> dict[str, Any]:
    query = select(
        func.count(Shipment.id).label("total"),
        func.sum(case((Shipment.is_delayed, 1), else_=0)).label("delayed"),
        func.avg(Shipment.shipping_cost).label("avg_cost"),
        func.sum(Shipment.shipping_cost).label("total_cost"),
    )
    if start_date:
        query = query.where(Shipment.created_at >= start_date)
    if end_date:
        query = query.where(Shipment.created_at <= end_date)

    result = await db.execute(query)
    row = result.one()

    total = row.total or 0
    delayed = row.delayed or 0
    return {
        "total_shipments": total,
        "delayed_shipments": delayed,
        "delay_rate": round((delayed / total) * 100, 2) if total > 0 else 0.0,
        "avg_shipping_cost": round(float(row.avg_cost or 0), 2),
        "total_shipping_cost": round(float(row.total_cost or 0), 2),
    }


async def compute_carrier_kpis(
    db: AsyncSession,
    carrier_name: str,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> dict[str, Any]:
    query = select(
        func.count(Shipment.id).label("total"),
        func.sum(case((~Shipment.is_delayed, 1), else_=0)).label("on_time"),
        func.sum(case((Shipment.is_delayed, 1), else_=0)).label("delayed"),
        func.avg(Shipment.shipping_cost).label("avg_cost"),
    ).where(Shipment.carrier_name == carrier_name)

    if start_date:
        query = query.where(Shipment.created_at >= start_date)
    if end_date:
        query = query.where(Shipment.created_at <= end_date)

    result = await db.execute(query)
    row = result.one()

    total = row.total or 0
    on_time = row.on_time or 0
    return {
        "carrier_name": carrier_name,
        "total_shipments": total,
        "on_time_shipments": on_time,
        "delayed_shipments": row.delayed or 0,
        "on_time_rate": round((on_time / total) * 100, 2) if total > 0 else 0.0,
        "avg_cost": round(float(row.avg_cost or 0), 2),
    }


async def get_delivery_performance(
    db: AsyncSession,
    days_back: int = 30,
) -> dict[str, Any]:
    cutoff = datetime.now(timezone.utc)
    query = select(
        func.date_trunc("day", Shipment.updated_at).label("day"),
        func.count(Shipment.id).label("total"),
        func.sum(case((Shipment.is_delayed, 1), else_=0)).label("delayed"),
        func.sum(case((Shipment.status == "delivered", 1), else_=0)).label("delivered"),
    ).where(Shipment.updated_at >= cutoff)

    result = await db.execute(
        query.group_by("day").order_by("day")
    )

    daily: list[dict[str, Any]] = []
    for row in result.all():
        daily.append({
            "date": row.day.isoformat() if hasattr(row.day, "isoformat") else str(row.day),
            "total": row.total or 0,
            "delayed": row.delayed or 0,
            "delivered": row.delivered or 0,
        })

    return {
        "period_days": days_back,
        "daily_performance": daily,
    }
