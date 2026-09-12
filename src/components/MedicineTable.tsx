import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, TrendingUp, AlertTriangle, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Medicine, MedicineCategory } from '../types/pharmacy';
import { checkMedicineExpiry } from '../services/expiryChecker';
import { REFERENCE_DATE } from '../services/seedData';

interface MedicineTableProps {
  medicines: Medicine[];
  onEditMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  onQuickStockChange: (id: string, newStock: number) => void;
  onOpenAddModal: () => void;
  onSelectForForecast: (id: string) => void;
}

export const MedicineTable: React.FC<MedicineTableProps> = ({
  medicines,
  onEditMedicine,
  onDeleteMedicine,
  onQuickStockChange,
  onOpenAddModal,
  onSelectForForecast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW_STOCK' | 'EXPIRED' | 'CRITICAL_30'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'stock' | 'expiry' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categories: MedicineCategory[] = [
    'Antibiotics',
    'Painkillers & Analgesics',
    'Seasonal Cold & Flu',
    'Chronic & Cardiovascular',
    'Diabetes Care',
    'Gastrointestinal',
    'Dermatological',
    'Vitamins & Supplements',
  ];

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter(med => {
        const matchesSearch =
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'ALL' || med.category === selectedCategory;

        const expiryInfo = checkMedicineExpiry(med, REFERENCE_DATE);
        let matchesStatus = true;
        if (statusFilter === 'LOW_STOCK') {
          matchesStatus = med.stockQuantity <= med.minThreshold;
        } else if (statusFilter === 'EXPIRED') {
          matchesStatus = expiryInfo.status === 'EXPIRED';
        } else if (statusFilter === 'CRITICAL_30') {
          matchesStatus = expiryInfo.status === 'CRITICAL_30';
        }

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;

        if (sortField === 'stock') {
          valA = a.stockQuantity;
          valB = b.stockQuantity;
        } else if (sortField === 'expiry') {
          valA = new Date(a.expiryDate).getTime();
          valB = new Date(b.expiryDate).getTime();
        } else if (sortField === 'price') {
          valA = a.unitPrice;
          valB = b.unitPrice;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [medicines, searchQuery, selectedCategory, statusFilter, sortField, sortOrder]);

  const toggleSort = (field: 'name' | 'stock' | 'expiry' | 'price') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand, generic, or batch..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="ALL">All Categories ({medicines.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="LOW_STOCK">⚠️ Low Stock (&le; Threshold)</option>
              <option value="EXPIRED">⛔ Expired Batches</option>
              <option value="CRITICAL_30">⏳ Expiring within 30 Days</option>
            </select>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Medicine
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filteredMedicines.length}</strong> of {medicines.length} medicines</span>
          <span className="italic">Click any column header to sort</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/75 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-200/60" onClick={() => toggleSort('name')}>
                <div className="flex items-center space-x-1">
                  <span>Medicine Details</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3">Category & Form</th>
              <th scope="col" className="px-3 py-3">Batch & Rack</th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-slate-200/60" onClick={() => toggleSort('stock')}>
                <div className="flex items-center space-x-1">
                  <span>Stock / Min</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-slate-200/60" onClick={() => toggleSort('expiry')}>
                <div className="flex items-center space-x-1">
                  <span>Expiry (FEFO)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 cursor-pointer hover:bg-slate-200/60" onClick={() => toggleSort('price')}>
                <div className="flex items-center space-x-1">
                  <span>Price / Cost</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No medicines found matching your search or filters.
                </td>
              </tr>
            ) : (
              filteredMedicines.map(med => {
                const expiry = checkMedicineExpiry(med, REFERENCE_DATE);
                const isLowStock = med.stockQuantity <= med.minThreshold;
                const isCriticalDepleted = med.stockQuantity <= 5;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/75 transition-colors">
                    {/* 1. Name & Generic */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{med.genericName}</div>
                      <div className="text-[10px] text-slate-400">{med.manufacturer}</div>
                    </td>

                    {/* 2. Category & Form */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {med.category}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{med.dosageForm}</div>
                    </td>

                    {/* 3. Batch & Rack */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-mono text-[11px] font-medium text-slate-800">{med.batchNumber}</div>
                      <div className="text-[10px] text-slate-500">{med.rackLocation || 'Shelf A'}</div>
                    </td>

                    {/* 4. Stock / Min Threshold */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold text-xs ${
                          isCriticalDepleted ? 'text-red-700' : isLowStock ? 'text-amber-700' : 'text-slate-800'
                        }`}>
                          {med.stockQuantity}
                        </span>
                        <span className="text-slate-400 text-[10px]">/ min {med.minThreshold}</span>
                      </div>

                      {/* Stock Quick Stepper */}
                      <div className="flex items-center space-x-1 mt-1">
                        <button
                          onClick={() => onQuickStockChange(med.id, Math.max(0, med.stockQuantity - 5))}
                          title="Deduct 5 units"
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-mono cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => onQuickStockChange(med.id, med.stockQuantity + 10)}
                          title="Restock 10 units"
                          className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-mono cursor-pointer"
                        >
                          +10
                        </button>
                        {isLowStock && (
                          <span className="text-[10px] font-bold text-amber-600 ml-1">LOW</span>
                        )}
                      </div>
                    </td>

                    {/* 5. Expiry Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-800">{med.expiryDate}</div>
                      {expiry.status === 'EXPIRED' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          ⛔ EXPIRED ({Math.abs(expiry.daysToExpiry)}d ago)
                        </span>
                      )}
                      {expiry.status === 'CRITICAL_30' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                          ⏳ {expiry.daysToExpiry} days left
                        </span>
                      )}
                      {expiry.status === 'WARNING_60' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          {expiry.daysToExpiry} days left
                        </span>
                      )}
                      {expiry.status === 'WATCH_90' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-800">
                          {expiry.daysToExpiry} days left
                        </span>
                      )}
                      {expiry.status === 'SAFE' && (
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Safe ({expiry.daysToExpiry}d)
                        </span>
                      )}
                    </td>

                    {/* 6. Price / Cost */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">${med.unitPrice.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">Cost: ${med.costPrice.toFixed(2)}</div>
                    </td>

                    {/* 7. Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectForForecast(med.id)}
                          title="Forecast Demand (ML)"
                          className="p-1 rounded hover:bg-blue-50 text-blue-600 cursor-pointer"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditMedicine(med)}
                          title="Edit Medicine"
                          className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMedicine(med.id)}
                          title="Delete Medicine"
                          className="p-1 rounded hover:bg-red-50 text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
