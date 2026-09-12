"""
Seed Data Generator
Populates the SQLite database (data/pharmacy.db) with 32 realistic medicines
and 180 days of historical sales transactions with seasonal patterns.
Run directly with: python seed_data.py
"""
import os
import random
import math
from datetime import datetime, timedelta
from modules.db_handler import init_db, get_connection

SEED_MEDICINES = [
    # Seasonal Cold & Flu
    {"id": "med-01", "name": "Cough Syrup (DXM + CPM)", "generic_name": "Dextromethorphan HBr 10mg + CPM 2mg", "batch_number": "CS-2025-A10", "manufacturer": "Abbott Healthcare", "category": "Seasonal Cold & Flu", "unit_price": 6.5, "cost_price": 4.1, "stock_quantity": 14, "min_threshold": 25, "expiry_date": "2026-10-05", "lead_time_days": 3, "shelf_life_months": 24, "rack_location": "Aisle 1 - Bay B", "dosage_form": "Syrup"},
    {"id": "med-02", "name": "Cetirizine 10mg", "generic_name": "Cetirizine Hydrochloride", "batch_number": "CT-9941-B", "manufacturer": "Cipla Ltd", "category": "Seasonal Cold & Flu", "unit_price": 4.2, "cost_price": 2.5, "stock_quantity": 18, "min_threshold": 30, "expiry_date": "2026-10-25", "lead_time_days": 2, "shelf_life_months": 36, "rack_location": "Aisle 1 - Bay C", "dosage_form": "Tablet"},
    {"id": "med-03", "name": "Montelukast + Levocetirizine", "generic_name": "Montelukast 10mg + Levo 5mg", "batch_number": "ML-7812", "manufacturer": "Sun Pharma", "category": "Seasonal Cold & Flu", "unit_price": 8.5, "cost_price": 5.2, "stock_quantity": 65, "min_threshold": 20, "expiry_date": "2027-04-15", "lead_time_days": 4, "shelf_life_months": 24, "rack_location": "Aisle 1 - Bay D", "dosage_form": "Tablet"},
    {"id": "med-04", "name": "Cold & Sinus Relief Caplets", "generic_name": "Paracetamol 500mg + Phenylephrine", "batch_number": "CS-4402", "manufacturer": "GSK Consumer Health", "category": "Seasonal Cold & Flu", "unit_price": 5.0, "cost_price": 3.1, "stock_quantity": 8, "min_threshold": 25, "expiry_date": "2026-08-28", "lead_time_days": 3, "shelf_life_months": 24, "rack_location": "Aisle 1 - Bay A", "dosage_form": "Capsule"},
    
    # Antibiotics
    {"id": "med-05", "name": "Amoxicillin 500mg", "generic_name": "Amoxicillin Trihydrate", "batch_number": "AMX-2025-09", "manufacturer": "Pfizer Inc", "category": "Antibiotics", "unit_price": 9.8, "cost_price": 6.2, "stock_quantity": 84, "min_threshold": 30, "expiry_date": "2027-02-18", "lead_time_days": 4, "shelf_life_months": 24, "rack_location": "Aisle 2 - Bay A", "dosage_form": "Capsule"},
    {"id": "med-06", "name": "Azithromycin 500mg", "generic_name": "Azithromycin Dihydrate", "batch_number": "AZI-5520", "manufacturer": "Cipla Ltd", "category": "Antibiotics", "unit_price": 12.0, "cost_price": 7.8, "stock_quantity": 28, "min_threshold": 25, "expiry_date": "2026-11-10", "lead_time_days": 3, "shelf_life_months": 24, "rack_location": "Aisle 2 - Bay B", "dosage_form": "Tablet"},
    {"id": "med-07", "name": "Ciprofloxacin 500mg", "generic_name": "Ciprofloxacin HCl", "batch_number": "CIP-3301", "manufacturer": "Bayer Pharmaceuticals", "category": "Antibiotics", "unit_price": 11.5, "cost_price": 7.0, "stock_quantity": 42, "min_threshold": 20, "expiry_date": "2027-06-30", "lead_time_days": 5, "shelf_life_months": 36, "rack_location": "Aisle 2 - Bay C", "dosage_form": "Tablet"},
    {"id": "med-08", "name": "Cefixime 200mg", "generic_name": "Cefixime Trihydrate", "batch_number": "CFX-8819", "manufacturer": "Lupin Pharma", "category": "Antibiotics", "unit_price": 14.2, "cost_price": 9.0, "stock_quantity": 12, "min_threshold": 20, "expiry_date": "2026-09-02", "lead_time_days": 4, "shelf_life_months": 24, "rack_location": "Aisle 2 - Bay D", "dosage_form": "Tablet"},

    # Painkillers
    {"id": "med-09", "name": "Paracetamol 650mg", "generic_name": "Acetaminophen", "batch_number": "PCM-650-8", "manufacturer": "Micro Labs Ltd", "category": "Painkillers & Analgesics", "unit_price": 3.5, "cost_price": 1.8, "stock_quantity": 160, "min_threshold": 50, "expiry_date": "2027-12-31", "lead_time_days": 2, "shelf_life_months": 36, "rack_location": "Aisle 3 - Bay A", "dosage_form": "Tablet"},
    {"id": "med-10", "name": "Ibuprofen 400mg", "generic_name": "Ibuprofen", "batch_number": "IBU-9902", "manufacturer": "Abbott Healthcare", "category": "Painkillers & Analgesics", "unit_price": 4.8, "cost_price": 2.6, "stock_quantity": 19, "min_threshold": 35, "expiry_date": "2026-10-18", "lead_time_days": 3, "shelf_life_months": 36, "rack_location": "Aisle 3 - Bay B", "dosage_form": "Tablet"},
    {"id": "med-11", "name": "Diclofenac Gel 1%", "generic_name": "Diclofenac Diethylamine", "batch_number": "DIC-GEL-41", "manufacturer": "Novartis", "category": "Painkillers & Analgesics", "unit_price": 7.2, "cost_price": 4.5, "stock_quantity": 34, "min_threshold": 15, "expiry_date": "2027-03-20", "lead_time_days": 4, "shelf_life_months": 24, "rack_location": "Aisle 3 - Bay C", "dosage_form": "Ointment"},
    {"id": "med-12", "name": "Tramadol 50mg", "generic_name": "Tramadol Hydrochloride", "batch_number": "TRM-1011", "manufacturer": "Dr. Reddy Labs", "category": "Painkillers & Analgesics", "unit_price": 8.9, "cost_price": 5.5, "stock_quantity": 22, "min_threshold": 15, "expiry_date": "2027-08-15", "lead_time_days": 5, "shelf_life_months": 24, "rack_location": "Locked Cabinet - A", "dosage_form": "Capsule"},

    # Chronic & Cardiovascular
    {"id": "med-13", "name": "Telmisartan 40mg", "generic_name": "Telmisartan", "batch_number": "TEL-40-77", "manufacturer": "Glenmark Pharma", "category": "Chronic & Cardiovascular", "unit_price": 6.8, "cost_price": 4.0, "stock_quantity": 110, "min_threshold": 40, "expiry_date": "2028-01-10", "lead_time_days": 3, "shelf_life_months": 36, "rack_location": "Aisle 4 - Bay A", "dosage_form": "Tablet"},
    {"id": "med-14", "name": "Amlodipine 5mg", "generic_name": "Amlodipine Besylate", "batch_number": "AML-05-19", "manufacturer": "Pfizer Inc", "category": "Chronic & Cardiovascular", "unit_price": 5.2, "cost_price": 3.0, "stock_quantity": 95, "min_threshold": 35, "expiry_date": "2027-09-01", "lead_time_days": 2, "shelf_life_months": 36, "rack_location": "Aisle 4 - Bay B", "dosage_form": "Tablet"},
    {"id": "med-15", "name": "Atorvastatin 20mg", "generic_name": "Atorvastatin Calcium", "batch_number": "ATV-20-44", "manufacturer": "Sun Pharma", "category": "Chronic & Cardiovascular", "unit_price": 9.0, "cost_price": 5.6, "stock_quantity": 15, "min_threshold": 35, "expiry_date": "2026-11-28", "lead_time_days": 4, "shelf_life_months": 24, "rack_location": "Aisle 4 - Bay C", "dosage_form": "Tablet"},

    # Diabetes Care
    {"id": "med-16", "name": "Metformin 500mg SR", "generic_name": "Metformin HCl", "batch_number": "MET-500-SR", "manufacturer": "USV Private Ltd", "category": "Diabetes Care", "unit_price": 4.5, "cost_price": 2.7, "stock_quantity": 140, "min_threshold": 45, "expiry_date": "2027-10-30", "lead_time_days": 2, "shelf_life_months": 36, "rack_location": "Aisle 5 - Bay A", "dosage_form": "Tablet"},
    {"id": "med-17", "name": "Glimepiride 2mg", "generic_name": "Glimepiride", "batch_number": "GLM-02-83", "manufacturer": "Sanofi India", "category": "Diabetes Care", "unit_price": 6.0, "cost_price": 3.7, "stock_quantity": 45, "min_threshold": 25, "expiry_date": "2026-10-12", "lead_time_days": 3, "shelf_life_months": 24, "rack_location": "Aisle 5 - Bay B", "dosage_form": "Tablet"},
    {"id": "med-18", "name": "Insulin Glargine Pen", "generic_name": "Insulin Glargine 100 IU/ml", "batch_number": "INS-GL-90", "manufacturer": "Sanofi", "category": "Diabetes Care", "unit_price": 26.0, "cost_price": 19.5, "stock_quantity": 11, "min_threshold": 20, "expiry_date": "2026-12-05", "lead_time_days": 4, "shelf_life_months": 18, "rack_location": "Refrigerated Unit 1", "dosage_form": "Injection"},

    # Gastrointestinal
    {"id": "med-19", "name": "Pantoprazole 40mg", "generic_name": "Pantoprazole Sodium", "batch_number": "PAN-40-09", "manufacturer": "Alkem Labs", "category": "Gastrointestinal", "unit_price": 5.5, "cost_price": 3.2, "stock_quantity": 125, "min_threshold": 40, "expiry_date": "2027-07-20", "lead_time_days": 2, "shelf_life_months": 24, "rack_location": "Aisle 6 - Bay A", "dosage_form": "Tablet"},
    {"id": "med-20", "name": "Omeprazole 20mg", "generic_name": "Omeprazole Magnesium", "batch_number": "OME-20-11", "manufacturer": "Dr. Reddy Labs", "category": "Gastrointestinal", "unit_price": 4.8, "cost_price": 2.8, "stock_quantity": 16, "min_threshold": 30, "expiry_date": "2026-10-01", "lead_time_days": 3, "shelf_life_months": 24, "rack_location": "Aisle 6 - Bay B", "dosage_form": "Capsule"},

    # Vitamins
    {"id": "med-21", "name": "Vitamin D3 60k IU", "generic_name": "Cholecalciferol", "batch_number": "VD3-60K-04", "manufacturer": "Cadila Pharma", "category": "Vitamins & Supplements", "unit_price": 8.0, "cost_price": 4.8, "stock_quantity": 75, "min_threshold": 30, "expiry_date": "2027-10-15", "lead_time_days": 2, "shelf_life_months": 24, "rack_location": "Aisle 8 - Bay A", "dosage_form": "Capsule"},
    {"id": "med-22", "name": "Vitamin C 500mg Chewable", "generic_name": "Ascorbic Acid", "batch_number": "VTC-500-19", "manufacturer": "Abbott Healthcare", "category": "Vitamins & Supplements", "unit_price": 3.2, "cost_price": 1.8, "stock_quantity": 110, "min_threshold": 40, "expiry_date": "2027-06-18", "lead_time_days": 2, "shelf_life_months": 24, "rack_location": "Aisle 8 - Bay B", "dosage_form": "Tablet"},
]

def seed_database():
    print("Initializing SQLite database...")
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    # Clean existing
    cursor.execute("DELETE FROM sales")
    cursor.execute("DELETE FROM medicines")
    
    # Insert medicines
    print(f"Inserting {len(SEED_MEDICINES)} medicines...")
    for m in SEED_MEDICINES:
        cursor.execute("""
        INSERT INTO medicines VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            m['id'], m['name'], m['generic_name'], m['batch_number'], m['manufacturer'],
            m['category'], m['unit_price'], m['cost_price'], m['stock_quantity'],
            m['min_threshold'], m['expiry_date'], m['lead_time_days'], m['shelf_life_months'],
            m['rack_location'], m['dosage_form']
        ))
        
    # Generate 180 days sales
    print("Generating 180 days of realistic sales data with seasonal curves...")
    ref_date = datetime.strptime("2026-09-12", "%Y-%m-%d")
    random.seed(42)
    sales_count = 0
    
    for day_offset in range(180, 0, -1):
        cur_date = ref_date - timedelta(days=day_offset)
        date_str = cur_date.strftime("%Y-%m-%d")
        dow = cur_date.weekday()
        is_weekend = dow in [5, 6]
        weekend_boost = 1.25 if is_weekend else 0.95
        
        for med in SEED_MEDICINES:
            base = 5.0
            if med['category'] == 'Seasonal Cold & Flu':
                # Winter seasonal wave
                wave = 1.0 + 1.2 * math.sin((day_offset / 180.0) * 2 * math.pi + math.pi / 4.0)
                base = 8.0 * wave
            elif 'Chronic' in med['category'] or 'Diabetes' in med['category']:
                base = 9.0 + (180 - day_offset) * 0.015
            elif 'Painkiller' in med['category']:
                base = 12.0
            elif 'Antibiotic' in med['category']:
                base = 6.0
            else:
                base = 6.0
                
            qty = max(0, int(round(base * weekend_boost + random.uniform(-2, 2))))
            
            # Anomaly injection: Day offset 23 outbreak spike for flu/pain
            if day_offset == 23 and med['id'] in ['med-01', 'med-02', 'med-09']:
                qty = int(qty * 3.8)
                
            if qty > 0:
                sale_id = f"sale-{med['id']}-{day_offset}"
                total = round(qty * med['unit_price'], 2)
                cursor.execute("""
                INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    sale_id, med['id'], med['name'], med['category'], qty,
                    med['unit_price'], total, date_str, f"{date_str}T14:00:00Z",
                    "Walk-in" if day_offset % 2 == 0 else "Refill", med['batch_number']
                ))
                sales_count += 1
                
    conn.commit()
    conn.close()
    print(f"Database seeded successfully! Created {len(SEED_MEDICINES)} medicines and {sales_count} sales records in data/pharmacy.db.")

if __name__ == "__main__":
    seed_database()
