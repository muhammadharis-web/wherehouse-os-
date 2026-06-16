import sqlite3

conn = sqlite3.connect('C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db')
c = conn.cursor()

# Update some orders to shipped and delivered
c.execute("UPDATE orders SET status = 'shipped' WHERE id IN (SELECT id FROM orders LIMIT 3)")
c.execute("UPDATE orders SET status = 'delivered' WHERE id IN (SELECT id FROM orders LIMIT 3 OFFSET 3)")
c.execute("UPDATE orders SET status = 'cancelled' WHERE id IN (SELECT id FROM orders LIMIT 1 OFFSET 6)")

conn.commit()

c.execute('SELECT id, status FROM orders')
for row in c.fetchall():
    print(row)