import sqlite3, uuid
conn = sqlite3.connect('fulfillment.db')
c = conn.cursor()
fcs = [
    ('Lahore FC', '1 KM Defense Rd, Lahore', '54000', 'Lahore', 'Punjab', 'PK', 31.5204, 74.3587, 0.75, 500, 187),
    ('Karachi FC', 'Port Qasim Authority, Karachi', '74000', 'Karachi', 'Sindh', 'PK', 24.8607, 67.0011, 0.60, 400, 120),
    ('Islamabad FC', 'Sector I-9, Islamabad', '44000', 'Islamabad', 'Islamabad', 'PK', 33.6844, 73.0479, 0.45, 300, 68),
]
for fc in fcs:
    c.execute('INSERT INTO fulfillment_centers (id, name, address, zip_code, city, state, country, latitude, longitude, is_active, capacity_pct, max_daily_orders, current_daily_orders) VALUES (?,?,?,?,?,?,?,?,?,1,?,?,?)', (str(uuid.uuid4()), *fc))
carriers_data = [
    ('DHL','Express',100,5000,0,10,15.0,2.5,1,3), ('FedEx','Express',100,5000,0,10,12.0,3.0,1,4),
    ('FedEx','Economy',5001,10000,0,25,10.0,2.0,3,6), ('UPS','Express',100,5000,0,10,14.0,3.5,1,3),
    ('UPS','Economy',5001,10000,0,25,9.0,2.5,3,7), ('USPS','Priority',100,5000,0,10,8.0,1.5,2,5),
    ('TCS','Express',100,5000,0,10,11.0,2.0,1,3), ('Leopards','Standard',100,5000,0,10,7.0,1.0,2,5),
]
for cd in carriers_data:
    c.execute('INSERT INTO carrier_rates (id, carrier_name, service_name, origin_zip, destination_zip, weight_kg_min, weight_kg_max, base_rate, rate_per_kg, estimated_days_min, estimated_days_max, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)', (str(uuid.uuid4()), *cd))
conn.commit()
c.execute('SELECT COUNT(*) FROM fulfillment_centers')
print(f'FCs: {c.fetchone()[0]}')
c.execute('SELECT COUNT(*) FROM carrier_rates')
print(f'Carriers: {c.fetchone()[0]}')
conn.close()
