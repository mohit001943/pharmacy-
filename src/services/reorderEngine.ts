import { Medicine, SaleRecord, ReorderRecommendation } from '../types/pharmacy';
import { calculateDaysBetween } from './expiryChecker';
import { REFERENCE_DATE } from './seedData';

export function calculateReorderRecommendation(
  medicine: Medicine,
  sales: SaleRecord[],
  referenceDate: string = REFERENCE_DATE
): ReorderRecommendation {
  const medSales = sales.filter(s => s.medicineId === medicine.id);

  // Daily sales map for past 60 days
  const salesByDate: { [date: string]: number } = {};
  medSales.forEach(s => {
    salesByDate[s.date] = (salesByDate[s.date] || 0) + s.quantity;
  });

  const dailyValues = Object.values(salesByDate);
  const recentDaysCount = Math.max(1, dailyValues.length);

  // 1. Average Daily Sales (d_avg)
  const totalSold = dailyValues.reduce((a, b) => a + b, 0);
  const avgDailySales = Math.max(0.5, Number((totalSold / recentDaysCount).toFixed(2)));

  // 2. Standard Deviation of Daily Sales (sigma_d)
  const variance =
    dailyValues.reduce((sum, val) => sum + Math.pow(val - avgDailySales, 2), 0) / Math.max(1, recentDaysCount);
  const stdDevDailySales = Math.sqrt(variance);

  // 3. Lead Time (L) in days
  const leadTimeDays = medicine.leadTimeDays || 3;

  // 4. Safety Stock = Z * stdDev * sqrt(LeadTime)
  // Z = 1.65 corresponds to standard 95% cycle service level
  const Z = 1.65;
  const rawSafetyStock = Math.round(Z * stdDevDailySales * Math.sqrt(leadTimeDays));
  const safetyStock = Math.max(3, rawSafetyStock);

  // 5. Reorder Point (ROP) = (Avg Daily Sales * Lead Time) + Safety Stock
  const reorderPoint = Math.round(avgDailySales * leadTimeDays + safetyStock);

  // Days to Expiry calculation
  const daysToExpiry = calculateDaysBetween(referenceDate, medicine.expiryDate);

  // Check if current stock has reached or dropped below ROP
  const shouldReorder = medicine.stockQuantity <= reorderPoint || medicine.stockQuantity <= medicine.minThreshold;

  // Days of stock remaining before total stockout
  const daysOfStockRemaining = Math.round(medicine.stockQuantity / avgDailySales);

  // 6. Base Suggested Order Quantity (Target Level Order-up-to policy)
  // Review period = 14 days (bi-weekly pharmacy distributor replenishment cycle)
  const reviewPeriodDays = 14;
  const targetStockLevel = Math.round(avgDailySales * (leadTimeDays + reviewPeriodDays) + safetyStock);
  let suggestedReorderQuantity = Math.max(0, targetStockLevel - medicine.stockQuantity);

  // Round up to standard box lot (multiples of 10 for pharmaceutical standard packaging)
  if (suggestedReorderQuantity > 0) {
    suggestedReorderQuantity = Math.ceil(suggestedReorderQuantity / 10) * 10;
  }

  // 7. EXPIRY-AWARE REORDER LOGIC (Unique Pharmacy Intelligence)
  // If current batch is expired or expiring in < 30 days, we MUST NOT count expired units towards healthy stock
  let expiryConstraintNote: string | undefined = undefined;

  if (daysToExpiry <= 0) {
    expiryConstraintNote = 'CURRENT STOCK EXPIRED: Existing units quarantined. Full replenishment recommended with fresh batch.';
  } else if (daysToExpiry <= 45) {
    // Current stock will expire soon
    const sellableBeforeExpiry = Math.floor(daysToExpiry * avgDailySales);
    if (medicine.stockQuantity > sellableBeforeExpiry) {
      const potentialWastage = medicine.stockQuantity - sellableBeforeExpiry;
      expiryConstraintNote = `EXPIRY RISK: ~${potentialWastage} units of current batch may expire before sold. Prioritize FEFO dispensing immediately.`;
    }
  }

  // Check shelf life constraint on incoming order:
  // For slow-moving medicines, do not order more than can be comfortably sold within half their shelf life
  const maxSafeUnitsForShelfLife = Math.floor(avgDailySales * (medicine.shelfLifeMonths * 30 * 0.4));
  if (suggestedReorderQuantity > maxSafeUnitsForShelfLife && maxSafeUnitsForShelfLife > 0) {
    suggestedReorderQuantity = Math.max(10, Math.floor(maxSafeUnitsForShelfLife / 10) * 10);
    expiryConstraintNote = `QUANTITY ADJUSTED: Order throttled to ${suggestedReorderQuantity} units to avoid overstocking slow-moving drug with shelf life constraints.`;
  }

  // Determine urgency level
  let urgency: ReorderRecommendation['urgency'] = 'OPTIMAL';
  if (medicine.stockQuantity <= 5 || daysOfStockRemaining <= 2) {
    urgency = 'CRITICAL';
  } else if (shouldReorder) {
    urgency = 'REORDER_NOW';
  } else if (medicine.stockQuantity > reorderPoint * 2.5) {
    urgency = 'OVERSTOCKED';
  }

  const estimatedCost = Number((suggestedReorderQuantity * medicine.costPrice).toFixed(2));

  return {
    medicineId: medicine.id,
    medicineName: medicine.name,
    category: medicine.category,
    batchNumber: medicine.batchNumber,
    currentStock: medicine.stockQuantity,
    avgDailySales,
    leadTimeDays,
    safetyStock,
    reorderPoint,
    shouldReorder,
    urgency,
    suggestedReorderQuantity,
    estimatedCost,
    daysOfStockRemaining,
    expiryConstraintNote,
    daysToExpiry,
  };
}

export function getAllReorderRecommendations(
  medicines: Medicine[],
  sales: SaleRecord[],
  referenceDate: string = REFERENCE_DATE
): ReorderRecommendation[] {
  return medicines
    .map(m => calculateReorderRecommendation(m, sales, referenceDate))
    .sort((a, b) => {
      // Prioritize CRITICAL, then REORDER_NOW, then by lowest days of stock remaining
      const urgencyRank = { CRITICAL: 0, REORDER_NOW: 1, OPTIMAL: 2, OVERSTOCKED: 3 };
      if (urgencyRank[a.urgency] !== urgencyRank[b.urgency]) {
        return urgencyRank[a.urgency] - urgencyRank[b.urgency];
      }
      return a.daysOfStockRemaining - b.daysOfStockRemaining;
    });
}
