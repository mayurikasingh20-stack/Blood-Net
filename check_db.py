import sqlite3
conn = sqlite3.connect(r'D:\project-final\Blood-Net\Backend\instance\bloodnet.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Compare user 30 (old multi-role) vs 32 (new multi-role)
for uid in [30, 32]:
    cur.execute(f"SELECT * FROM users WHERE id = {uid}")
    row = dict(cur.fetchone())
    print(f"\nUser {uid}:")
    for k, v in row.items():
        print(f"  {k}: {repr(v)[:60]}")

# Also check donors for these users
cur.execute("SELECT id, user_id, blood_group, weight, screening_completed FROM donors WHERE user_id IN (30, 32)")
for r in cur.fetchall():
    print(f"\nDonor: {dict(r)}")

conn.close()
