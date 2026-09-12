"""
Expiry Checker Module
Flags medicines nearing expiration (30/60/90 days) and already expired stock.
Enforces FEFO (First-Expired, First-Out) protocol.
"""
from datetime import datetime
import pandas as pd

def check_expiries(medicines_df, reference_date_str="2026-09-12"):
    """
    Evaluates expiration status for each medicine.
    Categories:
    - EXPIRED (< 0 days)
    - CRITICAL (1 - 30 days)
    - WARNING (31 - 60 days)
    - WATCHLIST (61 - 90 days)
    - SAFE (> 90 days)
    """
    ref_date = datetime.strptime(reference_date_str, "%Y-%m-%d")
    results = []
    
    for _, row in medicines_df.iterrows():
        try:
            exp_date = datetime.strptime(row['expiry_date'], "%Y-%m-%d")
            days_left = (exp_date - ref_date).days
        except Exception:
            days_left = 365
            
        if days_left < 0:
            status = "EXPIRED"
            action = "QUARANTINE: Pull from shelves immediately, log disposal/distributor claim."
            color = "red"
        elif days_left <= 30:
            status = "CRITICAL (<= 30 Days)"
            action = "FEFO PRIORITY: Move to billing front, discount or expedite dispensing."
            color = "orange"
        elif days_left <= 60:
            status = "WARNING (<= 60 Days)"
            action = "PRIORITIZE: Dispense before newer batches, pause incoming purchase orders."
            color = "yellow"
        elif days_left <= 90:
            status = "WATCH (<= 90 Days)"
            action = "MONITOR: Compare remaining units against 60-day run-rate."
            color = "amber"
        else:
            status = "SAFE"
            action = "Standard storage and dispensing."
            color = "green"
            
        results.append({
            'medicine_id': row['id'],
            'name': row['name'],
            'batch_number': row['batch_number'],
            'category': row['category'],
            'stock_quantity': row['stock_quantity'],
            'expiry_date': row['expiry_date'],
            'days_left': days_left,
            'status': status,
            'color': color,
            'action': action
        })
        
    df_exp = pd.DataFrame(results)
    return df_exp.sort_values(by='days_left', ascending=True)
