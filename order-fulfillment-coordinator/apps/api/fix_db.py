import sqlite3

conn = sqlite3.connect("fulfillment.db")
c = conn.cursor()
c.execute("UPDATE orders SET status='shipped' WHERE status='SHIPPED'")
c.execute("UPDATE orders SET status='delivered' WHERE status='DELIVERED'")
c.execute("UPDATE orders SET status='cancelled' WHERE status='CANCELLED'")
c.execute("UPDATE shipments SET status='in_transit' WHERE status='SHIPPED'")
c.execute("UPDATE shipments SET status='delivered' WHERE status='DELIVERED'")
c.execute("UPDATE shipments SET status='in_transit' WHERE status='IN_TRANSIT'")
conn.commit()
for row in c.execute("SELECT status, count(*) FROM orders GROUP BY status"):
    print("Orders:", row)
for row in c.execute("SELECT status, count(*) FROM shipments GROUP BY status"):
    print("Shipments:", row)
conn.close()
