import sqlite3
import uuid
from datetime import datetime, timedelta, timezone

conn = sqlite3.connect('fulfillment.db')
c = conn.cursor()

c.execute("SELECT id FROM orders")
orders = c.fetchall()
print('Order IDs:', orders)

carriers = ['FedEx', 'UPS', 'DHL', 'USPS']
now = datetime.now(timezone.utc)

for i, (order_id,) in enumerate(orders):
    carrier = carriers[i % len(carriers)]
    created = now - timedelta(days=i * 2)
    if i < 2:
        # Past ETA - these will be delayed
        estimated = now - timedelta(hours=6 if i == 0 else 2)
        is_delayed = 0
    else:
        estimated = created + timedelta(days=3)
        is_delayed = 0
    actual = estimated.isoformat() if i == 3 else None
    cost = 10.50 + (i * 2.5)
    shipment_id = str(uuid.uuid4()).replace('-', '')
    
    c.execute("""
        INSERT INTO shipments (id, order_id, carrier_name, tracking_number, status, 
                              estimated_delivery, actual_delivery, shipping_cost, is_delayed, 
                              origin_zip, destination_zip, weight_kg, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (shipment_id, order_id, carrier, f'TRACK{order_id}{i:03d}', 
          'in_transit' if i < 2 else ('delivered' if i in [3, 4] else 'in_transit'), 
          estimated.isoformat(), actual, cost, is_delayed, 
          '10001', '90210', 2.5 + i * 0.5, created.isoformat()))

conn.commit()
print('Added', len(orders), 'shipments')

c.execute("SELECT count(*) FROM shipments")
print('Total shipments:', c.fetchone())
conn.close()
