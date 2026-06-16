from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.config import settings
from fulfillment.models.notification import Notification


async def notification_frequency(order_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(func.count(Notification.id)).where(Notification.order_id == order_id)
    )
    count: int = result.scalar() or 0
    return count < settings.max_notifications_per_order
