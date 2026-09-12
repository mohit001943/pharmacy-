import { Medicine } from '../types/pharmacy';

export interface LowStockAlertItem {
  medicine: Medicine;
  deficit: number;
  stockPercentage: number;
  severity: 'CRITICAL_DEPLETION' | 'BELOW_THRESHOLD' | 'HEALTHY';
  statusMessage: string;
}

export function checkLowStock(medicine: Medicine): LowStockAlertItem {
  const { stockQuantity, minThreshold } = medicine;
  const deficit = Math.max(0, minThreshold - stockQuantity);
  const stockPercentage = Math.round((stockQuantity / Math.max(1, minThreshold)) * 100);

  if (stockQuantity <= 5) {
    return {
      medicine,
      deficit,
      stockPercentage,
      severity: 'CRITICAL_DEPLETION',
      statusMessage: `CRITICAL: Severe stock depletion (${stockQuantity} units left). Potential patient refusal risk!`,
    };
  } else if (stockQuantity <= minThreshold) {
    return {
      medicine,
      deficit,
      stockPercentage,
      severity: 'BELOW_THRESHOLD',
      statusMessage: `LOW STOCK: Inventory (${stockQuantity} units) has dropped below threshold (${minThreshold}).`,
    };
  }

  return {
    medicine,
    deficit: 0,
    stockPercentage,
    severity: 'HEALTHY',
    statusMessage: `Stock is adequate (${stockQuantity} units in stock).`,
  };
}

export function getAllLowStockAlerts(medicines: Medicine[]): LowStockAlertItem[] {
  return medicines
    .map(checkLowStock)
    .filter(item => item.severity !== 'HEALTHY')
    .sort((a, b) => a.medicine.stockQuantity - b.medicine.stockQuantity);
}
