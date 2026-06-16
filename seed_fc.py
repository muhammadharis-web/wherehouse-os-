import sqlite3, uuid
conn = sqlite3.connect('C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/fulfillment.db')
c = conn.cursor()

c.execute('SELECT count(*) FROM fulfillment_centers')
if c.fetchone()[0] == 0:
    fcs = [
        ('Lahore FC', '1 Main Blvd', '54000', 'Lahore', 'Punjab', 'PK', 31.52, 74.36, 1, 30, 500, 100),
        ('Karachi FC', '2 Port Rd', '74000', 'Karachi', 'Sindh', 'PK', 24.86, 67.01, 1, 45, 500, 150),
        ('Islamabad FC', '3 Civic Ctr', '44000', 'Islamabad', 'Islamabad', 'PK', 33.68, 73.05, 1, 20, 500, 80),
    ]
    for fc in fcs:
        c.execute("""INSERT INTO fulfillment_centers 
            (id, name, address, zip_code, city, state, country, latitude, longitude, 
             is_active, capacity_pct, max_daily_orders, current_daily_orders, created_at, updated_at) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))""", 
            (str(uuid.uuid4()),) + fc)
    print('Added 3 FCs')

c.execute('SELECT count(*) FROM carrier_rates')
if c.fetchone()[0] == 0:
    rates = [
        ('FedEx', 'Express', '54000', '74000', 0, 50, 15.0, 2.5, 1, 3),
        ('FedEx', 'Express', '54000', '44000', 0, 50, 12.0, 2.0, 1, 2),
        ('UPS', 'Ground', '54000', '74000', 0, 50, 10.0, 1.5, 1, 4),
        ('UPS', 'Ground', '54000', '44000', 0, 50, 8.0, 1.5, 1, 3),
        ('DHL', 'Express', '54000', '74000', 0, 50, 18.0, 3.0, 1, 2),
        ('TCS', 'Standard', '54000', '74000', 0, 50, 8.0, 1.0, 1, 5),
        ('TCS', 'Standard', '54000', '44000', 0, 50, 6.0, 1.0, 1, 4),
        ('Leopards', 'Standard', '54000', '74000', 0, 50, 7.0, 1.2, 1, 5),
    ]
    for r in rates:
        c.execute("""INSERT INTO carrier_rates 
            (id, carrier_name, service_name, origin_zip, destination_zip, 
             weight_kg_min, weight_kg_max, base_rate, rate_per_kg, 
             estimated_days_min, estimated_days_max, is_active, created_at, updated_at) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,1,datetime('now'),datetime('now'))""", 
            (str(uuid.uuid4()),) + r)
    print('Added 8 carrier rates')

conn.commit()
c.execute('SELECT name FROM fulfillment_centers')
print('FCs:', [r[0] for r in c.fetchall()])
c.execute('SELECT carrier_name, count(*) FROM carrier_rates GROUP BY carrier_name')
print('Rates:', dict(c.fetchall()))
