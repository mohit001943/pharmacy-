"""
Reorder Recommendation Engine
Calculates Reorder Point (ROP), Safety Stock, and optimal Order Quantity.
Includes Expiry-Aware logic to prevent ordering excess units for slow-moving drugs.
"""
import numpy as np
import pandas as pd
from datetime import datetime

def calculate_reorder_recommendations(medicines_df, sales_df, reference_date_str="2026-09-12"):
    """
    Computes reorder requirements across all medicines.
    
    Formulas:
    - Safety Stock = Z * sigma_daily * sqrt(Lead_Time)   (Z = 1.65 for 95% service level)
    - Reorder Point (ROP) = (Avg Daily Sales * Lead Time) + Safety Stock
    - Suggested Order = max(0, Target Level - Current Stock)
    - Expiry Awareness: Checks if remaining shelf life allows selling the suggested batch.
    """
    recommendations = []
    ref_date = datetime.strptime(reference_date_str, "%Y-%m-%d")
    
    for _, med in medicines_df.iterrows():
        med_id = med['id']
        current_stock = int(med['stock_quantity'])
        min_threshold = int(med.get('min_threshold', 20))
        lead_time = int(med.get('lead_time_days', 3))
        shelf_life_months = int(med.get('shelf_life_months', 24))
        
        # Calculate daily sales
        med_sales = sales_df[sales_df['medicine_id'] == med_id]
        if not med_sales.empty:
            daily_series = med_sales.groupby('sale_date')['quantity'].sum()
            avg_daily = float(daily_series.tail(30).mean()) if len(daily_series) > 0 else 2.0
            std_daily = float(daily_series.tail(30).std()) if len(daily_series) > 1 else 1.0
        else:
            avg_daily = 2.0
            std_daily = 1.0
            
        avg_daily = max(0.5, avg_daily)
        if np.isnan(std_daily):
            std_daily = 1.0
            
        # 1. Safety Stock
        Z = 1.65  # 95% Cycle Service Level
        safety_stock = int(np.ceil(Z * std_daily * np.sqrt(lead_time)))
        safety_stock = max(3, safety_stock)
        
        # 2. Reorder Point (ROP)
        rop = int(np.ceil(avg_daily * lead_time + safety_stock))
        
        # 3. Expiry date diff
        try:
            exp_date = datetime.strptime(med['expiry_date'], "%Y-%m-%d")
            days_to_expiry = (exp_date - ref_date).days
        except Exception:
            days_to_expiry = 365
            
        # 4. Target Stock & Suggested Order (Review period = 14 days)
        target_stock = int(np.ceil(avg_daily * (lead_time + 14) + safety_stock))
        raw_order = max(0, target_stock - current_stock)
        suggested_order = int(np.ceil(raw_order / 10.0) * 10) if raw_order > 0 else 0
        
        # 5. Expiry-Aware Adjustment
        expiry_warning = ""
        if days_to_expiry <= 0:
            expiry_warning = "CURRENT BATCH EXPIRED: Quarantined. Order fresh stock immediately."
        elif days_to_expiry <= 45:
            sellable = int(days_to_expiry * avg_daily)
            if current_stock > sellable:
                expiry_warning = f"EXPIRY RISK: ~{current_stock - sellable} current units may expire before sold. Apply FEFO."
                
        # Shelf life cap for slow moving drugs
        max_shelf_demand = int(avg_daily * (shelf_life_months * 30 * 0.4))
        if suggested_order > max_shelf_demand and max_shelf_demand > 0:
            suggested_order = max(10, (max_shelf_demand // 10) * 10)
            expiry_warning = f"ORDER CAPPED: Reduced to {suggested_order} to prevent slow-moving drug wastage."
            
        # Flag reorder condition
        should_reorder = (current_stock <= rop) or (current_stock <= min_threshold)
        
        # Urgency
        if current_stock <= 5:
            urgency = "CRITICAL"
        elif should_reorder:
            urgency = "REORDER_NOW"
        elif current_stock > rop * 2.5:
            urgency = "OVERSTOCKED"
        else:
            urgency = "OPTIMAL"
            
        days_stock_remaining = int(current_stock / avg_daily) if avg_daily > 0 else 999
        est_cost = round(suggested_order * float(med['cost_price']), 2)
        
        recommendations.append({
            'medicine_id': med_id,
            'name': med['name'],
            'category': med['category'],
            'batch_number': med['batch_number'],
            'current_stock': current_stock,
            'avg_daily_sales': round(avg_daily, 2),
            'lead_time_days': lead_time,
            'safety_stock': safety_stock,
            'reorder_point': rop,
            'should_reorder': should_reorder,
            'urgency': urgency,
            'suggested_quantity': suggested_order,
            'days_stock_remaining': days_stock_remaining,
            'days_to_expiry': days_to_expiry,
            'estimated_cost': est_cost,
            'expiry_note': expiry_warning
        })
        
    df_rec = pd.DataFrame(recommendations)
    return df_rec.sort_values(by=['should_reorder', 'days_stock_remaining'], ascending=[False, True])
