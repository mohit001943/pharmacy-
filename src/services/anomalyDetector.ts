import { Medicine, SaleRecord, AnomalyItem } from '../types/pharmacy';

export function detectSalesAnomalies(medicines: Medicine[], sales: SaleRecord[]): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];

  medicines.forEach(med => {
    const medSales = sales.filter(s => s.medicineId === med.id);
    if (medSales.length < 14) return;

    // Daily quantities
    const salesByDate: { [date: string]: number } = {};
    medSales.forEach(s => {
      salesByDate[s.date] = (salesByDate[s.date] || 0) + s.quantity;
    });

    const dates = Object.keys(salesByDate).sort();
    const values = dates.map(d => salesByDate[d]);

    // Calculate overall mean and standard deviation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return;

    // Scan recent 45 days for statistical outliers (Z-Score > 2.5 or < -2.0)
    const scanDates = dates.slice(-45);

    scanDates.forEach(dateStr => {
      const val = salesByDate[dateStr];
      const zScore = (val - mean) / stdDev;

      if (zScore >= 2.5) {
        let possibleCause = 'Sudden surge in demand';
        if (med.category === 'Seasonal Cold & Flu' || med.category === 'Antibiotics') {
          possibleCause = 'Potential localized outbreak or seasonal viral spike in community';
        } else if (med.category === 'Painkillers & Analgesics') {
          possibleCause = 'Unusually high dispensing spike (review for bulk clinic prescription or dispensing verification)';
        } else {
          possibleCause = 'Demand surge or large bulk institutional dispensing';
        }

        anomalies.push({
          date: dateStr,
          medicineId: med.id,
          medicineName: med.name,
          actualSales: val,
          expectedSales: Math.round(mean),
          zScore: Number(zScore.toFixed(2)),
          type: 'SPIKE',
          severity: zScore >= 3.2 ? 'HIGH' : 'MEDIUM',
          possibleCause,
        });
      } else if (zScore <= -2.2 && mean >= 6) {
        anomalies.push({
          date: dateStr,
          medicineId: med.id,
          medicineName: med.name,
          actualSales: val,
          expectedSales: Math.round(mean),
          zScore: Number(zScore.toFixed(2)),
          type: 'DIP',
          severity: 'MEDIUM',
          possibleCause: 'Unusual absence of sales. Check for stockout, shelf misplacement, or logging delay.',
        });
      }
    });
  });

  // Sort by date descending, then severity
  return anomalies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
