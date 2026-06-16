import sqlite3
conn = sqlite3.connect(r'C:\Users\AC\Desktop\final project\order-fulfillment-coordinator\apps\api\fulfillment.db')
c = conn.cursor()

tables = ["fulfillment_centers", "carrier_rates", "orders", "shipments", "agent_events", "notifications"]
for t in tables:
    try:
        c.execute(f"SELECT count(*) FROM {t}")
        cnt = c.fetchone()[0]
        print(f"{t}: {cnt} rows")
    except Exception as e:
        print(f"{t}: ERROR - {e}")

conn.close()
