import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from fulfillment.services.order_service import OrderService

async def route():
    engine = create_async_engine('sqlite+aiosqlite:///C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db')
    factory = async_sessionmaker(engine)
    async with factory() as session:
        service = OrderService(session)
        try:
            result = await service.route_order("240e794a255b4f12b0234d1fa4c3583b")
            print("Routed successfully!")
            print(f"  Fulfillment Center: {result.fulfillment_center_id}")
            print(f"  Carrier: {result.carrier_name}")
            print(f"  Tracking: {result.tracking_number}")
            print(f"  Cost: ${result.shipping_cost:.2f}")
            print(f"  Status: PROCESSING (updated)")
            await session.commit()
        except Exception as e:
            print(f"Error: {e}")
            await session.rollback()
    await engine.dispose()

asyncio.run(route())
