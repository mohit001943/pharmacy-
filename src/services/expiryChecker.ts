import { Medicine, ExpiryAlertItem } from '../types/pharmacy';
import { REFERENCE_DATE } from './seedData';

export function calculateDaysBetween(fromDateStr: string, toDateStr: string): number {
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  const diffTime = to.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function checkMedicineExpiry(medicine: Medicine, referenceDate: string = REFERENCE_DATE): ExpiryAlertItem {
  const days = calculateDaysBetween(referenceDate, medicine.expiryDate);

  if (days < 0) {
    return {
      medicine,
      daysToExpiry: days,
      status: 'EXPIRED',
      actionRequired: 'QUARANTINE IMMEDIATELY: Halt dispensing, pull from shelves, and initiate distributor return/incineration log.',
    };
  } else if (days <= 30) {
    return {
      medicine,
      daysToExpiry: days,
      status: 'CRITICAL_30',
      actionRequired: 'URGENT FEFO (First-Expired-First-Out): Move to front billing shelf, notify doctors for rapid dispensing, halt reorders.',
    };
  } else if (days <= 60) {
    return {
      medicine,
      daysToExpiry: days,
      status: 'WARNING_60',
      actionRequired: 'EXPIRY WARNING (60 Days): Review current daily run-rate. Flag in POS system to prioritize this batch.',
    };
  } else if (days <= 90) {
    return {
      medicine,
      daysToExpiry: days,
      status: 'WATCH_90',
      actionRequired: 'EXPIRY WATCHLIST (90 Days): Track remaining batch inventory against projected 30-day demand.',
    };
  }

  return {
    medicine,
    daysToExpiry: days,
    status: 'SAFE',
    actionRequired: 'Stock safe. Normal FEFO dispensing workflow applies.',
  };
}

export function getAllExpiryAlerts(medicines: Medicine[], referenceDate: string = REFERENCE_DATE): ExpiryAlertItem[] {
  return medicines
    .map(m => checkMedicineExpiry(m, referenceDate))
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
