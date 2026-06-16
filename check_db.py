import sqlite3
conn = sqlite3.connect('C:/Users/AC/Desktop/final project/order-fulfillment-coordinator/apps/api/src/fulfillment/fulfillment.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', c.fetchall())