# Smart Pharmacy Inventory Tracking System (Offline ML Mini Project)

A complete, 100% offline, zero-API dependency system demonstrating practical Machine Learning for pharmacy inventory optimization, expiry mitigation, and automated demand replenishment.

## Features
- **Medicine Inventory Tracking:** Complete CRUD management with batch number, expiry date, category, and shelf rack locations.
- **Rule-Based Low Stock Alerts:** Flags inventory dropping below safety thresholds (`stock <= min_threshold`).
- **FEFO Expiry Tracker:** Categorizes batches into Expired, Critical (<=30 days), Warning (<=60 days), and Watchlist (<=90 days).
- **ML Demand Forecasting:** Time-series decomposition (trend regression + day-of-week seasonality + 95% confidence intervals).
- **Smart Reorder Recommendation:** Calculates $ROP = (d_{\text{avg}} \times L) + \text{Safety Stock}$, with Expiry-Aware ordering constraints.
- **Outbreak & Anomaly Detection:** $Z$-Score anomaly detection to detect localized epidemics or record inaccuracies.
- **Point-of-Sale Dispensing:** Log sales with automated inventory deduction.

---

## How to Run in VS Code Localhost

### 1. Open in VS Code
Open the project directory in VS Code or any terminal.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize SQLite Database & Seed Data
Generates 32 realistic medicines and 180 days of historical sales records with seasonal curves:
```bash
python seed_data.py
```

### 4. Run the Streamlit Dashboard
```bash
streamlit run dashboard.py
```
Streamlit will automatically open in your browser at `http://localhost:8501`.
