"""
Run on PythonAnywhere:  python fix_paths_v2.py
Reads raw DB values and fixes absolute paths in image fields.
"""
import os, sys, sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')
print(f"Database: {DB_PATH}")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

fixed = 0

# Check all tables with image columns
tables_cols = [
    ('cross_asistent_articulos', 'encabezado'),
    ('cross_asistent_database', 'imagen'),
    ('cross_asistent_galeria', 'imagen'),
    ('cross_asistent_mapa', 'imagen'),
]

# Also try ArticuloAlbum
try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%album%'")
    for row in cursor.fetchall():
        tables_cols.append((row[0], 'imagen'))
except:
    pass

for table, col in tables_cols:
    try:
        cursor.execute(f"SELECT rowid, {col} FROM {table}")
        rows = cursor.fetchall()
        for rowid, val in rows:
            if val and (val.startswith('/') or '/media/' in val):
                if '/media/' in val:
                    new_val = val.split('/media/', 1)[-1]
                else:
                    new_val = os.path.basename(val)
                print(f"  [{table}] row {rowid}: '{val}' -> '{new_val}'")
                cursor.execute(f"UPDATE {table} SET {col} = ? WHERE rowid = ?", (new_val, rowid))
                fixed += 1
            elif val:
                print(f"  [{table}] row {rowid}: OK '{val}'")
    except Exception as e:
        print(f"  [{table}] skipped: {e}")

conn.commit()
conn.close()
print(f"\n✅ Fixed {fixed} paths total.")
