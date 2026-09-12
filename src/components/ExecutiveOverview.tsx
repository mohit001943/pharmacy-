import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertOctagon, RefreshCw, ShoppingCart, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { Medicine, SaleRecord, PharmacyStats } from '../types/pharmacy';
import { getAllExpiryAlerts } from '../services/expiryChecker';
import { getAllReorderRecommendations } from '../services/reorderEngine';
import { REFERENCE_DATE } from '../services/seedData';

interface ExecutiveOverviewProps {
  medicines: Medicine[];
  sales: SaleRecord[];
  stats: PharmacyStats;
  onNavigate: (tab: string) => void;
  onSelectForForecast: (id: string) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  medicines,
  sales,
  stats,
  onNavigate,
  onSelectForForecast,
}) => {
  const expiryAlerts = getAllExpiryAlerts(medicines, REFERENCE_DATE);
  const reorders = getAllReorderRecommendations(medicines, sales, REFERENCE_DATE);

  const urgentExpiry = expiryAlerts.filter(a => a.status === 'EXPIRED' || a.status === 'CRITICAL_30').slice(0, 5);
  const urgentReorders = reorders.filter(r => r.shouldReorder).slice(0, 5);

  // Category chart data
  const categoryStats = React.useMemo(() => {
    const map: { [cat: string]: { category: string; count: number; stock: number } } = {};
    medicines.forEach(m => {
      if (!map[m.category]) {
        map[m.category] = { category: m.category.split(' ')[0], count: 0, stock: 0 };
      }
      map[m.category].count += 1;
      map[m.category].stock += m.stockQuantity;
    });
    return Object.values(map);
  }, [medicines]);

  // Recent 5 sales
  const recentSales = sales.slice(-6).reverse();

  return (
    <div className="space-y-6">
      {/* Two Column Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Urgent Expiry Watchlist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Urgent FEFO Expiry & Quarantine</h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center cursor-pointer"
              >
                <span>View All ({stats.expiredCount + stats.expiringSoon30Count})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentExpiry.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No batches expired or expiring &le; 30 days.</div>
              ) : (
                urgentExpiry.map(item => (
                  <div
                    key={item.medicine.id}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                      item.status === 'EXPIRED' ? 'bg-red-50/70 border-red-200' : 'bg-orange-50/70 border-orange-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.medicine.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Batch: <span className="font-mono">{item.medicine.batchNumber}</span> • Expiry:{' '}
                        <strong>{item.medicine.expiryDate}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.daysToExpiry < 0 ? `${Math.abs(item.daysToExpiry)}d EXPIRED` : `${item.daysToExpiry}d left`}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">{item.medicine.stockQuantity} units in stock</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Enforces <strong>First-Expired, First-Out (FEFO)</strong> to mitigate financial write-offs.
          </div>
        </div>

        {/* Right: Urgent Reorders */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">ML Reorder Triggers (ROP Breached)</h3>
              </div>
              <button
                onClick={() => onNavigate('reorder')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center cursor-pointer"
              >
                <span>Full Reorder Matrix</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentReorders.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">All inventory levels are optimal.</div>
              ) : (
                urgentReorders.map(rec => (
                  <div
                    key={rec.medicineId}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{rec.medicineName}</div>
                      <div className="text-[11px] text-slate-500">
                        Stock: <strong>{rec.currentStock}</strong> / ROP: {rec.reorderPoint} (Lead Time: {rec.leadTimeDays}d)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-700">+{rec.suggestedReorderQuantity} units</div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rec.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.urgency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Computed via <strong>ROP = (Avg Daily Sales × Lead Time) + Safety Stock</strong>.
          </div>
        </div>
      </div>

      {/* Inventory Category Stock Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Stock Distribution by Category</h3>
            <p className="text-xs text-slate-500">Stock units across primary therapeutic classifications</p>
          </div>
          <button
            onClick={() => onNavigate('clustering')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            View ABC Classification &rarr;
          </button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryStats} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs">
                      <div className="font-bold">{data.category}</div>
                      <div>Total Stock: <strong>{data.stock} units</strong></div>
                      <div>Unique SKUs: <strong>{data.count} medicines</strong></div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales Activity */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Dispensing Transactions
            </h3>
          </div>
          <span className="text-xs text-slate-500">Real-time audit log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-3 py-2.5">Medicine Dispensed</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Batch</th>
                <th className="px-3 py-2.5">Quantity</th>
                <th className="px-3 py-2.5">Patient Channel</th>
                <th className="px-4 py-2.5 text-right">Total ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-slate-600">{sale.date}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{sale.medicineName}</td>
                  <td className="px-3 py-2.5 text-slate-500">{sale.category}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{sale.batchNumber}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800">{sale.quantity} units</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {sale.patientType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-right text-slate-900">${sale.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
