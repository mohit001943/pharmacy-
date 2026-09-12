"""
Demand Forecasting Module
Predicts future daily demand per medicine using historical sales data.
Uses Linear Trend Regression combined with Day-of-Week Seasonality Decomposition.
Designed to be lightweight, 100% offline, and easy to explain in viva exams.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def forecast_demand(sales_df, med_id, forecast_days=30):
    """
    Predicts next `forecast_days` (e.g. 7 or 30 days) of demand for a medicine.
    
    ML Methodology:
    1. Daily Sales Aggregation: Sums quantities sold per date.
    2. Seasonality Factor: Computes 7-day cyclical multiplier (e.g. weekend peak).
    3. Trend Regression: Fits ordinary least squares (y = m*x + c) over recent sales.
    4. Projection: Combines trend * seasonal multiplier, with 95% confidence intervals.
    """
    # Filter sales for the specific medicine
    med_sales = sales_df[sales_df['medicine_id'] == med_id].copy()
    if med_sales.empty:
        return None
    
    # Aggregate by date
    daily = med_sales.groupby('sale_date')['quantity'].sum().reset_index()
    daily['sale_date'] = pd.to_datetime(daily['sale_date'])
    daily = daily.sort_values('sale_date')
    
    if len(daily) < 5:
        # Fallback if insufficient historical data
        avg_q = daily['quantity'].mean() if not daily.empty else 5.0
        return {
            'avg_daily_sales': round(avg_q, 2),
            'next_7_days': round(avg_q * 7),
            'next_30_days': round(avg_q * 30),
            'trend': 'Stable',
            'slope': 0.0,
            'forecast_df': pd.DataFrame()
        }
    
    # Day-of-week seasonality (0 = Monday, 6 = Sunday)
    daily['dayofweek'] = daily['sale_date'].dt.dayofweek
    dow_avg = daily.groupby('dayofweek')['quantity'].mean()
    overall_mean = daily['quantity'].mean()
    dow_factors = (dow_avg / (overall_mean if overall_mean > 0 else 1.0)).to_dict()
    
    # Linear Regression over the last 60 days
    recent = daily.tail(60).copy()
    recent['time_idx'] = np.arange(len(recent))
    
    x = recent['time_idx'].values
    y = recent['quantity'].values
    
    # Slope and intercept: y = m*x + c
    n = len(x)
    sum_x = np.sum(x)
    sum_y = np.sum(y)
    sum_xy = np.sum(x * y)
    sum_xx = np.sum(x * x)
    
    denom = n * sum_xx - sum_x**2
    if denom != 0:
        slope = (n * sum_xy - sum_x * sum_y) / denom
        intercept = (sum_y - slope * sum_x) / n
    else:
        slope = 0.0
        intercept = overall_mean
        
    residuals = y - (slope * x + intercept)
    residual_std = np.std(residuals) if len(residuals) > 1 else 1.5
    
    # Generate future dates
    last_date = daily['sale_date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, forecast_days + 1)]
    
    forecast_records = []
    for i, f_date in enumerate(future_dates):
        dow = f_date.weekday()
        future_idx = len(recent) + i
        base_val = max(1.0, slope * future_idx + intercept)
        seasonal_val = base_val * dow_factors.get(dow, 1.0)
        
        predicted = max(0.0, round(seasonal_val, 1))
        lower = max(0.0, round(predicted - 1.96 * residual_std, 1))
        upper = round(predicted + 1.96 * residual_std, 1)
        
        forecast_records.append({
            'date': f_date.strftime('%Y-%m-%d'),
            'predicted': predicted,
            'lower_bound': lower,
            'upper_bound': upper
        })
        
    forecast_df = pd.DataFrame(forecast_records)
    
    # Determine trend description
    if slope > 0.08:
        trend = 'Increasing (Peak Season)'
    elif slope < -0.08:
        trend = 'Decreasing'
    else:
        trend = 'Stable Demand'
        
    next_7 = int(forecast_df.head(7)['predicted'].sum())
    next_30 = int(forecast_df.head(30)['predicted'].sum())
    
    return {
        'avg_daily_sales': round(float(daily['quantity'].tail(30).mean()), 2),
        'next_7_days': next_7,
        'next_30_days': next_30,
        'trend': trend,
        'slope': round(float(slope), 3),
        'forecast_df': forecast_df,
        'historical_df': daily.tail(30)[['sale_date', 'quantity']]
    }
