import { Medicine, SaleRecord, PharmacyStats } from '../types/pharmacy';
import { INITIAL_MEDICINES, generateSyntheticSalesData, REFERENCE_DATE } from './seedData';
import { getAllExpiryAlerts } from './expiryChecker';
import { getAllLowStockAlerts } from './lowStockChecker';
import { getAllReorderRecommendations } from './reorderEngine';

const STORAGE_KEY_MEDS = 'smart_pharmacy_medicines_v1';
const STORAGE_KEY_SALES = 'smart_pharmacy_sales_v1';

export function getStoredMedicines(): Medicine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read medicines from localStorage', e);
  }
  // Initialize with seed data
  saveStoredMedicines(INITIAL_MEDICINES);
  return INITIAL_MEDICINES;
}

export function saveStoredMedicines(medicines: Medicine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medicines));
  } catch (e) {
    console.error('Failed to save medicines to localStorage', e);
  }
}

export function getStoredSales(): SaleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SALES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read sales from localStorage', e);
  }
  // Initialize with synthetic sales
  const sales = generateSyntheticSalesData(INITIAL_MEDICINES);
  saveStoredSales(sales);
  return sales;
}

export function saveStoredSales(sales: SaleRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('Failed to save sales to localStorage', e);
  }
}

export function resetToSeedData(): { medicines: Medicine[]; sales: SaleRecord[] } {
  localStorage.removeItem(STORAGE_KEY_MEDS);
  localStorage.removeItem(STORAGE_KEY_SALES);
  saveStoredMedicines(INITIAL_MEDICINES);
  const sales = generateSyntheticSalesData(INITIAL_MEDICINES);
  saveStoredSales(sales);
  return { medicines: INITIAL_MEDICINES, sales };
}

export function calculateSummaryStats(medicines: Medicine[], sales: SaleRecord[]): PharmacyStats {
  const expiryAlerts = getAllExpiryAlerts(medicines);
  const lowStockAlerts = getAllLowStockAlerts(medicines);
  const reorders = getAllReorderRecommendations(medicines, sales);

  const totalStockUnits = medicines.reduce((sum, m) => sum + m.stockQuantity, 0);
  const totalInventoryValue = medicines.reduce((sum, m) => sum + m.stockQuantity * m.unitPrice, 0);

  // Today sales (using REFERENCE_DATE or latest date)
  const todaySales = sales.filter(s => s.date === REFERENCE_DATE);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const expiredCount = expiryAlerts.filter(a => a.status === 'EXPIRED').length;
  const expiringSoon30Count = expiryAlerts.filter(a => a.status === 'CRITICAL_30').length;
  const expiringSoon90Count = expiryAlerts.filter(a => a.status === 'WARNING_60' || a.status === 'WATCH_90').length;
  const urgentReorderCount = reorders.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'REORDER_NOW').length;

  return {
    totalMedicines: medicines.length,
    totalStockUnits,
    totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
    lowStockCount: lowStockAlerts.length,
    expiredCount,
    expiringSoon30Count,
    expiringSoon90Count,
    todaySalesCount: todaySales.reduce((acc, s) => acc + s.quantity, 0),
    todayRevenue: Number(todayRevenue.toFixed(2)),
    urgentReorderCount,
  };
}
