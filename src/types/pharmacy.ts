export type MedicineCategory =
  | 'Antibiotics'
  | 'Painkillers & Analgesics'
  | 'Seasonal Cold & Flu'
  | 'Chronic & Cardiovascular'
  | 'Diabetes Care'
  | 'Gastrointestinal'
  | 'Dermatological'
  | 'Vitamins & Supplements';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  batchNumber: string;
  manufacturer: string;
  category: MedicineCategory;
  unitPrice: number; // Selling price per unit ($/₹)
  costPrice: number; // Purchase cost from distributor
  stockQuantity: number;
  minThreshold: number; // Rule-based low stock threshold (e.g. 20)
  expiryDate: string; // YYYY-MM-DD
  leadTimeDays: number; // Supplier delivery lead time in days (e.g., 2 to 5 days)
  shelfLifeMonths: number;
  rackLocation: string; // e.g. "Aisle 2 - Shelf B"
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops';
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  category: MedicineCategory;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  patientType: 'Outpatient' | 'Walk-in' | 'Refill';
  batchNumber: string;
}

export interface DailySalesAggregate {
  date: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface ForecastDataPoint {
  date: string;
  historical?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface DemandForecastResult {
  medicineId: string;
  medicineName: string;
  category: MedicineCategory;
  currentStock: number;
  avgDailySales: number;
  trend: 'Increasing (Peak Season)' | 'Stable (Chronic Need)' | 'Decreasing' | 'Seasonal Fluctuating';
  trendSlope: number; // Daily change
  next7DaysDemand: number;
  next30DaysDemand: number;
  forecastPoints: ForecastDataPoint[];
  rSquared: number;
  seasonalityFactor: number;
}

export interface ReorderRecommendation {
  medicineId: string;
  medicineName: string;
  category: MedicineCategory;
  batchNumber: string;
  currentStock: number;
  avgDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
  reorderPoint: number;
  shouldReorder: boolean;
  urgency: 'CRITICAL' | 'REORDER_NOW' | 'OPTIMAL' | 'OVERSTOCKED';
  suggestedReorderQuantity: number;
  estimatedCost: number;
  daysOfStockRemaining: number;
  expiryConstraintNote?: string;
  daysToExpiry: number;
}

export interface ExpiryAlertItem {
  medicine: Medicine;
  daysToExpiry: number;
  status: 'EXPIRED' | 'CRITICAL_30' | 'WARNING_60' | 'WATCH_90' | 'SAFE';
  actionRequired: string;
}

export interface AnomalyItem {
  date: string;
  medicineId: string;
  medicineName: string;
  actualSales: number;
  expectedSales: number;
  zScore: number;
  type: 'SPIKE' | 'DIP';
  severity: 'HIGH' | 'MEDIUM';
  possibleCause: string;
}

export interface ClusterItem {
  medicineId: string;
  medicineName: string;
  category: MedicineCategory;
  turnoverScore: number; // 0 - 100
  revenueContribution: number;
  salesVolume: number;
  clusterLabel: 'Fast-Moving High-Turnover' | 'Seasonal Spike' | 'Steady Chronic' | 'Slow-Moving Low-Demand';
  abcClass: 'A' | 'B' | 'C'; // A = Top 70% value, B = 20% value, C = Bottom 10% value
}

export interface PharmacyStats {
  totalMedicines: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  expiredCount: number;
  expiringSoon30Count: number;
  expiringSoon90Count: number;
  todaySalesCount: number;
  todayRevenue: number;
  urgentReorderCount: number;
}
