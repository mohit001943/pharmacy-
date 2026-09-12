import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { MedicineTable } from './components/MedicineTable';
import { ExpiryAlertsView } from './components/ExpiryAlertsView';
import { DemandForecastingView } from './components/DemandForecastingView';
import { ReorderEngineView } from './components/ReorderEngineView';
import { AnomalyView } from './components/AnomalyView';
import { ClusteringView } from './components/ClusteringView';
import { PythonProjectGuide } from './components/PythonProjectGuide';
import { AddMedicineModal } from './components/AddMedicineModal';
import { RecordSaleModal } from './components/RecordSaleModal';

import { Medicine, SaleRecord, PharmacyStats } from './types/pharmacy';
import { INITIAL_MEDICINES, generateSyntheticSalesData, REFERENCE_DATE } from './services/seedData';
import { checkMedicineExpiry } from './services/expiryChecker';
import { getAllReorderRecommendations } from './services/reorderEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Local storage state with default seed data
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('smart_pharmacy_medicines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved medicines', e);
      }
    }
    return INITIAL_MEDICINES;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('smart_pharmacy_sales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sales', e);
      }
    }
    return generateSyntheticSalesData(INITIAL_MEDICINES);
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [forecastMedicineId, setForecastMedicineId] = useState<string>(medicines[0]?.id || 'med-01');

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem('smart_pharmacy_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('smart_pharmacy_sales', JSON.stringify(sales));
  }, [sales]);

  // Derived Key Metrics
  const stats: PharmacyStats = useMemo(() => {
    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let expiredCount = 0;
    let expiringSoon30Count = 0;

    medicines.forEach(m => {
      totalStockUnits += m.stockQuantity;
      totalInventoryValue += m.stockQuantity * m.unitPrice;
      if (m.stockQuantity <= m.minThreshold) {
        lowStockCount++;
      }
      const exp = checkMedicineExpiry(m, REFERENCE_DATE);
      if (exp.status === 'EXPIRED') expiredCount++;
      if (exp.status === 'CRITICAL_30') expiringSoon30Count++;
    });

    const reorders = getAllReorderRecommendations(medicines, sales, REFERENCE_DATE);
    const urgentReorderCount = reorders.filter(r => r.shouldReorder).length;

    // Today's sales
    const todaySales = sales.filter(s => s.date === REFERENCE_DATE);
    const todaySalesRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);

    return {
      totalMedicines: medicines.length,
      totalStockUnits,
      totalInventoryValue: Math.round(totalInventoryValue),
      lowStockCount,
      expiredCount,
      expiringSoon30Count,
      todaySalesCount: todaySales.length,
      todaySalesRevenue: Math.round(todaySalesRevenue),
      urgentReorderCount,
    };
  }, [medicines, sales]);

  // Handlers
  const handleSaveMedicine = (newOrUpdated: Medicine) => {
    setMedicines(prev => {
      const exists = prev.some(m => m.id === newOrUpdated.id);
      if (exists) {
        return prev.map(m => (m.id === newOrUpdated.id ? newOrUpdated : m));
      }
      return [newOrUpdated, ...prev];
    });
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (id: string) => {
    if (window.confirm('Are you sure you want to remove this medicine SKU from inventory?')) {
      setMedicines(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleQuickStockChange = (id: string, newStock: number) => {
    setMedicines(prev =>
      prev.map(m => (m.id === id ? { ...m, stockQuantity: Math.max(0, newStock) } : m))
    );
  };

  const handleRecordSale = (newSale: SaleRecord) => {
    // 1. Add to sales history
    setSales(prev => [...prev, newSale]);
    // 2. Deduct medicine stock
    setMedicines(prev =>
      prev.map(m =>
        m.id === newSale.medicineId
          ? { ...m, stockQuantity: Math.max(0, m.stockQuantity - newSale.quantity) }
          : m
      )
    );
  };

  const handleQuarantineExpired = (id: string) => {
    setMedicines(prev =>
      prev.map(m => (m.id === id ? { ...m, stockQuantity: 0, rackLocation: 'QUARANTINE BIN 9' } : m))
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset inventory and 180-day sales history back to original benchmark seed dataset?')) {
      const freshMeds = INITIAL_MEDICINES;
      const freshSales = generateSyntheticSalesData(freshMeds);
      setMedicines(freshMeds);
      setSales(freshSales);
      localStorage.removeItem('smart_pharmacy_medicines');
      localStorage.removeItem('smart_pharmacy_sales');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ medicines, sales, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy_inventory_export_${REFERENCE_DATE}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setIsAddModalOpen(true);
  };

  const handleSelectForForecast = (id: string) => {
    setForecastMedicineId(id);
    setActiveTab('forecasting');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingMedicine(null);
          setIsAddModalOpen(true);
        }}
        onOpenSaleModal={() => setIsSaleModalOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
        lowStockCount={stats.lowStockCount}
        expiredCount={stats.expiredCount}
        reorderCount={stats.urgentReorderCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Metric Cards (Visible across tabs for continuous awareness) */}
        <StatsCards stats={stats} onNavigate={setActiveTab} />

        {/* Dynamic Tab Views */}
        {activeTab === 'overview' && (
          <ExecutiveOverview
            medicines={medicines}
            sales={sales}
            stats={stats}
            onNavigate={setActiveTab}
            onSelectForForecast={handleSelectForForecast}
          />
        )}

        {activeTab === 'inventory' && (
          <MedicineTable
            medicines={medicines}
            onEditMedicine={handleOpenEditModal}
            onDeleteMedicine={handleDeleteMedicine}
            onQuickStockChange={handleQuickStockChange}
            onOpenAddModal={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
            onSelectForForecast={handleSelectForForecast}
          />
        )}

        {activeTab === 'alerts' && (
          <ExpiryAlertsView
            medicines={medicines}
            onQuickRestock={handleQuickStockChange}
            onQuarantineExpired={handleQuarantineExpired}
          />
        )}

        {activeTab === 'forecasting' && (
          <DemandForecastingView
            medicines={medicines}
            sales={sales}
            selectedMedicineId={forecastMedicineId}
            onSelectMedicine={setForecastMedicineId}
          />
        )}

        {activeTab === 'reorder' && (
          <ReorderEngineView
            medicines={medicines}
            sales={sales}
            onQuickRestock={handleQuickStockChange}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyView medicines={medicines} sales={sales} />
        )}

        {activeTab === 'clustering' && (
          <ClusteringView medicines={medicines} sales={sales} />
        )}

        {activeTab === 'python_guide' && (
          <PythonProjectGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <strong>Smart Pharmacy Inventory Tracking System</strong> • 3rd Year Mini Project
          </div>
          <div className="flex items-center space-x-4">
            <span>Offline ML Models: OLS Regression + Weekly Seasonality + Gaussian Z-Score</span>
            <button
              onClick={() => setActiveTab('python_guide')}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              VS Code Localhost Guide & Viva Prep &rarr;
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
      />

      {/* Dispense / Record Sale Modal */}
      <RecordSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        medicines={medicines}
        onRecordSale={handleRecordSale}
      />
    </div>
  );
}

export default App;
