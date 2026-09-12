import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { Medicine, SaleRecord } from '../types/pharmacy';
import { REFERENCE_DATE } from '../services/seedData';
import { checkMedicineExpiry } from '../services/expiryChecker';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onRecordSale: (sale: SaleRecord) => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  medicines,
  onRecordSale,
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [patientType, setPatientType] = useState<'Walk-in' | 'Refill' | 'Outpatient'>('Walk-in');

  if (!isOpen) return null;

  const currentMed = medicines.find(m => m.id === selectedMedId) || medicines[0];
  const maxStock = currentMed ? currentMed.stockQuantity : 0;
  const unitPrice = currentMed ? currentMed.unitPrice : 0;
  const totalAmount = Number((quantity * unitPrice).toFixed(2));
  const expiry = currentMed ? checkMedicineExpiry(currentMed, REFERENCE_DATE) : null;
  const isExpired = expiry?.status === 'EXPIRED';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMed || quantity <= 0 || quantity > maxStock) return;

    if (isExpired) {
      if (!window.confirm("WARNING: This medicine batch is expired! Clinical regulations require quarantining. Are you sure you wish to log this sale?")) {
        return;
      }
    }

    const sale: SaleRecord = {
      id: `sale-${Date.now()}`,
      medicineId: currentMed.id,
      medicineName: currentMed.name,
      category: currentMed.category,
      quantity,
      unitPrice,
      totalAmount,
      date: REFERENCE_DATE,
      timestamp: new Date().toISOString(),
      patientType,
      batchNumber: currentMed.batchNumber,
    };

    onRecordSale(sale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dispense Medicine / Point of Sale</h2>
              <p className="text-[11px] text-slate-500">Automatically deducts inventory and updates sales history</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Medicine SKU</label>
            <select
              value={selectedMedId}
              onChange={e => {
                setSelectedMedId(e.target.value);
                setQuantity(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (In Stock: {m.stockQuantity}) - ${m.unitPrice.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {currentMed && (
            <div className={`p-3 rounded-lg border text-xs ${
              isExpired ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Batch Number:</span>{' '}
                  <span className="font-mono font-medium">{currentMed.batchNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Available Stock:</span>{' '}
                  <span className="font-bold">{currentMed.stockQuantity} units</span>
                </div>
                <div>
                  <span className="text-slate-400">Expiry Date:</span>{' '}
                  <span className="font-mono font-medium">{currentMed.expiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Unit Price:</span>{' '}
                  <span className="font-bold">${currentMed.unitPrice.toFixed(2)}</span>
                </div>
              </div>

              {isExpired && (
                <div className="mt-2 flex items-center text-red-700 font-bold text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  BATCH IS EXPIRED! Should be quarantined instead of dispensed.
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity to Dispense</label>
              <input
                type="number"
                min="1"
                max={maxStock > 0 ? maxStock : 1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Max available: {maxStock}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Type</label>
              <select
                value={patientType}
                onChange={e => setPatientType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Walk-in">Walk-in OTC</option>
                <option value="Refill">Chronic Prescription Refill</option>
                <option value="Outpatient">Outpatient Clinic</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-900">Total Billed Amount:</span>
            <span className="text-lg font-bold text-blue-700">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={maxStock <= 0}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              Confirm Sale & Deduct Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
