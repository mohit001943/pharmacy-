import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, ShieldAlert, Activity } from 'lucide-react';
import { Medicine, SaleRecord } from '../types/pharmacy';
import { detectSalesAnomalies } from '../services/anomalyDetector';

interface AnomalyViewProps {
  medicines: Medicine[];
  sales: SaleRecord[];
}

export const AnomalyView: React.FC<AnomalyViewProps> = ({ medicines, sales }) => {
  const anomalies = detectSalesAnomalies(medicines, sales);

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-300/60 p-5 rounded-xl">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
          <Activity className="w-5 h-5 text-amber-600" />
          <span>Epidemiological Outbreak & Prescription Anomaly Detection</span>
        </div>
        <p className="text-xs text-amber-800 mt-1 max-w-3xl">
          Uses rolling Gaussian Z-score statistical outlier modeling (Z = (X - &mu;) / &sigma; &ge; 2.5) to detect sudden clinical surges. In pharmacies, unexpected spikes in Antipyretics or Antibiotics provide early detection of localized viral outbreaks, while dips signal hidden stockouts.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-800 flex items-center justify-between">
          <span>Detected Anomalies in Sales Stream ({anomalies.length})</span>
          <span className="text-[11px] text-slate-500 font-normal">Threshold: $|Z| \ge 2.5$</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Incident Date</th>
                <th className="px-3 py-3">Medicine</th>
                <th className="px-3 py-3">Actual Sold</th>
                <th className="px-3 py-3">Expected Avg</th>
                <th className="px-3 py-3">Z-Score Deviation</th>
                <th className="px-3 py-3">Anomaly Pattern</th>
                <th className="px-4 py-3">Clinical / Operational Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No statistical sales anomalies detected in recent days.
                  </td>
                </tr>
              ) : (
                anomalies.map((ano, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-800 whitespace-nowrap">{ano.date}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">{ano.medicineName}</td>
                    <td className="px-3 py-3 font-bold text-slate-900">{ano.actualSales} units</td>
                    <td className="px-3 py-3 text-slate-500">{ano.expectedSales} units</td>
                    <td className="px-3 py-3 font-mono font-bold">
                      <span className={ano.zScore > 0 ? 'text-red-600' : 'text-blue-600'}>
                        {ano.zScore > 0 ? `+${ano.zScore}σ` : `${ano.zScore}σ`}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ano.type === 'SPIKE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ano.type === 'SPIKE' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {ano.type} ({ano.severity})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px]">{ano.possibleCause}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
