"""
Anomaly Detector Module
Detects statistically abnormal sales spikes or dips using rolling Z-Scores / Isolation Forest concept.
Helps detect local epidemic surges (e.g. flu spike) or inventory leakage.
"""
import pandas as pd
import numpy as np

def detect_anomalies(sales_df, z_threshold=2.5):
    """
    Flags sales days where actual quantity diverges significantly from historical mean.
    Z = (x - mu) / sigma
    """
    anomalies = []
    
    # Group by medicine and date
    daily = sales_df.groupby(['medicine_id', 'medicine_name', 'category', 'sale_date'])['quantity'].sum().reset_index()
    
    for med_id, group in daily.groupby('medicine_id'):
        if len(group) < 14:
            continue
            
        mean_val = group['quantity'].mean()
        std_val = group['quantity'].std()
        
        if std_val == 0 or np.isnan(std_val):
            continue
            
        for _, row in group.tail(45).iterrows():
            q = row['quantity']
            z = (q - mean_val) / std_val
            
            if z >= z_threshold:
                anomalies.append({
                    'sale_date': row['sale_date'],
                    'medicine_name': row['medicine_name'],
                    'category': row['category'],
                    'actual_sold': int(q),
                    'expected_avg': round(mean_val, 1),
                    'z_score': round(z, 2),
                    'type': 'SPIKE (Demand Surge / Potential Outbreak)',
                    'severity': 'HIGH' if z >= 3.2 else 'MEDIUM'
                })
            elif z <= -2.2 and mean_val >= 6:
                anomalies.append({
                    'sale_date': row['sale_date'],
                    'medicine_name': row['medicine_name'],
                    'category': row['category'],
                    'actual_sold': int(q),
                    'expected_avg': round(mean_val, 1),
                    'z_score': round(z, 2),
                    'type': 'DIP (Suspected Stockout / Recording Issue)',
                    'severity': 'MEDIUM'
                })
                
    df_ano = pd.DataFrame(anomalies)
    if not df_ano.empty:
        return df_ano.sort_values(by=['sale_date', 'z_score'], ascending=[False, False])
    return pd.DataFrame()
