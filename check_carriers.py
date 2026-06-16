import sqlite3
conn = sqlite3.connect(r'C:\Users\AC\Desktop\final project\order-fulfillment-coordinator\apps\api\fulfillment.db')
c = conn.cursor()

print("=== Carrier Rates ===")
c.execute("SELECT id, carrier_name, origin_zip, destination_zip, weight_kg_min, weight_kg_max, base_rate, rate_per_kg FROM carrier_rates")
for r in c.fetchall():
    print(f"  {r[0][:8]} | {r[1]:15} | {r[2]:5} -> {r[3]:5} | {r[4]:4}-{r[5]:4}kg | ${r[6]:.2f} + ${r[7]:.2f}/kg")

print()
print("=== Fulfillment Centers ===")
c.execute("SELECT id, name, zip_code, capacity_pct FROM fulfillment_centers")
for r in c.fetchall():
    print(f"  {r[0][:8]} | {r[1]:20} | zip: {r[2]:5} | capacity: {r[3]}%")

print()
print("=== Order 240e ===")
c.execute("SELECT id, shipping_zip, total_weight_kg, status FROM orders WHERE id LIKE '240e%'")
for r in c.fetchall():
    print(f"  ID: {r[0]}, Zip: {r[1]}, Weight: {r[2]}kg, Status: {r[3]}")

conn.close()
