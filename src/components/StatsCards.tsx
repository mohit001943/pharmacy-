import React from 'react';
import { Package, DollarSign, AlertCircle, Clock, ShoppingBag, RefreshCw } from 'lucide-react';
import { PharmacyStats } from '../types/pharmacy';

interface StatsCardsProps {
  stats: PharmacyStats;
  onNavigate: (tabId: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, onNavigate }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {/* 1. Total Medicines */}
      <div 
        onClick={() => onNavigate('inventory')}
        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Catalog SKUs</span>
          <Package className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-xl font-bold text-slate-900">{stats.totalMedicines}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">32 clinical items active</div>
      </div>

      {/* 2. Total Stock & Valuation */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Inventory Value</span>
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-xl font-bold text-slate-900">${stats.totalInventoryValue.toLocaleString()}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{stats.totalStockUnits.toLocaleString()} units in stock</div>
      </div>

      {/* 3. Low Stock */}
      <div 
        onClick={() => onNavigate('alerts')}
        className={`p-3.5 rounded-xl border transition cursor-pointer ${
          stats.lowStockCount > 0 
            ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-amber-800 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Low Stock</span>
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-bold text-amber-900">{stats.lowStockCount}</div>
        <div className="text-[11px] text-amber-700 mt-0.5">Below safety threshold</div>
      </div>

      {/* 4. Expired Batches */}
      <div 
        onClick={() => onNavigate('alerts')}
        className={`p-3.5 rounded-xl border transition cursor-pointer ${
          stats.expiredCount > 0 
            ? 'bg-red-50/80 border-red-200 hover:border-red-400' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-red-700 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Expired Batches</span>
          <AlertCircle className="w-4 h-4 text-red-600" />
        </div>
        <div className="text-xl font-bold text-red-900">{stats.expiredCount}</div>
        <div className="text-[11px] text-red-600 mt-0.5">Must quarantine immediately</div>
      </div>

      {/* 5. Expiring < 30 Days */}
      <div 
        onClick={() => onNavigate('alerts')}
        className={`p-3.5 rounded-xl border transition cursor-pointer ${
          stats.expiringSoon30Count > 0 
            ? 'bg-orange-50/70 border-orange-200 hover:border-orange-400' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-orange-700 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Expiring &le; 30d</span>
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <div className="text-xl font-bold text-orange-900">{stats.expiringSoon30Count}</div>
        <div className="text-[11px] text-orange-700 mt-0.5">Priority FEFO dispensing</div>
      </div>

      {/* 6. Urgent Reorders */}
      <div 
        onClick={() => onNavigate('reorder')}
        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Reorders Due</span>
          <RefreshCw className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-bold text-blue-900">{stats.urgentReorderCount}</div>
        <div className="text-[11px] text-blue-600 mt-0.5">ML triggered ROP</div>
      </div>
    </div>
  );
};
