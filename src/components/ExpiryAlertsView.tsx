import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Clock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Medicine } from '../types/pharmacy';
import { getAllExpiryAlerts } from '../services/expiryChecker';
import { getAllLowStockAlerts } from '../services/lowStockChecker';
import { REFERENCE_DATE } from '../services/seedData';

interface ExpiryAlertsViewProps {
  medicines: Medicine[];
  onQuickRestock: (id: string, qty: number) => void;
  onQuarantineExpired: (id: string) => void;
}

export const ExpiryAlertsView: React.FC<ExpiryAlertsViewProps> = ({
  medicines,
  onQuickRestock,
  onQuarantineExpired,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'expiry' | 'low_stock'>('expiry');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const expiryAlerts = getAllExpiryAlerts(medicines, REFERENCE_DATE);
  const lowStockAlerts = getAllLowStockAlerts(medicines);

  const expiredItems = expiryAlerts.filter(a => a.status === 'EXPIRED');
  const criticalItems = expiryAlerts.filter(a => a.status === 'CRITICAL_30');
  const warningItems = expiryAlerts.filter(a => a.status === 'WARNING_60');
  const watchItems = expiryAlerts.filter(a => a.status === 'WATCH_90');
  const safeItems = expiryAlerts.filter(a => a.status === 'SAFE');

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('expiry')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'expiry'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>FEFO Expiry Management ({expiredItems.length + criticalItems.length + warningItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('low_stock')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'low_stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Threshold Shortages ({lowStockAlerts.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          FEFO Policy: <strong>First Expired, First Out</strong>
        </div>
      </div>

      {activeSubTab === 'expiry' ? (
        <div className="space-y-6">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
              <div className="text-xs font-bold text-red-800 uppercase">Expired Batches</div>
              <div className="text-2xl font-extrabold text-red-900 mt-1">{expiredItems.length}</div>
              <div className="text-[11px] text-red-700 mt-0.5">Quarantine required</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl">
              <div className="text-xs font-bold text-orange-800 uppercase">Critical (&le; 30 Days)</div>
              <div className="text-2xl font-extrabold text-orange-900 mt-1">{criticalItems.length}</div>
              <div className="text-[11px] text-orange-700 mt-0.5">Immediate FEFO rush</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <div className="text-xs font-bold text-amber-800 uppercase">Warning (31-60 Days)</div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{warningItems.length}</div>
              <div className="text-[11px] text-amber-700 mt-0.5">Prioritize dispensing</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <div className="text-xs font-bold text-emerald-800 uppercase">Watch & Safe (&gt; 60d)</div>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">{watchItems.length + safeItems.length}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Adequate shelf life</div>
            </div>
          </div>

          {/* Expired Section (Red) */}
          {expiredItems.length > 0 && (
            <div className="bg-red-50/60 border border-red-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-sm mb-3">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <span>EXPIRED STOCK REQUIRING IMMEDIATE QUARANTINE</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expiredItems.map(item => (
                  <div key={item.medicine.id} className="bg-white border border-red-200 rounded-lg p-3 shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{item.medicine.name}</h4>
                        <div className="text-[11px] text-slate-500">Batch: <span className="font-mono">{item.medicine.batchNumber}</span></div>
                        <div className="text-[11px] text-red-700 font-semibold mt-1">
                          Expired on {item.medicine.expiryDate} ({Math.abs(item.daysToExpiry)} days ago)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">{item.medicine.stockQuantity} units</span>
                        <div className="text-[10px] text-slate-400">Rack: {item.medicine.rackLocation}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] bg-red-50 text-red-800 p-2 rounded border border-red-100">
                      <strong>Action:</strong> {item.actionRequired}
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => onQuarantineExpired(item.medicine.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
                      >
                        Quarantine Stock (Set to 0 units)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical 30 Days (Orange) */}
          {criticalItems.length > 0 && (
            <div className="bg-orange-50/60 border border-orange-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center space-x-2 text-orange-900 font-bold text-sm mb-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>CRITICAL: EXPIRING WITHIN 30 DAYS (FEFO Priority)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalItems.map(item => (
                  <div key={item.medicine.id} className="bg-white border border-orange-200 rounded-lg p-3 shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{item.medicine.name}</h4>
                        <div className="text-[11px] text-slate-500">Batch: <span className="font-mono">{item.medicine.batchNumber}</span></div>
                        <div className="text-[11px] text-orange-700 font-semibold mt-1">
                          Expiring: {item.medicine.expiryDate} (<strong>{item.daysToExpiry} days left</strong>)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">{item.medicine.stockQuantity} units in stock</span>
                        <div className="text-[10px] text-slate-400">Rack: {item.medicine.rackLocation}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] bg-orange-50 text-orange-800 p-2 rounded border border-orange-100">
                      <strong>Directive:</strong> {item.actionRequired}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Expiry Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-800">
              All Medicine Batches Ranked by Days to Expiry (FEFO Order)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Medicine</th>
                    <th className="px-3 py-2.5">Batch</th>
                    <th className="px-3 py-2.5">Units</th>
                    <th className="px-3 py-2.5">Expiry Date</th>
                    <th className="px-3 py-2.5">Days Left</th>
                    <th className="px-3 py-2.5">FEFO Status</th>
                    <th className="px-4 py-2.5">Action Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expiryAlerts.map(alert => (
                    <tr key={alert.medicine.id} className="hover:bg-slate-50/75">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{alert.medicine.name}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">{alert.medicine.batchNumber}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{alert.medicine.stockQuantity}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-700">{alert.medicine.expiryDate}</td>
                      <td className="px-3 py-2.5 font-bold">
                        <span className={
                          alert.daysToExpiry < 0 ? 'text-red-700' :
                          alert.daysToExpiry <= 30 ? 'text-orange-700' :
                          alert.daysToExpiry <= 60 ? 'text-amber-700' : 'text-emerald-700'
                        }>
                          {alert.daysToExpiry < 0 ? `${alert.daysToExpiry}d (EXPIRED)` : `${alert.daysToExpiry}d`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          alert.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                          alert.status === 'CRITICAL_30' ? 'bg-orange-100 text-orange-800' :
                          alert.status === 'WARNING_60' ? 'bg-amber-100 text-amber-800' :
                          alert.status === 'WATCH_90' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-[11px] truncate max-w-xs">{alert.actionRequired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Low Stock Tab */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Rule-Based Low Stock Shortages (Inventory &le; Threshold)</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Deterministic rule threshold alerting for pharmaceutical supply continuity.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Current Stock</th>
                  <th className="px-3 py-3">Min Threshold</th>
                  <th className="px-3 py-3">Deficit</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-3 py-3">Rack</th>
                  <th className="px-4 py-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      All inventory levels are above their configured minimum thresholds!
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map(alert => (
                    <tr key={alert.medicine.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{alert.medicine.name}</td>
                      <td className="px-3 py-3 text-slate-600">{alert.medicine.category}</td>
                      <td className="px-3 py-3">
                        <span className={`font-bold ${
                          alert.severity === 'CRITICAL_DEPLETION' ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          {alert.medicine.stockQuantity} units
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{alert.medicine.minThreshold}</td>
                      <td className="px-3 py-3 font-semibold text-red-600">-{alert.deficit} units</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          alert.severity === 'CRITICAL_DEPLETION'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{alert.medicine.rackLocation}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onQuickRestock(alert.medicine.id, alert.medicine.stockQuantity + 50)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
                        >
                          +50 Units
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
