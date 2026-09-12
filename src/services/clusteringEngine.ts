import { Medicine, SaleRecord, ClusterItem } from '../types/pharmacy';

export function runInventoryClusteringAndABC(medicines: Medicine[], sales: SaleRecord[]): ClusterItem[] {
  // Aggregate sales volume and revenue per medicine
  const statsMap: { [medId: string]: { volume: number; revenue: number } } = {};

  sales.forEach(s => {
    if (!statsMap[s.medicineId]) {
      statsMap[s.medicineId] = { volume: 0, revenue: 0 };
    }
    statsMap[s.medicineId].volume += s.quantity;
    statsMap[s.medicineId].revenue += s.totalAmount;
  });

  const totalPharmacyRevenue = Object.values(statsMap).reduce((acc, curr) => acc + curr.revenue, 0) || 1;

  // Compute metrics per medicine
  const items = medicines.map(med => {
    const stats = statsMap[med.id] || { volume: 0, revenue: 0 };
    const stockRatio = med.stockQuantity > 0 ? stats.volume / med.stockQuantity : stats.volume;
    const turnoverScore = Math.min(100, Math.round(stockRatio * 10));
    const revenueContribution = Number(((stats.revenue / totalPharmacyRevenue) * 100).toFixed(2));

    // K-Means style rule assignment based on behavioral features:
    // (Category, Turnover, Demand profile)
    let clusterLabel: ClusterItem['clusterLabel'] = 'Slow-Moving Low-Demand';

    if (med.category === 'Seasonal Cold & Flu') {
      clusterLabel = 'Seasonal Spike';
    } else if (
      med.category === 'Chronic & Cardiovascular' ||
      med.category === 'Diabetes Care'
    ) {
      clusterLabel = 'Steady Chronic';
    } else if (turnoverScore >= 35 || stats.volume > 400) {
      clusterLabel = 'Fast-Moving High-Turnover';
    } else {
      clusterLabel = 'Slow-Moving Low-Demand';
    }

    return {
      medicineId: med.id,
      medicineName: med.name,
      category: med.category,
      turnoverScore,
      revenueContribution,
      salesVolume: stats.volume,
      clusterLabel,
      abcClass: 'C' as 'A' | 'B' | 'C', // will compute next
    };
  });

  // Sort descending by revenue contribution for ABC classification
  items.sort((a, b) => b.revenueContribution - a.revenueContribution);

  let cumulativePercentage = 0;
  items.forEach(item => {
    cumulativePercentage += item.revenueContribution;
    if (cumulativePercentage <= 70) {
      item.abcClass = 'A'; // High-value items representing ~70% cumulative revenue
    } else if (cumulativePercentage <= 90) {
      item.abcClass = 'B'; // Moderate-value items representing ~20% cumulative revenue
    } else {
      item.abcClass = 'C'; // Low-value bulk items representing bottom ~10% cumulative revenue
    }
  });

  return items;
}
