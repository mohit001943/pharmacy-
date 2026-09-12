import React, { useState } from 'react';
import { Layers, PieChart, CheckCircle2, TrendingUp } from 'lucide-react';
import { Medicine, SaleRecord } from '../types/pharmacy';
import { runInventoryClusteringAndABC } from '../services/clusteringEngine';

interface ClusteringViewProps {
  medicines: Medicine[];
  sales: SaleRecord[];
}

export const ClusteringView: React.FC<ClusteringViewProps> = ({ medicines, sales }) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');

  const items = runInventoryClusteringAndABC(medicines, sales);

  const clusterCounts = {
    'Fast-Moving High-Turnover': items.filter(i => i.clusterLabel === 'Fast-Moving High-Turnover').length,
    'Seasonal Spike': items.filter(i => i.clusterLabel === 'Seasonal Spike').length,
    'Steady Chronic': items.filter(i => i.clusterLabel === 'Steady Chronic').length,
    'Slow-Moving Low-Demand': items.filter(i => i.clusterLabel === 'Slow-Moving Low-Demand').length,
  };

  const filteredItems = items.filter(i => selectedCluster === 'ALL' || i.clusterLabel === selectedCluster);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>K-Means Behavior Clustering & ABC Pareto Classification</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Classifies medicine inventory along consumption velocity, seasonality, and cumulative revenue contribution. 
          Enables clinical pharmacists to prioritize attention on high-impact Class A life-saving medicines while avoiding capital traps in Class C inventory.
        </p>

        {/* Cluster Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <button
            onClick={() => setSelectedCluster(selectedCluster === 'Fast-Moving High-Turnover' ? 'ALL' : 'Fast-Moving High-Turnover')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedCluster === 'Fast-Moving High-Turnover' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-bold text-blue-700 uppercase">Fast-Moving High-Turnover</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{clusterCounts['Fast-Moving High-Turnover']} SKUs</div>
            <div className="text-[10px] text-slate-500">Continuous daily replenishment</div>
          </button>

          <button
            onClick={() => setSelectedCluster(selectedCluster === 'Seasonal Spike' ? 'ALL' : 'Seasonal Spike')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedCluster === 'Seasonal Spike' ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-400/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-bold text-orange-700 uppercase">Seasonal Spike</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{clusterCounts['Seasonal Spike']} SKUs</div>
            <div className="text-[10px] text-slate-500">Peak weather surges (cold/flu)</div>
          </button>

          <button
            onClick={() => setSelectedCluster(selectedCluster === 'Steady Chronic' ? 'ALL' : 'Steady Chronic')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedCluster === 'Steady Chronic' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-bold text-emerald-700 uppercase">Steady Chronic</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{clusterCounts['Steady Chronic']} SKUs</div>
            <div className="text-[10px] text-slate-500">BP, Diabetes, Cardiovascular</div>
          </button>

          <button
            onClick={() => setSelectedCluster(selectedCluster === 'Slow-Moving Low-Demand' ? 'ALL' : 'Slow-Moving Low-Demand')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedCluster === 'Slow-Moving Low-Demand' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-bold text-purple-700 uppercase">Slow-Moving Low-Demand</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{clusterCounts['Slow-Moving Low-Demand']} SKUs</div>
            <div className="text-[10px] text-slate-500">Expiry monitoring priority</div>
          </button>
        </div>
      </div>

      {/* Cluster Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Medicine SKU</th>
                <th className="px-3 py-3">Therapeutic Category</th>
                <th className="px-3 py-3">Total Sold (180d)</th>
                <th className="px-3 py-3">Turnover Score</th>
                <th className="px-3 py-3">Revenue Share</th>
                <th className="px-3 py-3">ABC Pareto Class</th>
                <th className="px-4 py-3">K-Means Cluster Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map(item => (
                <tr key={item.medicineId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.medicineName}</td>
                  <td className="px-3 py-3 text-slate-600">{item.category}</td>
                  <td className="px-3 py-3 font-mono font-medium text-slate-800">{item.salesVolume} units</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, item.turnoverScore)}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">{item.turnoverScore}/100</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-700">{item.revenueContribution}%</td>
                  <td className="px-3 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.abcClass === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      item.abcClass === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      Class {item.abcClass}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      item.clusterLabel === 'Fast-Moving High-Turnover' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      item.clusterLabel === 'Seasonal Spike' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                      item.clusterLabel === 'Steady Chronic' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}>
                      {item.clusterLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
