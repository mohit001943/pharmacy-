import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Calendar, Zap, Info, Award, BarChart2 } from 'lucide-react';
import { Medicine, SaleRecord } from '../types/pharmacy';
import { runDemandForecast } from '../services/forecastingEngine';

interface DemandForecastingViewProps {
  medicines: Medicine[];
  sales: SaleRecord[];
  selectedMedicineId?: string;
  onSelectMedicine: (id: string) => void;
}

export const DemandForecastingView: React.FC<DemandForecastingViewProps> = ({
  medicines,
  sales,
  selectedMedicineId,
  onSelectMedicine,
}) => {
  const currentMedId = selectedMedicineId || medicines[0]?.id;
  const [horizon, setHorizon] = useState<number>(30);

  const selectedMed = medicines.find(m => m.id === currentMedId) || medicines[0];

  const forecast = useMemo(() => {
    if (!selectedMed) return null;
    return runDemandForecast(selectedMed, sales, horizon);
  }, [selectedMed, sales, horizon]);

  // Merge historical and forecast data points for a smooth contiguous chart
  const chartData = useMemo(() => {
    if (!forecast) return [];
    return forecast.forecastPoints.map(p => ({
      date: p.date.slice(5), // MM-DD
      fullDate: p.date,
      historical: p.historical,
      predicted: p.predicted,
      lowerBound: p.lowerBound,
      upperBound: p.upperBound,
      range: p.lowerBound !== undefined && p.upperBound !== undefined ? [p.lowerBound, p.upperBound] : undefined,
    }));
  }, [forecast]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Medicine to Analyze</label>
          <select
            value={currentMedId}
            onChange={e => onSelectMedicine(e.target.value)}
            className="w-full md:w-96 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-900"
          >
            {medicines.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category}) - Stock: {m.stockQuantity}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">Forecast Horizon:</span>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-slate-50 p-0.5">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setHorizon(days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                  horizon === days ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {forecast && (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Daily Sales</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{forecast.avgDailySales} units/day</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Calculated over past 30 days</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Predicted Demand ({horizon} Days)
              </span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {horizon === 30 ? forecast.next30DaysDemand : forecast.next7DaysDemand} units
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Next 7-Day sum: <strong>{forecast.next7DaysDemand} units</strong>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Detected Trajectory</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{forecast.trend}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Slope: {forecast.trendSlope > 0 ? `+${forecast.trendSlope}` : forecast.trendSlope}/day</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Statistical Fit ($R^2$)</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">{forecast.rSquared}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Confidence Level: 95%</div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Historical Actual vs. ML Predicted Demand ({selectedMed?.name})
                </h3>
                <p className="text-xs text-slate-500">
                  Blue line = Actual Dispensed • Green dashed line = Future Projection • Shaded area = 95% Confidence Interval
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-blue-600"></span>
                  <span className="text-slate-600">Actual</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500 border-dashed"></span>
                  <span className="text-slate-600">Predicted</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-emerald-100 rounded"></span>
                  <span className="text-slate-600">95% Bounds</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0]?.payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                          <div className="font-semibold text-slate-200">{data.fullDate}</div>
                          {data.historical !== undefined && (
                            <div className="text-blue-300">Actual Dispensed: <strong>{data.historical} units</strong></div>
                          )}
                          {data.predicted !== undefined && (
                            <>
                              <div className="text-emerald-300">ML Forecast: <strong>{data.predicted} units</strong></div>
                              <div className="text-slate-400 text-[10px]">
                                95% Interval: [{data.lowerBound} - {data.upperBound}]
                              </div>
                            </>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* Confidence bounds area */}
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="transparent"
                    fill="#10b981"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="transparent"
                    fill="#ffffff"
                    fillOpacity={1.0}
                  />

                  {/* Historical Line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#2563eb' }}
                    connectNulls={false}
                  />

                  {/* Predicted Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#10b981' }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Viva Defense Explanation Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <Award className="w-4 h-4 text-blue-600" />
              <span>How This Machine Learning Forecasting Model Works (Student Defense)</span>
            </div>
            <p>
              1. <strong>Time-Series Decomposition:</strong> The model isolates the deterministic underlying growth/decay rate using Ordinary Least Squares (OLS) Linear Regression ($y = mx + c$) on recent sales.
            </p>
            <p>
              2. <strong>Day-of-Week Seasonality:</strong> Multiplicative cyclical coefficients model pharmacy dispensing surges on specific days (e.g. higher footfall on weekends vs. weekdays).
            </p>
            <p>
              3. <strong>Confidence Intervals:</strong> Standard error of residuals is scaled by $Z = 1.96$ to yield realistic upper and lower operational boundaries.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
