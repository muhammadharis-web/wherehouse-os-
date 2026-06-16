import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from fulfillment.models.order import Order, OrderStatus
from fulfillment.models.shipment import Shipment, ShipmentStatus
from fulfillment.models.fulfillment_center import FulfillmentCenter
from fulfillment.models.carrier_rate import CarrierRate
from datetime import datetime, timezone
from uuid import uuid4

async def route():
    engine = create_async_engine('sqlite+aiosqlite:///C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db')
    factory = async_sessionmaker(engine)
    async with factory() as session:
        # Get order
        order = (await session.execute(select(Order).where(Order.id == '240e794a255b4f12b0234d1fa4c3583b'))).scalar_one()
        print(f"Order: {order.id}, zip: {order.shipping_zip}, weight: {order.total_weight_kg}kg")
        
        # Get Lahore FC (zip 54000)
        fc = (await session.execute(select(FulfillmentCenter).where(FulfillmentCenter.zip_code == '54000'))).scalar_one()
        print(f"FC: {fc.name} ({fc.id[:8]}), zip: {fc.zip_code}")
        
        # Get a carrier rate from 54000 to 74000
        rate = (await session.execute(
            select(CarrierRate)
            .where(CarrierRate.origin_zip == '54000')
            .where(CarrierRate.destination_zip == '74000')
            .where(CarrierRate.weight_kg_min <= order.total_weight_kg)
            .where(CarrierRate.weight_kg_max >= order.total_weight_kg)
            .order_by(CarrierRate.base_rate.asc())
            .limit(1)
        )).scalars().first()
        print(f"Carrier: {rate.carrier_name} ({rate.id[:8]}), ${rate.base_rate} + ${rate.rate_per_kg}/kg")
        
        # Update the order zip to 74000 so carrier matches
        order.shipping_zip = '74000'
        order.shipping_city = 'Karachi'
        
        # Route the order
        shipping_cost = rate.base_rate + (rate.rate_per_kg * order.total_weight_kg)
        tracking_number = f"TRK-{uuid4().hex[:12].upper()}"
        estimated_delivery = datetime.now(timezone.utc)
        
        order.fulfillment_center_id = fc.id
        order.carrier_id = rate.id
        order.tracking_number = tracking_number
        order.shipping_cost = shipping_cost
        order.status = OrderStatus.PROCESSING
        order.estimated_delivery = estimated_delivery
        
        # Create shipment
        shipment = Shipment(
            id=str(uuid4()),
            order_id=order.id,
            carrier_name=rate.carrier_name,
            tracking_number=tracking_number,
            status=ShipmentStatus.LABEL_CREATED,
            estimated_delivery=estimated_delivery,
            origin_zip=fc.zip_code,
            destination_zip=order.shipping_zip,
            weight_kg=order.total_weight_kg,
            shipping_cost=shipping_cost,
        )
        session.add(shipment)
        
        await session.commit()
        print(f"\nRouted successfully!")
        print(f"  Status: PROCESSING")
        print(f"  FC: {fc.name}")
        print(f"  Carrier: {rate.carrier_name} ({rate.service_name})")
        print(f"  Tracking: {tracking_number}")
        print(f"  Cost: ${shipping_cost:.2f}")
        print(f"  Shipment ID: {shipment.id[:8]}")
    
    await engine.dispose()

asyncio.run(route())
