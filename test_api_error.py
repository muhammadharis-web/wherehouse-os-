import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from fulfillment.models.order import Order

async def test():
    engine = create_async_engine("sqlite+aiosqlite:///C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db")
    async with engine.begin() as conn:
        result = await conn.execute(select(Order).limit(1))
        order = result.scalar_one_or_none()
        if order:
            print("Order found:", order.id, order.status)
        else:
            print("No orders")
    await engine.dispose()

asyncio.run(test())
