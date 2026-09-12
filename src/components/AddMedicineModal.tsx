import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Medicine, MedicineCategory } from '../types/pharmacy';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Medicine) => void;
  initialData?: Medicine | null;
}

const CATEGORIES: MedicineCategory[] = [
  'Antibiotics',
  'Painkillers & Analgesics',
  'Seasonal Cold & Flu',
  'Chronic & Cardiovascular',
  'Diabetes Care',
  'Gastrointestinal',
  'Dermatological',
  'Vitamins & Supplements',
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    genericName: '',
    batchNumber: '',
    manufacturer: '',
    category: 'Seasonal Cold & Flu',
    unitPrice: 5.0,
    costPrice: 3.0,
    stockQuantity: 50,
    minThreshold: 20,
    expiryDate: '2027-06-30',
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 1 - Bay A',
    dosageForm: 'Tablet',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: `med-${Date.now().toString().slice(-4)}`,
        name: '',
        genericName: '',
        batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        manufacturer: '',
        category: 'Seasonal Cold & Flu',
        unitPrice: 5.0,
        costPrice: 3.0,
        stockQuantity: 50,
        minThreshold: 20,
        expiryDate: '2027-06-30',
        leadTimeDays: 3,
        shelfLifeMonths: 24,
        rackLocation: 'Aisle 1 - Bay A',
        dosageForm: 'Tablet',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNumber) return;

    const med: Medicine = {
      id: formData.id || `med-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      genericName: formData.genericName || formData.name,
      batchNumber: formData.batchNumber,
      manufacturer: formData.manufacturer || 'Generic Pharma',
      category: formData.category as MedicineCategory,
      unitPrice: Number(formData.unitPrice) || 5.0,
      costPrice: Number(formData.costPrice) || 3.0,
      stockQuantity: Number(formData.stockQuantity) || 0,
      minThreshold: Number(formData.minThreshold) || 20,
      expiryDate: formData.expiryDate || '2027-06-30',
      leadTimeDays: Number(formData.leadTimeDays) || 3,
      shelfLifeMonths: Number(formData.shelfLifeMonths) || 24,
      rackLocation: formData.rackLocation || 'Aisle 1',
      dosageForm: (formData.dosageForm as any) || 'Tablet',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(med);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            {initialData ? 'Edit Medicine SKU' : 'Add New Medicine to Inventory'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Trade Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol 650mg"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Generic Formula</label>
              <input
                type="text"
                placeholder="e.g. Acetaminophen"
                value={formData.genericName || ''}
                onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. BATCH-2026-09"
                value={formData.batchNumber || ''}
                onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. Cipla Ltd / Abbott"
                value={formData.manufacturer || ''}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Therapeutic Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as MedicineCategory })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage Form</label>
              <select
                value={formData.dosageForm}
                onChange={e => setFormData({ ...formData, dosageForm: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Drops</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Units</label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity || 0}
                onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Alert Threshold (min)</label>
              <input
                type="number"
                min="1"
                value={formData.minThreshold || 20}
                onChange={e => setFormData({ ...formData, minThreshold: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (YYYY-MM-DD) *</label>
              <input
                type="date"
                required
                value={formData.expiryDate || ''}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.leadTimeDays || 3}
                onChange={e => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price per Unit ($)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.unitPrice || 0}
                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Distributor Cost Price ($)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.costPrice || 0}
                onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              {initialData ? 'Update Medicine' : 'Save to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
