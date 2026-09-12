import React from 'react';
import { Pill, AlertTriangle, RefreshCw, Plus, ShoppingCart, Code2, Download } from 'lucide-react';
import { REFERENCE_DATE } from '../services/seedData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenSaleModal: () => void;
  onResetData: () => void;
  onExportData: () => void;
  lowStockCount: number;
  expiredCount: number;
  reorderCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSaleModal,
  onResetData,
  onExportData,
  lowStockCount,
  expiredCount,
  reorderCount,
}) => {
  const tabs = [
    { id: 'overview', label: 'Executive Overview' },
    { id: 'inventory', label: 'Medicine Catalog (CRUD)' },
    {
      id: 'alerts',
      label: 'Expiry & Low Stock',
      badge: expiredCount + lowStockCount > 0 ? `${expiredCount + lowStockCount}` : undefined,
      badgeColor: expiredCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white',
    },
    { id: 'forecasting', label: 'ML Demand Forecasting' },
    {
      id: 'reorder',
      label: 'Smart Reorder Engine',
      badge: reorderCount > 0 ? `${reorderCount}` : undefined,
      badgeColor: 'bg-blue-600 text-white',
    },
    { id: 'anomalies', label: 'Outbreak & Anomalies' },
    { id: 'clustering', label: 'ABC & Clustering' },
    { id: 'python_guide', label: 'Python / VS Code Guide', icon: Code2 },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Smart Pharmacy Inventory System</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  100% Offline ML
                </span>
              </div>
              <p className="text-xs text-slate-500">
                FEFO Expiry Management • Time-Series Demand Forecasting • Expiry-Aware Reorder Engine
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="text-xs px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 border border-slate-200 font-mono">
              📅 Simulated Date: <strong>{REFERENCE_DATE}</strong>
            </div>

            <button
              onClick={onOpenSaleModal}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Dispense / Record Sale
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Medicine
            </button>

            <button
              onClick={onExportData}
              title="Export Inventory & Sales JSON"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onResetData}
              title="Reset 180-day simulated dataset"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5 mr-1.5" />}
                {tab.label}
                {tab.badge && (
                  <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
