"""
Database Handler Module - SQLite CRUD Operations
Provides simple, well-commented functions for managing medicines and sales.
"""
import sqlite3
import os
import pandas as pd

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "pharmacy.db")

def get_connection():
    """Returns a connection to the SQLite database. Creates data folder if not present."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Creates the necessary SQLite tables if they do not already exist."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Medicines Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        generic_name TEXT,
        batch_number TEXT NOT NULL,
        manufacturer TEXT,
        category TEXT NOT NULL,
        unit_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL,
        min_threshold INTEGER NOT NULL DEFAULT 20,
        expiry_date TEXT NOT NULL,
        lead_time_days INTEGER DEFAULT 3,
        shelf_life_months INTEGER DEFAULT 24,
        rack_location TEXT,
        dosage_form TEXT
    )
    """)
    
    # Sales Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        medicine_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_amount REAL NOT NULL,
        sale_date TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        patient_type TEXT,
        batch_number TEXT,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    )
    """)
    
    conn.commit()
    conn.close()

def get_all_medicines():
    """Fetches all medicines as a pandas DataFrame."""
    conn = get_connection()
    df = pd.read_sql_query("SELECT * FROM medicines ORDER BY name ASC", conn)
    conn.close()
    return df

def get_medicine_by_id(med_id):
    """Fetches a single medicine by its ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medicines WHERE id = ?", (med_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def add_medicine(med_dict):
    """Inserts a new medicine record into the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO medicines (
        id, name, generic_name, batch_number, manufacturer, category,
        unit_price, cost_price, stock_quantity, min_threshold, expiry_date,
        lead_time_days, shelf_life_months, rack_location, dosage_form
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        med_dict['id'], med_dict['name'], med_dict.get('generic_name', ''),
        med_dict['batch_number'], med_dict.get('manufacturer', ''),
        med_dict['category'], med_dict['unit_price'], med_dict['cost_price'],
        med_dict['stock_quantity'], med_dict.get('min_threshold', 20),
        med_dict['expiry_date'], med_dict.get('lead_time_days', 3),
        med_dict.get('shelf_life_months', 24), med_dict.get('rack_location', 'Shelf A'),
        med_dict.get('dosage_form', 'Tablet')
    ))
    conn.commit()
    conn.close()

def update_medicine_stock(med_id, new_stock):
    """Updates the stock quantity of a medicine."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE medicines SET stock_quantity = ? WHERE id = ?", (new_stock, med_id))
    conn.commit()
    conn.close()

def record_sale(sale_dict):
    """
    Logs a sale transaction and automatically deducts stock from inventory.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Insert sale record
    cursor.execute("""
    INSERT INTO sales (
        id, medicine_id, medicine_name, category, quantity, unit_price,
        total_amount, sale_date, timestamp, patient_type, batch_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sale_dict['id'], sale_dict['medicine_id'], sale_dict['medicine_name'],
        sale_dict['category'], sale_dict['quantity'], sale_dict['unit_price'],
        sale_dict['total_amount'], sale_dict['sale_date'], sale_dict['timestamp'],
        sale_dict.get('patient_type', 'Walk-in'), sale_dict.get('batch_number', '')
    ))
    
    # 2. Decrement stock
    cursor.execute("""
    UPDATE medicines 
    SET stock_quantity = MAX(0, stock_quantity - ?) 
    WHERE id = ?
    """, (sale_dict['quantity'], sale_dict['medicine_id']))
    
    conn.commit()
    conn.close()

def get_all_sales():
    """Fetches all sales records as a pandas DataFrame."""
    conn = get_connection()
    df = pd.read_sql_query("SELECT * FROM sales ORDER BY sale_date DESC", conn)
    conn.close()
    return df

def get_sales_for_medicine(med_id):
    """Fetches sales history for a specific medicine."""
    conn = get_connection()
    df = pd.read_sql_query(
        "SELECT * FROM sales WHERE medicine_id = ? ORDER BY sale_date ASC",
        conn,
        params=(med_id,)
    )
    conn.close()
    return df
