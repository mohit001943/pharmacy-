import { Medicine, SaleRecord, DemandForecastResult, ForecastDataPoint } from '../types/pharmacy';

export function runDemandForecast(
  medicine: Medicine,
  sales: SaleRecord[],
  forecastDays: number = 30
): DemandForecastResult {
  // Filter sales for this medicine
  const medSales = sales.filter(s => s.medicineId === medicine.id);

  // Group by date (daily aggregated quantities)
  const salesByDate: { [date: string]: number } = {};
  medSales.forEach(s => {
    salesByDate[s.date] = (salesByDate[s.date] || 0) + s.quantity;
  });

  const sortedDates = Object.keys(salesByDate).sort();

  // If very few records, fallback gracefully
  if (sortedDates.length < 7) {
    const defaultDaily = 5;
    const points: ForecastDataPoint[] = [];
    const today = new Date();

    for (let i = 0; i < forecastDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      points.push({
        date: dateStr,
        predicted: defaultDaily,
        lowerBound: Math.max(0, defaultDaily - 2),
        upperBound: defaultDaily + 2,
      });
    }

    return {
      medicineId: medicine.id,
      medicineName: medicine.name,
      category: medicine.category,
      currentStock: medicine.stockQuantity,
      avgDailySales: defaultDaily,
      trend: 'Stable (Chronic Need)',
      trendSlope: 0,
      next7DaysDemand: defaultDaily * 7,
      next30DaysDemand: defaultDaily * 30,
      forecastPoints: points,
      rSquared: 0.5,
      seasonalityFactor: 1.0,
    };
  }

  // Calculate day-of-week seasonality factors (0 = Sun, 1 = Mon ... 6 = Sat)
  const daySums = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  sortedDates.forEach(dateStr => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const qty = salesByDate[dateStr];
    daySums[day] += qty;
    dayCounts[day] += 1;
  });

  const dayAverages = daySums.map((sum, i) => (dayCounts[i] > 0 ? sum / dayCounts[i] : 1));
  const overallAvg = daySums.reduce((a, b) => a + b, 0) / Math.max(1, dayCounts.reduce((a, b) => a + b, 0));

  // Multiplicative seasonality index per day of week (normalized around 1.0)
  const daySeasonality = dayAverages.map(avg => (overallAvg > 0 ? avg / overallAvg : 1.0));

  // Fit Linear Regression: y = m * x + c on the most recent 60 days (or all if < 60)
  const recentDates = sortedDates.slice(-60);
  const n = recentDates.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  recentDates.forEach((dateStr, x) => {
    const y = salesByDate[dateStr];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  });

  const denom = n * sumXX - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared and standard error of residuals
  let residualSumSquares = 0;
  let totalSumSquares = 0;
  const yMean = sumY / n;

  recentDates.forEach((dateStr, x) => {
    const actual = salesByDate[dateStr];
    const predicted = Math.max(0, slope * x + intercept);
    residualSumSquares += Math.pow(actual - predicted, 2);
    totalSumSquares += Math.pow(actual - yMean, 2);
  });

  const rSquared = totalSumSquares > 0 ? Math.max(0, Math.min(1, 1 - residualSumSquares / totalSumSquares)) : 0.65;
  const stdError = Math.sqrt(residualSumSquares / Math.max(1, n - 2));

  // Generate historical data points (last 21 days for clean chart presentation)
  const chartHistoricalDates = sortedDates.slice(-21);
  const forecastPoints: ForecastDataPoint[] = chartHistoricalDates.map(dateStr => ({
    date: dateStr,
    historical: salesByDate[dateStr],
    predicted: undefined,
  }));

  // Generate forward forecast points
  const lastHistoricalDateStr = sortedDates[sortedDates.length - 1];
  const lastDate = new Date(lastHistoricalDateStr);

  let next7DaysDemand = 0;
  let next30DaysDemand = 0;

  for (let i = 1; i <= forecastDays; i++) {
    const fDate = new Date(lastDate);
    fDate.setDate(fDate.getDate() + i);
    const dateStr = fDate.toISOString().split('T')[0];
    const dayOfWeek = fDate.getDay();

    // Projected baseline from regression + day-of-week seasonal multiplier
    const projectedIndex = n + i - 1;
    const baseTrend = Math.max(1, slope * projectedIndex + intercept);
    const seasonalAdjusted = baseTrend * daySeasonality[dayOfWeek];
    const roundedPrediction = Math.round(seasonalAdjusted * 10) / 10;

    const marginOfError = Math.max(1.5, 1.96 * stdError * Math.sqrt(1 + 1 / n + Math.pow(projectedIndex - sumX / n, 2) / denom));
    const lower = Math.max(0, Math.round((roundedPrediction - marginOfError) * 10) / 10);
    const upper = Math.round((roundedPrediction + marginOfError) * 10) / 10;

    forecastPoints.push({
      date: dateStr,
      predicted: roundedPrediction,
      lowerBound: lower,
      upperBound: upper,
    });

    if (i <= 7) next7DaysDemand += roundedPrediction;
    if (i <= 30) next30DaysDemand += roundedPrediction;
  }

  // Determine trend designation
  let trend: DemandForecastResult['trend'] = 'Stable (Chronic Need)';
  if (slope > 0.08) {
    trend = 'Increasing (Peak Season)';
  } else if (slope < -0.08) {
    trend = 'Decreasing';
  } else if (Math.max(...daySeasonality) - Math.min(...daySeasonality) > 0.4) {
    trend = 'Seasonal Fluctuating';
  }

  // Recent 30-day average daily sales
  const recent30 = sortedDates.slice(-30);
  const recent30Sum = recent30.reduce((acc, d) => acc + salesByDate[d], 0);
  const avgDailySales = Number((recent30Sum / Math.max(1, recent30.length)).toFixed(2));

  return {
    medicineId: medicine.id,
    medicineName: medicine.name,
    category: medicine.category,
    currentStock: medicine.stockQuantity,
    avgDailySales,
    trend,
    trendSlope: Number(slope.toFixed(3)),
    next7DaysDemand: Math.round(next7DaysDemand),
    next30DaysDemand: Math.round(next30DaysDemand),
    forecastPoints,
    rSquared: Number(rSquared.toFixed(2)),
    seasonalityFactor: Number(daySeasonality[1].toFixed(2)), // weekday multiplier
  };
}
