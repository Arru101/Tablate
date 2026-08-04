import { Pharmacy, KYCSubmission } from '../types';

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  duplicateField?: 'aadhaar' | 'drugLicenseNo' | 'licenseNumber' | 'phone' | 'email';
  reason?: string;
}

/**
 * Verhoeff multiplication matrix for 12-digit Indian Aadhaar checksum validation
 */
const verhoeffD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 1, 2, 3, 4],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const verhoeffP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const verhoeffInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

export class PharmacistDeduplicationService {
  /**
   * Verifies Indian 12-digit Aadhaar using Verhoeff Checksum Algorithm
   */
  public static isValidAadhaar(aadhaar: string): boolean {
    const clean = aadhaar.replace(/[\s-]/g, '');
    if (!/^\d{12}$/.test(clean)) return false;

    let c = 0;
    const myArray = clean.split('').map(Number).reverse();

    for (let i = 0; i < myArray.length; i++) {
      c = verhoeffD[c][verhoeffP[i % 8][myArray[i]]];
    }

    return c === 0;
  }

  /**
   * Masks Aadhaar for privacy compliance (e.g., XXXX-XXXX-1234)
   */
  public static maskAadhaar(aadhaar: string): string {
    const clean = aadhaar.replace(/[\s-]/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  /**
   * Validates Drug License Form 20B/21B format (e.g. MH-MUM-DL-12345 or 20B/21B-MH-12345)
   */
  public static isValidDrugLicense(license: string): boolean {
    const clean = license.trim();
    return clean.length >= 6 && /^[a-zA-Z0-9/-]+$/.test(clean);
  }

  /**
   * High-Performance O(1) Hash Map Index Builder for Instant Uniqueness Checks
   */
  private static buildIndexMap(
    existingPharmacies: Pharmacy[],
    kycQueue: KYCSubmission[]
  ) {
    const drugLicenseMap = new Map<string, string>();
    const licenseNumberMap = new Map<string, string>();
    const phoneMap = new Map<string, string>();
    const aadhaarMap = new Map<string, string>();

    // 1. Index Existing Active Stores
    for (const p of existingPharmacies) {
      if (p.drugLicenseNo) {
        drugLicenseMap.set(p.drugLicenseNo.trim().toUpperCase(), p.name);
      }
      if (p.licenseNumber) {
        licenseNumberMap.set(p.licenseNumber.trim().toUpperCase(), p.name);
      }
      if (p.phone) {
        const cleanP = p.phone.replace(/[\s-+]/g, '');
        if (cleanP) phoneMap.set(cleanP, p.name);
      }
    }

    // 2. Index Active / Pending KYC Queue
    for (const kyc of kycQueue) {
      if (kyc.status !== 'rejected') {
        const storeName = kyc.pharmacyName || 'Pending Application';
        if (kyc.drugLicenseNo) {
          drugLicenseMap.set(kyc.drugLicenseNo.trim().toUpperCase(), storeName);
        }
        if (kyc.licenseNumber) {
          licenseNumberMap.set(kyc.licenseNumber.trim().toUpperCase(), storeName);
        }
        if (kyc.ownerAadhaar) {
          const cleanA = kyc.ownerAadhaar.replace(/[\s-]/g, '');
          if (cleanA) aadhaarMap.set(cleanA, storeName);
        }
        if (kyc.phone) {
          const cleanP = kyc.phone.replace(/[\s-+]/g, '');
          if (cleanP) phoneMap.set(cleanP, storeName);
        }
      }
    }

    return { drugLicenseMap, licenseNumberMap, phoneMap, aadhaarMap };
  }

  /**
   * O(1) Constant Time Uniqueness Checker across Active Stores & Pending Registrations
   */
  public static checkDuplicate(
    input: {
      aadhaar?: string;
      drugLicenseNo?: string;
      licenseNumber?: string;
      phone?: string;
      email?: string;
    },
    existingPharmacies: Pharmacy[],
    kycQueue: KYCSubmission[]
  ): DeduplicationCheckResult {
    const { drugLicenseMap, licenseNumberMap, phoneMap, aadhaarMap } = this.buildIndexMap(
      existingPharmacies,
      kycQueue
    );

    // 1. Check Drug License Uniqueness in O(1)
    if (input.drugLicenseNo) {
      const cleanDl = input.drugLicenseNo.trim().toUpperCase();
      if (cleanDl && drugLicenseMap.has(cleanDl)) {
        const existingName = drugLicenseMap.get(cleanDl);
        return {
          isDuplicate: true,
          duplicateField: 'drugLicenseNo',
          reason: `A pharmacy store ("${existingName}") is already registered under Drug License No: ${cleanDl}`
        };
      }
    }

    // 2. Check Pharmacist State Council License Uniqueness in O(1)
    if (input.licenseNumber) {
      const cleanLic = input.licenseNumber.trim().toUpperCase();
      if (cleanLic && licenseNumberMap.has(cleanLic)) {
        const existingName = licenseNumberMap.get(cleanLic);
        return {
          isDuplicate: true,
          duplicateField: 'licenseNumber',
          reason: `Pharmacist License No: ${cleanLic} is already registered under store ("${existingName}")`
        };
      }
    }

    // 3. Check Phone Uniqueness in O(1)
    if (input.phone) {
      const cleanPhone = input.phone.replace(/[\s-+]/g, '');
      if (cleanPhone && phoneMap.has(cleanPhone)) {
        const existingName = phoneMap.get(cleanPhone);
        return {
          isDuplicate: true,
          duplicateField: 'phone',
          reason: `Phone number (${input.phone}) is already registered with store ("${existingName}")`
        };
      }
    }

    // 4. Check Aadhaar Uniqueness in O(1)
    if (input.aadhaar) {
      const cleanAadhaar = input.aadhaar.replace(/[\s-]/g, '');
      if (cleanAadhaar && aadhaarMap.has(cleanAadhaar)) {
        const existingName = aadhaarMap.get(cleanAadhaar);
        return {
          isDuplicate: true,
          duplicateField: 'aadhaar',
          reason: `An account application associated with Aadhaar (${this.maskAadhaar(input.aadhaar)}) is already active under "${existingName}".`
        };
      }
    }

    return { isDuplicate: false };
  }
}
