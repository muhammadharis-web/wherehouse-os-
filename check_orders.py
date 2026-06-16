import sqlite3
conn = sqlite3.connect(r'C:\Users\AC\Desktop\final project\order-fulfillment-coordinator\apps\api\fulfillment.db')
c = conn.cursor()
c.execute("SELECT status, count(*) FROM orders GROUP BY status")
print("Status counts:")
for r in c.fetchall():
    print(f"  {r[0]}: {r[1]}")
print()
c.execute("SELECT id, status FROM orders WHERE id LIKE '240e%'")
print("240e order:")
for r in c.fetchall():
    print(f"  ID: {r[0]}, Status: {r[1]}")
conn.close()
