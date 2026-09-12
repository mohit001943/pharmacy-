import React, { useState } from 'react';
import { RefreshCw, ShoppingCart, AlertCircle, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { Medicine, SaleRecord } from '../types/pharmacy';
import { getAllReorderRecommendations } from '../services/reorderEngine';
import { REFERENCE_DATE } from '../services/seedData';

interface ReorderEngineViewProps {
  medicines: Medicine[];
  sales: SaleRecord[];
  onQuickRestock: (id: string, qty: number) => void;
}

export const ReorderEngineView: React.FC<ReorderEngineViewProps> = ({
  medicines,
  sales,
  onQuickRestock,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('REORDER_NEEDED');
  const [purchaseOrderSuccess, setPurchaseOrderSuccess] = useState<string | null>(null);

  const recommendations = getAllReorderRecommendations(medicines, sales, REFERENCE_DATE);

  const reorderNeeded = recommendations.filter(r => r.shouldReorder);
  const totalSuggestedCost = reorderNeeded.reduce((acc, r) => acc + r.estimatedCost, 0);
  const totalSuggestedUnits = reorderNeeded.reduce((acc, r) => acc + r.suggestedReorderQuantity, 0);

  const filteredRecs = recommendations.filter(r => {
    if (filterUrgency === 'REORDER_NEEDED') return r.shouldReorder;
    if (filterUrgency === 'CRITICAL') return r.urgency === 'CRITICAL';
    if (filterUrgency === 'ALL') return true;
    return r.urgency === filterUrgency;
  });

  const handleCreatePurchaseOrder = () => {
    // Restock all items needing reorder
    reorderNeeded.forEach(r => {
      onQuickRestock(r.medicineId, r.currentStock + r.suggestedReorderQuantity);
    });
    setPurchaseOrderSuccess(`Batch Purchase Order generated! Restocked ${totalSuggestedUnits} units across ${reorderNeeded.length} medicines for $${totalSuggestedCost.toFixed(2)}.`);
    setTimeout(() => setPurchaseOrderSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & PO Generator */}
      <div className="bg-blue-900 text-white rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 uppercase tracking-wide">
              ML Inventory Optimization
            </span>
            <span className="text-xs text-blue-200 font-mono">Service Level: 95% ($Z = 1.65$)</span>
          </div>
          <h2 className="text-xl font-bold mt-1 tracking-tight">Smart Reorder Point & Quantity Engine</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Calculates <strong>ROP = (Avg Daily Sales &times; Lead Time) + Safety Stock</strong> with <strong>Expiry-Aware constraints</strong> to prevent capital lockup in slow-moving expiring drugs.
          </p>
        </div>

        <div className="bg-blue-800/80 border border-blue-700/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <div className="text-[11px] text-blue-300">Items Needing Reorder</div>
            <div className="text-2xl font-black text-white">{reorderNeeded.length} SKUs</div>
            <div className="text-[11px] text-blue-200">{totalSuggestedUnits} units • ${totalSuggestedCost.toFixed(2)}</div>
          </div>
          <button
            onClick={handleCreatePurchaseOrder}
            disabled={reorderNeeded.length === 0}
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generate Supplier PO</span>
          </button>
        </div>
      </div>

      {purchaseOrderSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{purchaseOrderSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterUrgency('REORDER_NEEDED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterUrgency === 'REORDER_NEEDED' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Reorders Triggered ({reorderNeeded.length})
          </button>
          <button
            onClick={() => setFilterUrgency('CRITICAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterUrgency === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Critical Stockout Risk ({recommendations.filter(r => r.urgency === 'CRITICAL').length})
          </button>
          <button
            onClick={() => setFilterUrgency('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterUrgency === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Medicines ({recommendations.length})
          </button>
        </div>

        <span className="text-xs text-slate-500">Sorted by Urgency & Stock Runout Days</span>
      </div>

      {/* Table of Reorder Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Medicine SKU</th>
                <th className="px-3 py-3">Stock vs ROP</th>
                <th className="px-3 py-3">Avg Daily ($d$)</th>
                <th className="px-3 py-3">Lead Time ($L$)</th>
                <th className="px-3 py-3">Safety Stock ($SS$)</th>
                <th className="px-3 py-3">Runout Horizon</th>
                <th className="px-3 py-3">Urgency</th>
                <th className="px-3 py-3">Suggested Order</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecs.map(rec => {
                const isCritical = rec.urgency === 'CRITICAL';
                const isReorder = rec.urgency === 'REORDER_NOW';

                return (
                  <tr key={rec.medicineId} className="hover:bg-slate-50">
                    {/* Medicine */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{rec.medicineName}</div>
                      <div className="text-[11px] text-slate-500">{rec.category}</div>
                      {rec.expiryConstraintNote && (
                        <div className="mt-1 text-[10px] text-amber-700 bg-amber-50 p-1 rounded border border-amber-200 font-medium">
                          🛡️ {rec.expiryConstraintNote}
                        </div>
                      )}
                    </td>

                    {/* Stock vs ROP */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold ${
                          isCritical ? 'text-red-700' : isReorder ? 'text-amber-700' : 'text-slate-800'
                        }`}>
                          {rec.currentStock} units
                        </span>
                        <span className="text-slate-400">/ ROP: {rec.reorderPoint}</span>
                      </div>
                    </td>

                    {/* Avg Daily */}
                    <td className="px-3 py-3 font-mono text-slate-700">{rec.avgDailySales}/day</td>

                    {/* Lead Time */}
                    <td className="px-3 py-3 text-slate-600">{rec.leadTimeDays} days</td>

                    {/* Safety Stock */}
                    <td className="px-3 py-3 font-mono text-slate-600">+{rec.safetyStock} units</td>

                    {/* Runout Days */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`font-bold ${
                        rec.daysOfStockRemaining <= 3 ? 'text-red-700' :
                        rec.daysOfStockRemaining <= 7 ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        ~{rec.daysOfStockRemaining} days left
                      </span>
                    </td>

                    {/* Urgency Badge */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        rec.urgency === 'REORDER_NOW' ? 'bg-amber-100 text-amber-800' :
                        rec.urgency === 'OVERSTOCKED' ? 'bg-purple-100 text-purple-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rec.urgency}
                      </span>
                    </td>

                    {/* Suggested Quantity */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {rec.suggestedReorderQuantity > 0 ? (
                        <div>
                          <span className="font-bold text-blue-700">+{rec.suggestedReorderQuantity} units</span>
                          <div className="text-[10px] text-slate-400">Est: ${rec.estimatedCost.toFixed(2)}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No order needed</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {rec.suggestedReorderQuantity > 0 ? (
                        <button
                          onClick={() => onQuickRestock(rec.medicineId, rec.currentStock + rec.suggestedReorderQuantity)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
                        >
                          Order {rec.suggestedReorderQuantity}
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Optimal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
