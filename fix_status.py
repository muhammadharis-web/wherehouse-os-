import sqlite3
conn = sqlite3.connect(r'C:\Users\AC\Desktop\final project\order-fulfillment-coordinator\apps\api\fulfillment.db')
cur = conn.cursor()
cur.execute("UPDATE orders SET status = lower(status) WHERE status = 'PENDING'")
conn.commit()
print('Fixed', cur.rowcount, 'rows')
conn.close()
