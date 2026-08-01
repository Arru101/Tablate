export interface OCRResult {
  confidence: number;
  extractedMedicineName: string;
  detectedStrength?: string;
  detectedManufacturer?: string;
  rawText: string;
  matchedMedicineId?: string;
}

export const scanMedicineImage = async (file: File): Promise<OCRResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.includes('dolo') || fileNameLower.includes('paracetamol')) {
        resolve({
          confidence: 0.96,
          extractedMedicineName: 'Dolo 650',
          detectedStrength: '650mg',
          detectedManufacturer: 'Micro Labs Ltd',
          rawText: 'DOLO 650 IP PARACETAMOL TABLETS 650MG BATCH DL24A91 EXP 08/2027 MFG MICRO LABS',
          matchedMedicineId: 'med-1'
        });
      } else if (fileNameLower.includes('augmentin') || fileNameLower.includes('mox')) {
        resolve({
          confidence: 0.94,
          extractedMedicineName: 'Augmentin 625 Duo',
          detectedStrength: '625mg',
          detectedManufacturer: 'GSK India',
          rawText: 'AUGMENTIN 625 DUO AMOXICILLIN AND POTASSIUM CLAVULANATE TABLETS IP SCHEDULE H PRESCRIPTION DRUG',
          matchedMedicineId: 'med-2'
        });
      } else if (fileNameLower.includes('pantocid') || fileNameLower.includes('pan')) {
        resolve({
          confidence: 0.92,
          extractedMedicineName: 'Pantocid 40',
          detectedStrength: '40mg',
          detectedManufacturer: 'Sun Pharma',
          rawText: 'PANTOCID 40 PANTOPRAZOLE SODIUM GASTRO RESISTANT TABLETS IP 40MG',
          matchedMedicineId: 'med-3'
        });
      } else if (fileNameLower.includes('actrapid') || fileNameLower.includes('insulin')) {
        resolve({
          confidence: 0.98,
          extractedMedicineName: 'Human Actrapid 40IU/ml',
          detectedStrength: '40IU/ml',
          detectedManufacturer: 'Novo Nordisk',
          rawText: 'HUMAN ACTRAPID 40 IU/ML SOLUBLE INSULIN INJECTION 10ML VIAL REFRIGERATE AT 2-8 C',
          matchedMedicineId: 'med-6'
        });
      } else {
        resolve({
          confidence: 0.91,
          extractedMedicineName: 'Dolo 650',
          detectedStrength: '650mg',
          detectedManufacturer: 'Micro Labs Ltd',
          rawText: 'EXTRACTED MEDICINE DATA: DOLO 650 IP PARACETAMOL TABLETS 650MG BATCH DL24A91',
          matchedMedicineId: 'med-1'
        });
      }
    }, 1200);
  });
};
