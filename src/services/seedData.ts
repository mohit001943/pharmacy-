import { Medicine, SaleRecord } from '../types/pharmacy';

// Reference date for current operations: 2026-09-12
export const REFERENCE_DATE = '2026-09-12';

export const INITIAL_MEDICINES: Medicine[] = [
  // 1. Seasonal Cold & Flu
  {
    id: 'med-01',
    name: 'Cough Syrup (DXM + CPM)',
    genericName: 'Dextromethorphan HBr 10mg + Chlorpheniramine 2mg',
    batchNumber: 'CS-2025-A10',
    manufacturer: 'Abbott Healthcare',
    category: 'Seasonal Cold & Flu',
    unitPrice: 6.5,
    costPrice: 4.1,
    stockQuantity: 14, // LOW STOCK alert
    minThreshold: 25,
    expiryDate: '2026-10-05', // Expiring in ~23 days (CRITICAL)
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 1 - Bay B',
    dosageForm: 'Syrup',
    createdAt: '2025-10-05',
  },
  {
    id: 'med-02',
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Hydrochloride',
    batchNumber: 'CT-9941-B',
    manufacturer: 'Cipla Ltd',
    category: 'Seasonal Cold & Flu',
    unitPrice: 4.2,
    costPrice: 2.5,
    stockQuantity: 18, // LOW STOCK alert
    minThreshold: 30,
    expiryDate: '2026-10-25', // Expiring in ~43 days (WARNING 60)
    leadTimeDays: 2,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 1 - Bay C',
    dosageForm: 'Tablet',
    createdAt: '2025-01-15',
  },
  {
    id: 'med-03',
    name: 'Montelukast + Levocetirizine',
    genericName: 'Montelukast 10mg + Levocetirizine 5mg',
    batchNumber: 'ML-7812',
    manufacturer: 'Sun Pharma',
    category: 'Seasonal Cold & Flu',
    unitPrice: 8.5,
    costPrice: 5.2,
    stockQuantity: 65,
    minThreshold: 20,
    expiryDate: '2027-04-15',
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 1 - Bay D',
    dosageForm: 'Tablet',
    createdAt: '2025-04-15',
  },
  {
    id: 'med-04',
    name: 'Cold & Sinus Relief Caplets',
    genericName: 'Paracetamol 500mg + Phenylephrine 10mg',
    batchNumber: 'CS-4402',
    manufacturer: 'GSK Consumer Health',
    category: 'Seasonal Cold & Flu',
    unitPrice: 5.0,
    costPrice: 3.1,
    stockQuantity: 8, // CRITICAL LOW STOCK
    minThreshold: 25,
    expiryDate: '2026-08-28', // ALREADY EXPIRED!
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 1 - Bay A',
    dosageForm: 'Capsule',
    createdAt: '2024-08-28',
  },

  // 2. Antibiotics
  {
    id: 'med-05',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    batchNumber: 'AMX-2025-09',
    manufacturer: 'Pfizer Inc',
    category: 'Antibiotics',
    unitPrice: 9.8,
    costPrice: 6.2,
    stockQuantity: 84,
    minThreshold: 30,
    expiryDate: '2027-02-18',
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 2 - Bay A',
    dosageForm: 'Capsule',
    createdAt: '2025-02-18',
  },
  {
    id: 'med-06',
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin Dihydrate',
    batchNumber: 'AZI-5520',
    manufacturer: 'Cipla Ltd',
    category: 'Antibiotics',
    unitPrice: 12.0,
    costPrice: 7.8,
    stockQuantity: 28,
    minThreshold: 25,
    expiryDate: '2026-11-10', // Expiring in ~59 days
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 2 - Bay B',
    dosageForm: 'Tablet',
    createdAt: '2024-11-10',
  },
  {
    id: 'med-07',
    name: 'Ciprofloxacin 500mg',
    genericName: 'Ciprofloxacin Hydrochloride',
    batchNumber: 'CIP-3301',
    manufacturer: 'Bayer Pharmaceuticals',
    category: 'Antibiotics',
    unitPrice: 11.5,
    costPrice: 7.0,
    stockQuantity: 42,
    minThreshold: 20,
    expiryDate: '2027-06-30',
    leadTimeDays: 5,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 2 - Bay C',
    dosageForm: 'Tablet',
    createdAt: '2024-06-30',
  },
  {
    id: 'med-08',
    name: 'Cefixime 200mg',
    genericName: 'Cefixime Trihydrate',
    batchNumber: 'CFX-8819',
    manufacturer: 'Lupin Pharma',
    category: 'Antibiotics',
    unitPrice: 14.2,
    costPrice: 9.0,
    stockQuantity: 12, // LOW STOCK
    minThreshold: 20,
    expiryDate: '2026-09-02', // EXPIRED 10 days ago!
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 2 - Bay D',
    dosageForm: 'Tablet',
    createdAt: '2024-09-02',
  },

  // 3. Painkillers & Analgesics
  {
    id: 'med-09',
    name: 'Paracetamol 650mg (Dolo)',
    genericName: 'Acetaminophen / Paracetamol',
    batchNumber: 'PCM-650-8',
    manufacturer: 'Micro Labs Ltd',
    category: 'Painkillers & Analgesics',
    unitPrice: 3.5,
    costPrice: 1.8,
    stockQuantity: 160,
    minThreshold: 50,
    expiryDate: '2027-12-31',
    leadTimeDays: 2,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 3 - Bay A',
    dosageForm: 'Tablet',
    createdAt: '2025-01-01',
  },
  {
    id: 'med-10',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    batchNumber: 'IBU-9902',
    manufacturer: 'Abbott Healthcare',
    category: 'Painkillers & Analgesics',
    unitPrice: 4.8,
    costPrice: 2.6,
    stockQuantity: 19, // LOW STOCK
    minThreshold: 35,
    expiryDate: '2026-10-18', // Expiring in ~36 days
    leadTimeDays: 3,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 3 - Bay B',
    dosageForm: 'Tablet',
    createdAt: '2023-10-18',
  },
  {
    id: 'med-11',
    name: 'Diclofenac Gel 1%',
    genericName: 'Diclofenac Diethylamine',
    batchNumber: 'DIC-GEL-41',
    manufacturer: 'Novartis',
    category: 'Painkillers & Analgesics',
    unitPrice: 7.2,
    costPrice: 4.5,
    stockQuantity: 34,
    minThreshold: 15,
    expiryDate: '2027-03-20',
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 3 - Bay C',
    dosageForm: 'Ointment',
    createdAt: '2025-03-20',
  },
  {
    id: 'med-12',
    name: 'Tramadol 50mg',
    genericName: 'Tramadol Hydrochloride',
    batchNumber: 'TRM-1011',
    manufacturer: 'Dr. Reddy Labs',
    category: 'Painkillers & Analgesics',
    unitPrice: 8.9,
    costPrice: 5.5,
    stockQuantity: 22,
    minThreshold: 15,
    expiryDate: '2027-08-15',
    leadTimeDays: 5,
    shelfLifeMonths: 24,
    rackLocation: 'Locked Cabinet - A',
    dosageForm: 'Capsule',
    createdAt: '2025-08-15',
  },

  // 4. Chronic & Cardiovascular
  {
    id: 'med-13',
    name: 'Telmisartan 40mg',
    genericName: 'Telmisartan',
    batchNumber: 'TEL-40-77',
    manufacturer: 'Glenmark Pharma',
    category: 'Chronic & Cardiovascular',
    unitPrice: 6.8,
    costPrice: 4.0,
    stockQuantity: 110,
    minThreshold: 40,
    expiryDate: '2028-01-10',
    leadTimeDays: 3,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 4 - Bay A',
    dosageForm: 'Tablet',
    createdAt: '2025-01-10',
  },
  {
    id: 'med-14',
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    batchNumber: 'AML-05-19',
    manufacturer: 'Pfizer Inc',
    category: 'Chronic & Cardiovascular',
    unitPrice: 5.2,
    costPrice: 3.0,
    stockQuantity: 95,
    minThreshold: 35,
    expiryDate: '2027-09-01',
    leadTimeDays: 2,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 4 - Bay B',
    dosageForm: 'Tablet',
    createdAt: '2024-09-01',
  },
  {
    id: 'med-15',
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    batchNumber: 'ATV-20-44',
    manufacturer: 'Sun Pharma',
    category: 'Chronic & Cardiovascular',
    unitPrice: 9.0,
    costPrice: 5.6,
    stockQuantity: 15, // LOW STOCK
    minThreshold: 35,
    expiryDate: '2026-11-28', // Expiring in 77 days (WATCH 90)
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 4 - Bay C',
    dosageForm: 'Tablet',
    createdAt: '2024-11-28',
  },
  {
    id: 'med-16',
    name: 'Losartan Potassium 50mg',
    genericName: 'Losartan Potassium',
    batchNumber: 'LOS-50-61',
    manufacturer: 'Torrent Pharma',
    category: 'Chronic & Cardiovascular',
    unitPrice: 6.4,
    costPrice: 3.8,
    stockQuantity: 70,
    minThreshold: 25,
    expiryDate: '2027-11-15',
    leadTimeDays: 3,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 4 - Bay D',
    dosageForm: 'Tablet',
    createdAt: '2024-11-15',
  },

  // 5. Diabetes Care
  {
    id: 'med-17',
    name: 'Metformin 500mg SR',
    genericName: 'Metformin Hydrochloride Prolonged Release',
    batchNumber: 'MET-500-SR',
    manufacturer: 'USV Private Ltd',
    category: 'Diabetes Care',
    unitPrice: 4.5,
    costPrice: 2.7,
    stockQuantity: 140,
    minThreshold: 45,
    expiryDate: '2027-10-30',
    leadTimeDays: 2,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 5 - Bay A',
    dosageForm: 'Tablet',
    createdAt: '2024-10-30',
  },
  {
    id: 'med-18',
    name: 'Glimepiride 2mg',
    genericName: 'Glimepiride',
    batchNumber: 'GLM-02-83',
    manufacturer: 'Sanofi India',
    category: 'Diabetes Care',
    unitPrice: 6.0,
    costPrice: 3.7,
    stockQuantity: 45,
    minThreshold: 25,
    expiryDate: '2026-10-12', // Expiring in 30 days (CRITICAL)
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 5 - Bay B',
    dosageForm: 'Tablet',
    createdAt: '2024-10-12',
  },
  {
    id: 'med-19',
    name: 'Dapagliflozin 10mg',
    genericName: 'Dapagliflozin Propanediol',
    batchNumber: 'DAP-10-22',
    manufacturer: 'AstraZeneca',
    category: 'Diabetes Care',
    unitPrice: 18.5,
    costPrice: 12.0,
    stockQuantity: 30,
    minThreshold: 15,
    expiryDate: '2027-05-14',
    leadTimeDays: 5,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 5 - Bay C',
    dosageForm: 'Tablet',
    createdAt: '2025-05-14',
  },
  {
    id: 'med-20',
    name: 'Insulin Glargine Pen (100 IU/ml)',
    genericName: 'Insulin Glargine Recombinant',
    batchNumber: 'INS-GL-90',
    manufacturer: 'Sanofi Aventis',
    category: 'Diabetes Care',
    unitPrice: 26.0,
    costPrice: 19.5,
    stockQuantity: 11, // LOW STOCK
    minThreshold: 20,
    expiryDate: '2026-12-05', // Expiring in 84 days (WATCH 90)
    leadTimeDays: 4,
    shelfLifeMonths: 18,
    rackLocation: 'Refrigerated Unit 1',
    dosageForm: 'Injection',
    createdAt: '2025-06-05',
  },

  // 6. Gastrointestinal
  {
    id: 'med-21',
    name: 'Pantoprazole 40mg',
    genericName: 'Pantoprazole Sodium',
    batchNumber: 'PAN-40-09',
    manufacturer: 'Alkem Laboratories',
    category: 'Gastrointestinal',
    unitPrice: 5.5,
    costPrice: 3.2,
    stockQuantity: 125,
    minThreshold: 40,
    expiryDate: '2027-07-20',
    leadTimeDays: 2,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 6 - Bay A',
    dosageForm: 'Tablet',
    createdAt: '2025-07-20',
  },
  {
    id: 'med-22',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole Magnesium',
    batchNumber: 'OME-20-11',
    manufacturer: 'Dr. Reddy Labs',
    category: 'Gastrointestinal',
    unitPrice: 4.8,
    costPrice: 2.8,
    stockQuantity: 16, // LOW STOCK
    minThreshold: 30,
    expiryDate: '2026-10-01', // Expiring in 19 days (CRITICAL)
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 6 - Bay B',
    dosageForm: 'Capsule',
    createdAt: '2024-10-01',
  },
  {
    id: 'med-23',
    name: 'Antacid Gel (Al+Mg Hydroxide)',
    genericName: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
    batchNumber: 'ANT-GEL-88',
    manufacturer: 'Pfizer Ltd',
    category: 'Gastrointestinal',
    unitPrice: 4.0,
    costPrice: 2.3,
    stockQuantity: 38,
    minThreshold: 20,
    expiryDate: '2027-01-15',
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 6 - Bay C',
    dosageForm: 'Syrup',
    createdAt: '2025-01-15',
  },
  {
    id: 'med-24',
    name: 'Domperidone 10mg',
    genericName: 'Domperidone',
    batchNumber: 'DOM-10-47',
    manufacturer: 'Torrent Pharma',
    category: 'Gastrointestinal',
    unitPrice: 3.8,
    costPrice: 2.1,
    stockQuantity: 52,
    minThreshold: 20,
    expiryDate: '2027-04-10',
    leadTimeDays: 3,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 6 - Bay D',
    dosageForm: 'Tablet',
    createdAt: '2024-04-10',
  },

  // 7. Dermatological
  {
    id: 'med-25',
    name: 'Clotrimazole 1% Cream',
    genericName: 'Clotrimazole Antifungal',
    batchNumber: 'CLT-CR-31',
    manufacturer: 'Bayer Healthcare',
    category: 'Dermatological',
    unitPrice: 5.8,
    costPrice: 3.4,
    stockQuantity: 29,
    minThreshold: 20,
    expiryDate: '2027-03-12',
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 7 - Bay A',
    dosageForm: 'Ointment',
    createdAt: '2025-03-12',
  },
  {
    id: 'med-26',
    name: 'Hydrocortisone 1% Cream',
    genericName: 'Hydrocortisone',
    batchNumber: 'HYD-01-52',
    manufacturer: 'GSK Pharma',
    category: 'Dermatological',
    unitPrice: 6.2,
    costPrice: 3.8,
    stockQuantity: 18, // LOW STOCK
    minThreshold: 20,
    expiryDate: '2026-11-05', // Expiring in 54 days (WARNING 60)
    leadTimeDays: 3,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 7 - Bay B',
    dosageForm: 'Ointment',
    createdAt: '2024-11-05',
  },
  {
    id: 'med-27',
    name: 'Betamethasone Dipropionate 0.05%',
    genericName: 'Betamethasone Dipropionate',
    batchNumber: 'BET-55-92',
    manufacturer: 'Merck & Co',
    category: 'Dermatological',
    unitPrice: 7.5,
    costPrice: 4.8,
    stockQuantity: 36,
    minThreshold: 15,
    expiryDate: '2027-08-25',
    leadTimeDays: 4,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 7 - Bay C',
    dosageForm: 'Ointment',
    createdAt: '2025-08-25',
  },

  // 8. Vitamins & Supplements
  {
    id: 'med-28',
    name: 'Vitamin D3 60,000 IU',
    genericName: 'Cholecalciferol',
    batchNumber: 'VD3-60K-04',
    manufacturer: 'Cadila Pharma',
    category: 'Vitamins & Supplements',
    unitPrice: 8.0,
    costPrice: 4.8,
    stockQuantity: 75,
    minThreshold: 30,
    expiryDate: '2027-10-15',
    leadTimeDays: 2,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 8 - Bay A',
    dosageForm: 'Capsule',
    createdAt: '2025-10-15',
  },
  {
    id: 'med-29',
    name: 'Vitamin C 500mg (Chewable)',
    genericName: 'Ascorbic Acid + Sodium Ascorbate',
    batchNumber: 'VTC-500-19',
    manufacturer: 'Abbott Healthcare',
    category: 'Vitamins & Supplements',
    unitPrice: 3.2,
    costPrice: 1.8,
    stockQuantity: 110,
    minThreshold: 40,
    expiryDate: '2027-06-18',
    leadTimeDays: 2,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 8 - Bay B',
    dosageForm: 'Tablet',
    createdAt: '2025-06-18',
  },
  {
    id: 'med-30',
    name: 'Calcium Carbonate + D3 Tablets',
    genericName: 'Calcium Carbonate 500mg + Vitamin D3 250 IU',
    batchNumber: 'CAL-D3-78',
    manufacturer: 'GSK Consumer Health',
    category: 'Vitamins & Supplements',
    unitPrice: 5.2,
    costPrice: 3.1,
    stockQuantity: 60,
    minThreshold: 25,
    expiryDate: '2027-02-28',
    leadTimeDays: 3,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 8 - Bay C',
    dosageForm: 'Tablet',
    createdAt: '2024-02-28',
  },
  {
    id: 'med-31',
    name: 'Multivitamin with Zinc & Ginseng',
    genericName: 'Zincovit & Essential Minerals',
    batchNumber: 'MVT-ZN-99',
    manufacturer: 'Apex Laboratories',
    category: 'Vitamins & Supplements',
    unitPrice: 7.0,
    costPrice: 4.2,
    stockQuantity: 88,
    minThreshold: 30,
    expiryDate: '2027-11-20',
    leadTimeDays: 2,
    shelfLifeMonths: 24,
    rackLocation: 'Aisle 8 - Bay D',
    dosageForm: 'Tablet',
    createdAt: '2025-11-20',
  },
  {
    id: 'med-32',
    name: 'ORS Electrolyte Solution Sachets',
    genericName: 'Oral Rehydration Salts IP (WHO Formula)',
    batchNumber: 'ORS-WHO-12',
    manufacturer: 'FDC Limited',
    category: 'Gastrointestinal',
    unitPrice: 1.5,
    costPrice: 0.8,
    stockQuantity: 180,
    minThreshold: 40,
    expiryDate: '2027-12-10',
    leadTimeDays: 2,
    shelfLifeMonths: 36,
    rackLocation: 'Aisle 6 - Bay E',
    dosageForm: 'Tablet',
    createdAt: '2024-12-10',
  }
];

/**
 * Generate 180 days of realistic daily sales history for each medicine.
 * Features:
 * - Seasonal waves for cold/cough medicines
 * - Steady baseline for chronic disease medicines (BP, diabetes)
 * - Weekend variations (higher sales on Saturday/Sunday)
 * - An intentional anomaly spike on 2026-08-20 for flu/pain medicines (outbreak pattern)
 */
export function generateSyntheticSalesData(medicines: Medicine[] = INITIAL_MEDICINES): SaleRecord[] {
  const records: SaleRecord[] = [];
  const totalDays = 180;
  const refDateObj = new Date(REFERENCE_DATE);

  // Deterministic pseudo-random seed generator for reproducible and realistic sales
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let dayOffset = totalDays; dayOffset >= 1; dayOffset--) {
    const currentDate = new Date(refDateObj);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Time progression (0 at 180 days ago, 1 at today)
    const timeProgress = (totalDays - dayOffset) / totalDays;

    medicines.forEach((med, medIdx) => {
      let baseAvg = 5;
      let seasonalFactor = 1.0;

      // Behavior by category
      if (med.category === 'Seasonal Cold & Flu') {
        // Cold & Flu medicines have strong seasonal peak during months (e.g. monsoon / winter)
        // Cosine wave cycle
        seasonalFactor = 1.0 + 1.2 * Math.sin((dayOffset / 180) * 2 * Math.PI + Math.PI / 4);
        baseAvg = 8;
      } else if (med.category === 'Chronic & Cardiovascular' || med.category === 'Diabetes Care') {
        // Very steady, slight upward trend as patient base grows
        seasonalFactor = 1.0 + 0.15 * timeProgress;
        baseAvg = 9;
      } else if (med.category === 'Painkillers & Analgesics') {
        baseAvg = 12;
        seasonalFactor = 1.0;
      } else if (med.category === 'Antibiotics') {
        baseAvg = 6;
        seasonalFactor = 0.9 + 0.3 * Math.cos(dayOffset / 20);
      } else if (med.category === 'Vitamins & Supplements') {
        baseAvg = 7;
        seasonalFactor = 1.0 + 0.2 * Math.sin(dayOffset / 40);
      } else {
        baseAvg = 5;
      }

      // Weekend boost: pharmacies often see 20% higher traffic on weekends
      const weekendBoost = isWeekend ? 1.25 : 0.95;

      // Noise factor
      const noise = (pseudoRandom() - 0.45) * 4;

      let unitsSold = Math.round(baseAvg * seasonalFactor * weekendBoost + noise);

      // Intentional Anomaly: Outbreak surge on dayOffset = 23 (approx 2026-08-20)
      if (dayOffset === 23 && (med.id === 'med-01' || med.id === 'med-02' || med.id === 'med-09')) {
        unitsSold = Math.round(unitsSold * 3.8); // Huge outbreak spike!
      }

      // Clip minimum sales to 0
      unitsSold = Math.max(0, unitsSold);

      if (unitsSold > 0) {
        records.push({
          id: `sale-${med.id}-${dayOffset}`,
          medicineId: med.id,
          medicineName: med.name,
          category: med.category,
          quantity: unitsSold,
          unitPrice: med.unitPrice,
          totalAmount: Number((unitsSold * med.unitPrice).toFixed(2)),
          date: dateStr,
          timestamp: `${dateStr}T${10 + (medIdx % 8)}:30:00Z`,
          patientType: (dayOffset % 5 === 0) ? 'Refill' : (dayOffset % 2 === 0 ? 'Walk-in' : 'Outpatient'),
          batchNumber: med.batchNumber,
        });
      }
    });
  }

  return records;
}
