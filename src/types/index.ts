export type UserRole = 'patient' | 'pharmacist' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  language: LanguageCode;
  createdAt: string;
}

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  strength: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'cream' | 'drops';
  rxRequired: boolean;
  scheduleClass: 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'OTC';
  category: string;
  mrp: number;
  alternatives: {
    brandName: string;
    genericName: string;
    manufacturer: string;
    price: number;
  }[];
  description: string;
  barcode?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  drugLicenseNo: string;
  ownerName: string;
  phone: string;
  altPhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  rating: number;
  totalReviews: number;
  isOpenNow: boolean;
  is24x7: boolean;
  timings: string;
  distanceKm?: number;
  etaMinutes?: number;
  verifiedBadge: boolean;
  image?: string;
  userId?: string;
  password?: string;
}

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  price: number;
  batchNumber: string;
  expiryDate: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

export interface LiveStockRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  medicineName: string;
  imageUrl?: string;
  lat: number;
  lng: number;
  radiusKm: number;
  requestedAt: string;
  timestampMs: number;
  expiresAtMs: number;
  isGenuineVerified: boolean;
  scheduleClass?: string;
  category?: string;
  status: 'searching' | 'matched' | 'expired' | 'fulfilled';
  responses: {
    pharmacyId: string;
    pharmacyName: string;
    available: boolean;
    availableQty?: number;
    price?: number;
    pharmacistComment?: string;
    alternativeOffered?: string;
    respondedAt: string;
    expiresAtMs?: number;
  }[];
}

export interface KYCSubmission {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  licenseNumber: string;
  drugLicenseNo: string;
  gstin?: string;
  ownerName: string;
  ownerAadhaar: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  gpsLat: number;
  gpsLng: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    drugLicenseUrl: string;
    licenseOwnerPhotoUrl: string;
    shopFrontPhotoUrl: string;
    ownerInsidePharmacyPhotoUrl: string;
    videoVerificationUrl: string;
  };
  adminComments?: string;
  rejectionReason?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SearchFilterState {
  radiusKm: number;
  nightOnly: boolean;
  rxOnly: boolean;
  sortBy: 'distance' | 'rating' | 'price';
  searchQuery: string;
}
