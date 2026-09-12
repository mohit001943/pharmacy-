"""
Smart Pharmacy Inventory & Demand Forecasting System
Main Streamlit Application
Run via terminal: streamlit run dashboard.py
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Import project modules
from modules.db_handler import init_db, get_all_medicines, get_all_sales, add_medicine, record_sale, update_medicine_stock
from modules.expiry_checker import check_expiries
from modules.low_stock_checker import check_low_stock
from modules.forecasting import forecast_demand
from modules.reorder_engine import calculate_reorder_recommendations
from modules.anomaly_detector import detect_anomalies

# Page setup
st.set_page_config(
    page_title="Smart Pharmacy Inventory System",
    page_icon="💊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title { font-size: 26px; font-weight: 700; color: #1e3a8a; }
    .metric-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .badge-expired { background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
    .badge-critical { background-color: #ffedd5; color: #9a3412; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
    .badge-safe { background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# Ensure DB is initialized
init_db()

# Load data
meds_df = get_all_medicines()
sales_df = get_all_sales()

# Check if seed data is needed
if meds_df.empty or sales_df.empty:
    st.warning("No data detected in database. Please run: python seed_data.py")
    if st.button("Auto-Seed Database with Sample Pharmacy Data"):
        from seed_data import seed_database
        seed_database()
        st.success("Database seeded! Refreshing...")
        st.rerun()
    st.stop()

# Reference Date for simulation
REF_DATE = "2026-09-12"

# Sidebar Navigation
st.sidebar.title("💊 Smart Pharmacy")
st.sidebar.caption("Offline ML Inventory & Expiry Tracking")

menu = st.sidebar.radio(
    "Navigation Menu",
    [
        "📊 Executive Overview",
        "📦 Medicine Inventory (CRUD)",
        "⚠️ Expiry & Low Stock Alerts",
        "📈 ML Demand Forecasting",
        "🔄 Smart Reorder Engine",
        "🚨 Outbreak & Anomaly Detection",
        "📝 Record New Sale",
        "🎓 Viva / ML Defense Guide"
    ]
)

st.sidebar.divider()
st.sidebar.info(f"📅 System Date: **{REF_DATE}**\n\nRuns 100% offline with zero external API calls.")

# -------------------------------------------------------------
# 1. EXECUTIVE OVERVIEW
# -------------------------------------------------------------
if menu == "📊 Executive Overview":
    st.markdown('<div class="main-title">Pharmacy Management & Inventory Intelligence</div>', unsafe_allow_html=True)
    st.caption("Real-time monitoring of stock levels, revenue, expiring batches, and automated ML reorder signals.")
    
    # Run analytics
    exp_df = check_expiries(meds_df, REF_DATE)
    low_df = check_low_stock(meds_df)
    reorder_df = calculate_reorder_recommendations(meds_df, sales_df, REF_DATE)
    
    expired_cnt = len(exp_df[exp_df['status'] == 'EXPIRED'])
    exp_30_cnt = len(exp_df[exp_df['status'] == 'CRITICAL (<= 30 Days)'])
    low_cnt = len(low_df)
    urgent_reorder_cnt = len(reorder_df[reorder_df['urgency'].isin(['CRITICAL', 'REORDER_NOW'])])
    
    total_inventory_val = (meds_df['stock_quantity'] * meds_df['unit_price']).sum()
    total_units = meds_df['stock_quantity'].sum()
    
    # Metrics Row
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Total SKU Count", len(meds_df))
    c2.metric("Total Units in Stock", f"{total_units:,}")
    c3.metric("Stock Valuation", f"${total_inventory_val:,.2f}")
    c4.metric("Urgent Low Stock", low_cnt, delta=f"-{low_cnt} items", delta_color="inverse")
    c5.metric("Expired / <30d Expiry", f"{expired_cnt} / {exp_30_cnt}", delta_color="inverse")
    
    st.divider()
    
    # Urgent Action Cards
    col_left, col_right = st.columns(2)
    
    with col_left:
        st.subheader("⚠️ Critical Expiry / Quarantine Watch")
        urgent_exp = exp_df[exp_df['days_left'] <= 60].head(6)
        if not urgent_exp.empty:
            for _, r in urgent_exp.iterrows():
                badge_class = "badge-expired" if r['days_left'] < 0 else "badge-critical"
                st.markdown(f"""
                <div style="border: 1px solid #fee2e2; background: #fffaf0; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px;">
                    <strong>{r['name']}</strong> ({r['category']})<br>
                    Batch: <code>{r['batch_number']}</code> | Expiry: <b>{r['expiry_date']}</b> ({r['days_left']} days left)
                    <br><span class="{badge_class}">{r['status']}</span> - {r['action']}
                </div>
                """, unsafe_allow_html=True)
        else:
            st.success("No medicines expiring within 60 days.")
            
    with col_right:
        st.subheader("🔄 High-Priority Reorders Needed")
        urgent_reorders = reorder_df[reorder_df['should_reorder']].head(6)
        if not urgent_reorders.empty:
            for _, r in urgent_reorders.iterrows():
                st.markdown(f"""
                <div style="border: 1px solid #fed7aa; background: #fffbf5; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px;">
                    <strong>{r['name']}</strong> - Current: <b>{r['current_stock']} units</b> (ROP: {r['reorder_point']})<br>
                    Lead Time: {r['lead_time_days']}d | Days Stock Left: <b>{r['days_stock_remaining']} days</b><br>
                    Suggested Order: <b>+{r['suggested_quantity']} units</b> (Est: ${r['estimated_cost']})
                </div>
                """, unsafe_allow_html=True)
        else:
            st.success("All inventory levels are above their Reorder Points.")

    st.divider()
    
    # Category Distribution Chart
    st.subheader("📊 Inventory Breakdown by Therapeutic Category")
    cat_summary = meds_df.groupby('category').agg(
        Medicines=('id', 'count'),
        Total_Stock=('stock_quantity', 'sum')
    ).reset_index()
    
    fig = px.bar(
        cat_summary,
        x='category',
        y='Total_Stock',
        color='category',
        text='Total_Stock',
        title="Stock Quantity per Medicine Category"
    )
    fig.update_layout(xaxis_title="", yaxis_title="Total Stock Units", showlegend=False)
    st.plotly_chart(fig, use_container_width=True)

# -------------------------------------------------------------
# 2. MEDICINE INVENTORY (CRUD)
# -------------------------------------------------------------
elif menu == "📦 Medicine Inventory (CRUD)":
    st.markdown('<div class="main-title">Medicine Master Catalog (CRUD)</div>', unsafe_allow_html=True)
    st.caption("View, search, filter, and add new pharmaceutical SKUs.")
    
    # Top filters
    f_col1, f_col2, f_col3 = st.columns([2, 1, 1])
    search_query = f_col1.text_input("🔍 Search Medicine by Name, Generic Name, or Batch Number")
    cat_filter = f_col2.selectbox("Filter Category", ["All Categories"] + sorted(meds_df['category'].unique().tolist()))
    dosage_filter = f_col3.selectbox("Dosage Form", ["All Forms"] + sorted(meds_df['dosage_form'].unique().tolist()))
    
    filtered_df = meds_df.copy()
    if search_query:
        filtered_df = filtered_df[
            filtered_df['name'].str.contains(search_query, case=False, na=False) |
            filtered_df['generic_name'].str.contains(search_query, case=False, na=False) |
            filtered_df['batch_number'].str.contains(search_query, case=False, na=False)
        ]
    if cat_filter != "All Categories":
        filtered_df = filtered_df[filtered_df['category'] == cat_filter]
    if dosage_filter != "All Forms":
        filtered_df = filtered_df[filtered_df['dosage_form'] == dosage_filter]
        
    st.dataframe(
        filtered_df[[
            'id', 'name', 'generic_name', 'batch_number', 'category', 'unit_price',
            'cost_price', 'stock_quantity', 'min_threshold', 'expiry_date', 'lead_time_days', 'rack_location'
        ]],
        use_container_width=True,
        hide_index=True
    )
    
    # Add Medicine Form
    with st.expander("➕ Add New Medicine Record"):
        with st.form("add_med_form"):
            ac1, ac2 = st.columns(2)
            new_id = ac1.text_input("Medicine ID", value=f"med-{len(meds_df)+1:02d}")
            new_name = ac1.text_input("Trade / Brand Name (e.g. Dolo 650)")
            new_generic = ac1.text_input("Generic Formula (e.g. Paracetamol)")
            new_batch = ac1.text_input("Batch Number (e.g. BATCH-2026-X)")
            new_mfg = ac1.text_input("Manufacturer (e.g. Cipla Ltd)")
            new_cat = ac1.selectbox("Therapeutic Category", sorted(meds_df['category'].unique().tolist()))
            
            new_price = ac2.number_input("Selling Price ($)", min_value=0.1, value=5.0, step=0.5)
            new_cost = ac2.number_input("Cost Price ($)", min_value=0.1, value=3.0, step=0.5)
            new_stock = ac2.number_input("Initial Stock Quantity", min_value=0, value=50, step=5)
            new_min = ac2.number_input("Low Stock Threshold", min_value=1, value=20, step=5)
            new_expiry = ac2.date_input("Expiry Date", value=datetime(2027, 6, 30)).strftime("%Y-%m-%d")
            new_lead = ac2.number_input("Supplier Lead Time (Days)", min_value=1, value=3)
            new_rack = ac2.text_input("Rack Location", value="Aisle 1 - Bay A")
            
            submitted = st.form_submit_button("Save Medicine to Database")
            if submitted:
                if not new_name or not new_batch:
                    st.error("Please provide both Medicine Name and Batch Number!")
                else:
                    add_medicine({
                        'id': new_id, 'name': new_name, 'generic_name': new_generic,
                        'batch_number': new_batch, 'manufacturer': new_mfg, 'category': new_cat,
                        'unit_price': new_price, 'cost_price': new_cost, 'stock_quantity': new_stock,
                        'min_threshold': new_min, 'expiry_date': new_expiry, 'lead_time_days': new_lead,
                        'shelf_life_months': 24, 'rack_location': new_rack, 'dosage_form': 'Tablet'
                    })
                    st.success(f"Medicine '{new_name}' added successfully!")
                    st.rerun()

# -------------------------------------------------------------
# 3. EXPIRY & LOW STOCK ALERTS
# -------------------------------------------------------------
elif menu == "⚠️ Expiry & Low Stock Alerts":
    st.markdown('<div class="main-title">Expiry Tracking & Rule-Based Low Stock Alerts</div>', unsafe_allow_html=True)
    st.caption("Pharmacy-specific clinical safety alerts: prevent dispensing expired drugs and catch inventory stockouts early.")
    
    tab_exp, tab_low = st.tabs(["⏳ Expiry & FEFO Status", "📉 Low Stock Shortages"])
    
    with tab_exp:
        exp_df = check_expiries(meds_df, REF_DATE)
        
        col_f1, col_f2 = st.columns([1, 3])
        status_sel = col_f1.selectbox(
            "Filter Expiry Status",
            ["All", "EXPIRED", "CRITICAL (<= 30 Days)", "WARNING (<= 60 Days)", "WATCH (<= 90 Days)", "SAFE"]
        )
        
        display_exp = exp_df if status_sel == "All" else exp_df[exp_df['status'] == status_sel]
        
        st.dataframe(
            display_exp[['name', 'batch_number', 'category', 'stock_quantity', 'expiry_date', 'days_left', 'status', 'action']],
            use_container_width=True,
            hide_index=True
        )
        
    with tab_low:
        low_df = check_low_stock(meds_df)
        if low_df.empty:
            st.success("All medicines are currently above their configured minimum stock thresholds!")
        else:
            st.dataframe(
                low_df[['name', 'category', 'stock_quantity', 'min_threshold', 'deficit', 'severity', 'lead_time_days', 'rack_location']],
                use_container_width=True,
                hide_index=True
            )

# -------------------------------------------------------------
# 4. ML DEMAND FORECASTING
# -------------------------------------------------------------
elif menu == "📈 ML Demand Forecasting":
    st.markdown('<div class="main-title">Statistical & Machine Learning Demand Forecasting</div>', unsafe_allow_html=True)
    st.caption("Forecast future sales per medicine using regression trendlines, seasonality decomposition, and confidence intervals.")
    
    selected_med_id = st.selectbox(
        "Select Medicine to Forecast",
        meds_df['id'].tolist(),
        format_func=lambda x: f"{meds_df[meds_df['id']==x]['name'].values[0]} ({meds_df[meds_df['id']==x]['category'].values[0]})"
    )
    
    forecast_window = st.radio("Forecast Horizon", [7, 14, 30], horizontal=True)
    
    forecast_res = forecast_demand(sales_df, selected_med_id, forecast_window)
    
    if forecast_res:
        # Metrics summary
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Historical Avg Daily Sales", f"{forecast_res['avg_daily_sales']} units/day")
        m2.metric(f"Next {forecast_window}-Day Predicted Demand", f"{forecast_res['next_30_days'] if forecast_window==30 else forecast_res['next_7_days']} units")
        m3.metric("Detected Trend", forecast_res['trend'])
        m4.metric("Regression Slope (m)", f"{forecast_res['slope']} units/day")
        
        # Plotly Chart: Actual Historical + Future Forecast
        hist_df = forecast_res['historical_df']
        fore_df = forecast_res['forecast_df']
        
        fig = go.Figure()
        
        # Historical actual sales
        fig.add_trace(go.Scatter(
            x=pd.to_datetime(hist_df['sale_date']),
            y=hist_df['quantity'],
            mode='lines+markers',
            name='Historical Actual Sales',
            line=dict(color='#2563eb', width=2)
        ))
        
        # Forecasted trend
        fig.add_trace(go.Scatter(
            x=pd.to_datetime(fore_df['date']),
            y=fore_df['predicted'],
            mode='lines+markers',
            name='Predicted Future Demand',
            line=dict(color='#10b981', width=3, dash='dash')
        ))
        
        # Upper confidence bound
        fig.add_trace(go.Scatter(
            x=pd.to_datetime(fore_df['date']),
            y=fore_df['upper_bound'],
            mode='lines',
            line=dict(width=0),
            showlegend=False
        ))
        # Lower confidence bound (filled)
        fig.add_trace(go.Scatter(
            x=pd.to_datetime(fore_df['date']),
            y=fore_df['lower_bound'],
            mode='lines',
            line=dict(width=0),
            fill='tonexty',
            fillcolor='rgba(16, 185, 129, 0.15)',
            name='95% Confidence Interval'
        ))
        
        fig.update_layout(
            title=f"Demand Trajectory & Forecast for {meds_df[meds_df['id']==selected_med_id]['name'].values[0]}",
            xaxis_title="Date",
            yaxis_title="Units Sold / Day",
            hovermode="x unified"
        )
        st.plotly_chart(fig, use_container_width=True)
        
        st.info("💡 **Viva Concept:** The model decomposes historical time series into base trend (linear regression) and weekly cyclical seasonality (day-of-week multipliers). The shaded area demonstrates standard error bounds.")

# -------------------------------------------------------------
# 5. SMART REORDER ENGINE
# -------------------------------------------------------------
elif menu == "🔄 Smart Reorder Engine":
    st.markdown('<div class="main-title">ML-Assisted Reorder Point & Quantity Engine</div>', unsafe_allow_html=True)
    st.caption("Computes Reorder Point = (Avg Daily Sales × Lead Time) + Safety Stock, with Expiry-Aware logic.")
    
    reorder_df = calculate_reorder_recommendations(meds_df, sales_df, REF_DATE)
    
    st.markdown("""
    **Core Formula Defense:**
    - $\\text{Safety Stock} = Z \\times \\sigma_{\\text{daily}} \\times \\sqrt{L}$ (where $Z = 1.65$ for 95% cycle service level)
    - $\\text{Reorder Point (ROP)} = (d_{\\text{avg}} \\times L) + \\text{Safety Stock}$
    - **Expiry-Aware Guard:** Capped order quantities for slow-moving medicines to prevent future batch expiration.
    """)
    
    st.dataframe(
        reorder_df[[
            'name', 'category', 'current_stock', 'avg_daily_sales', 'lead_time_days',
            'safety_stock', 'reorder_point', 'urgency', 'suggested_quantity', 'estimated_cost', 'expiry_note'
        ]],
        use_container_width=True,
        hide_index=True
    )

# -------------------------------------------------------------
# 6. OUTBREAK & ANOMALY DETECTION
# -------------------------------------------------------------
elif menu == "🚨 Outbreak & Anomaly Detection":
    st.markdown('<div class="main-title">Sales Anomaly & Outbreak Surge Detection</div>', unsafe_allow_html=True)
    st.caption("Identifies unusual demand spikes (possible viral outbreak) or unexpected dips (stockout/misplacement) via Z-Scores.")
    
    anomalies_df = detect_anomalies(sales_df)
    
    if not anomalies_df.empty:
        st.warning(f"Detected {len(anomalies_df)} statistical anomalies across recent transactions.")
        st.dataframe(anomalies_df, use_container_width=True, hide_index=True)
    else:
        st.success("No abnormal sales spikes or dips detected.")

# -------------------------------------------------------------
# 7. RECORD NEW SALE
# -------------------------------------------------------------
elif menu == "📝 Record New Sale":
    st.markdown('<div class="main-title">Dispense Medicine / Point of Sale</div>', unsafe_allow_html=True)
    st.caption("Logs a dispensing transaction and automatically updates the SQLite inventory quantity.")
    
    with st.form("sale_form"):
        s_med_id = st.selectbox(
            "Select Medicine to Dispense",
            meds_df['id'].tolist(),
            format_func=lambda x: f"{meds_df[meds_df['id']==x]['name'].values[0]} (Stock: {meds_df[meds_df['id']==x]['stock_quantity'].values[0]})"
        )
        selected_med = meds_df[meds_df['id'] == s_med_id].iloc[0]
        
        sqty = st.number_input("Quantity to Dispense", min_value=1, max_value=int(selected_med['stock_quantity']), value=1)
        stype = st.selectbox("Patient Type", ["Walk-in", "Refill Prescription", "Outpatient Clinic"])
        
        unit_p = float(selected_med['unit_price'])
        total_p = round(sqty * unit_p, 2)
        st.write(f"**Total Amount:** ${total_p:.2f}")
        
        confirm = st.form_submit_button("Record & Dispense")
        if confirm:
            sale_dict = {
                'id': f"sale-custom-{int(datetime.now().timestamp())}",
                'medicine_id': selected_med['id'],
                'medicine_name': selected_med['name'],
                'category': selected_med['category'],
                'quantity': sqty,
                'unit_price': unit_p,
                'total_amount': total_p,
                'sale_date': REF_DATE,
                'timestamp': datetime.now().isoformat(),
                'patient_type': stype,
                'batch_number': selected_med['batch_number']
            }
            record_sale(sale_dict)
            st.success(f"Dispensed {sqty} units of {selected_med['name']}! Inventory updated.")
            st.rerun()

# -------------------------------------------------------------
# 8. VIVA / ML DEFENSE GUIDE
# -------------------------------------------------------------
elif menu == "🎓 Viva / ML Defense Guide":
    st.markdown('<div class="main-title">Viva Preparation & Machine Learning Q&A</div>', unsafe_allow_html=True)
    st.caption("Concise, technical answers designed for a 3rd year engineering evaluation.")
    
    st.markdown("""
    ### 1. How does the Demand Forecasting ML model work?
    - **Concept:** Time-series decomposition.
    - **Components:**
      1. **Linear Trend (OLS Regression):** Measures whether baseline demand is growing or shrinking ($y = mx + c$).
      2. **Cyclical Day-of-Week Seasonality:** Normalizes sales volume on weekends vs. weekdays ($s_t = y_t / \\bar{y}$).
      3. **Prediction Interval:** Computes 95% confidence bounds using the standard error of regression residuals ($SE \\times 1.96$).
      
    ### 2. What is the Reorder Point formula and how is Safety Stock determined?
    - **Formula:** $\\text{ROP} = (d_{\\text{avg}} \\times L) + \\text{Safety Stock}$
    - **Safety Stock Formula:** $\\text{SS} = Z \\times \\sigma_d \\times \\sqrt{L}$
    - **Viva Defense:** $Z = 1.65$ ensures a 95% cycle service level against demand volatility and supplier delivery delays ($L$).
    
    ### 3. What is "Expiry-Aware Reorder Logic"?
    - Generic warehouse models assume infinite shelf life. In a pharmacy, ordering excessive quantities of slow-moving drugs guarantees financial loss due to batch expiration.
    - **Our Innovation:** The system checks: $\\text{Expected Sellout Days} = \\text{Order Quantity} / d_{\\text{avg}}$. If this exceeds the batch expiry horizon or shelf life, the order quantity is dynamically penalized/capped.
    
    ### 4. How does Outbreak / Anomaly Detection work?
    - Uses rolling statistical $Z$-Scores: $Z = (X - \\mu) / \\sigma$.
    - Any sudden spike ($Z > 2.5$) flags a potential localized outbreak (e.g. influenza wave) or bulk dispensing.
    """)
