import { Pharmacy, KYCSubmission } from '../types';

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  duplicateField?: 'aadhaar' | 'drugLicenseNo' | 'licenseNumber' | 'phone' | 'email';
  reason?: string;
}

export class PharmacistDeduplicationService {
  /**
   * Validates standard Indian Aadhaar Number (12 numeric digits, no spaces/hyphens count)
   */
  public static isValidAadhaar(aadhaar: string): boolean {
    const clean = aadhaar.replace(/[\s-]/g, '');
    return /^\d{12}$/.test(clean);
  }

  /**
   * Validates Drug License Form 20B/21B format (e.g. MH-MUM-DL-12345 or 20B/21B-MH-12345)
   */
  public static isValidDrugLicense(license: string): boolean {
    const clean = license.trim();
    return clean.length >= 6 && /^[a-zA-Z0-9/-]+$/.test(clean);
  }

  /**
   * Checks whether a new pharmacist submission conflicts with existing verified stores or pending KYC queue
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
    const cleanAadhaar = input.aadhaar ? input.aadhaar.replace(/[\s-]/g, '') : '';
    const cleanDrugLicense = input.drugLicenseNo ? input.drugLicenseNo.trim().toUpperCase() : '';
    const cleanLicenseNumber = input.licenseNumber ? input.licenseNumber.trim().toUpperCase() : '';
    const cleanPhone = input.phone ? input.phone.replace(/[\s-+]/g, '') : '';
    const cleanEmail = input.email ? input.email.trim().toLowerCase() : '';

    // 1. Check Drug License Uniqueness in existing pharmacies
    if (cleanDrugLicense) {
      const match = existingPharmacies.find(
        (p) => p.drugLicenseNo && p.drugLicenseNo.trim().toUpperCase() === cleanDrugLicense
      );
      if (match) {
        return {
          isDuplicate: true,
          duplicateField: 'drugLicenseNo',
          reason: `A pharmacy store ("${match.name}") is already registered with Drug License No: ${cleanDrugLicense}`
        };
      }
    }

    // 2. Check Pharmacist License Uniqueness in existing pharmacies
    if (cleanLicenseNumber) {
      const match = existingPharmacies.find(
        (p) => p.licenseNumber && p.licenseNumber.trim().toUpperCase() === cleanLicenseNumber
      );
      if (match) {
        return {
          isDuplicate: true,
          duplicateField: 'licenseNumber',
          reason: `A pharmacy store ("${match.name}") is already registered under License No: ${cleanLicenseNumber}`
        };
      }
    }

    // 3. Check Phone Uniqueness
    if (cleanPhone) {
      const match = existingPharmacies.find(
        (p) => p.phone && p.phone.replace(/[\s-+]/g, '') === cleanPhone
      );
      if (match) {
        return {
          isDuplicate: true,
          duplicateField: 'phone',
          reason: `A registered account with phone number (${input.phone}) already exists.`
        };
      }
    }

    // 4. Check Aadhaar & License Uniqueness in Pending KYC Queue
    for (const kyc of kycQueue) {
      if (kyc.status !== 'rejected') {
        const kycAadhaar = kyc.ownerAadhaar ? kyc.ownerAadhaar.replace(/[\s-]/g, '') : '';
        const kycDrugLicense = kyc.drugLicenseNo ? kyc.drugLicenseNo.trim().toUpperCase() : '';
        const kycLicense = kyc.licenseNumber ? kyc.licenseNumber.trim().toUpperCase() : '';

        if (cleanAadhaar && kycAadhaar === cleanAadhaar) {
          return {
            isDuplicate: true,
            duplicateField: 'aadhaar',
            reason: `An account application with Aadhaar (${input.aadhaar}) is already registered or undergoing KYC verification.`
          };
        }

        if (cleanDrugLicense && kycDrugLicense === cleanDrugLicense) {
          return {
            isDuplicate: true,
            duplicateField: 'drugLicenseNo',
            reason: `An application for Drug License (${cleanDrugLicense}) is currently in the verification queue.`
          };
        }

        if (cleanLicenseNumber && kycLicense === cleanLicenseNumber) {
          return {
            isDuplicate: true,
            duplicateField: 'licenseNumber',
            reason: `An application for License No (${cleanLicenseNumber}) is currently under review.`
          };
        }
      }
    }

    return { isDuplicate: false };
  }
}
