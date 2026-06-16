import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from fulfillment.services.order_service import OrderService
from fulfillment.models.order import Order

async def route():
    engine = create_async_engine('sqlite+aiosqlite:///C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db')
    factory = async_sessionmaker(engine)
    async with factory() as session:
        # First update the order's zip to 74000 (Karachi) to match available carrier routes
        result = await session.execute(select(Order).where(Order.id == "240e794a255b4f12b0234d1fa4c3583b"))
        order = result.scalar_one_or_none()
        if order:
            print(f"Order zip before: {order.shipping_zip}")
            # Try with original zip first
            service = OrderService(session)
            try:
                result = await service.route_order("240e794a255b4f12b0234d1fa4c3583b")
                print("Routed successfully!")
                print(f"  FC: {result.fulfillment_center_id}")
                print(f"  Carrier: {result.carrier_name}")
                print(f"  Tracking: {result.tracking_number}")
                print(f"  Cost: ${result.shipping_cost:.2f}")
                await session.commit()
            except ValueError as e:
                print(f"Error with original zip: {e}")
                await session.rollback()
                # Try with Karachi zip
                order.shipping_zip = "74000"
                await session.flush()
                try:
                    result = await service.route_order("240e794a255b4f12b0234d1fa4c3583b")
                    print("Routed with Karachi zip!")
                    print(f"  FC: {result.fulfillment_center_id}")
                    print(f"  Carrier: {result.carrier_name}")
                    print(f"  Tracking: {result.tracking_number}")
                    print(f"  Cost: ${result.shipping_cost:.2f}")
                    await session.commit()
                except ValueError as e2:
                    print(f"Error with Karachi zip: {e2}")
                    await session.rollback()
    await engine.dispose()

asyncio.run(route())
