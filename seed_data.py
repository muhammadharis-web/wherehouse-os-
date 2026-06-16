import sqlite3
import uuid
from datetime import datetime, timedelta

conn = sqlite3.connect('C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db')
c = conn.cursor()

# Get order IDs
c.execute("SELECT id FROM orders")
orders = c.fetchall()
print('Order IDs:', orders)

# Add sample shipments
carriers = ['FedEx', 'UPS', 'DHL', 'USPS']
statuses = ['delivered', 'in_transit', 'in_transit', 'delivered', 'in_transit']

for i, (order_id,) in enumerate(orders):
    carrier = carriers[i % len(carriers)]
    status = statuses[i % len(statuses)]
    created = datetime.now() - timedelta(days=i * 2)
    estimated = created + timedelta(days=3)
    actual = (estimated - timedelta(hours=2)).isoformat() if status == 'delivered' else None
    is_delayed = 0 if status == 'delivered' else (1 if i % 3 == 0 else 0)
    cost = 10.50 + (i * 2.5)
    shipment_id = str(uuid.uuid4())
    
    c.execute("""
        INSERT INTO shipments (id, order_id, carrier_name, tracking_number, status, 
                              estimated_delivery, actual_delivery, shipping_cost, is_delayed, 
                              origin_zip, destination_zip, weight_kg, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (shipment_id, order_id, carrier, f'TRACK{order_id}{i:03d}', status, 
          estimated.isoformat(), actual, cost, is_delayed, 
          '10001', '90210', 2.5 + i * 0.5, created.isoformat()))

conn.commit()
print('Added', len(orders), 'shipments')

c.execute("SELECT count(*) FROM shipments")
print('Total shipments:', c.fetchone())