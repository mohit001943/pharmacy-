"""
Low Stock Checker Module
Rule-based threshold alerting (stock <= min_threshold).
"""
import pandas as pd

def check_low_stock(medicines_df):
    """
    Flags medicines where stock_quantity <= min_threshold.
    Highlights critical shortage (<= 5 units).
    """
    results = []
    for _, row in medicines_df.iterrows():
        stock = int(row['stock_quantity'])
        thresh = int(row.get('min_threshold', 20))
        
        if stock <= thresh:
            deficit = thresh - stock
            if stock <= 5:
                severity = "CRITICAL DEFICIT"
            else:
                severity = "BELOW THRESHOLD"
                
            results.append({
                'medicine_id': row['id'],
                'name': row['name'],
                'category': row['category'],
                'stock_quantity': stock,
                'min_threshold': thresh,
                'deficit': deficit,
                'severity': severity,
                'lead_time_days': row.get('lead_time_days', 3),
                'rack_location': row.get('rack_location', 'N/A')
            })
            
    df_low = pd.DataFrame(results)
    if not df_low.empty:
        return df_low.sort_values(by='stock_quantity', ascending=True)
    return pd.DataFrame()
