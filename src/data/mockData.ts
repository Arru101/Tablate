import { Medicine, Pharmacy, InventoryItem, KYCSubmission, AuditLog } from '../types';

// Clean initial production slate: Ready for live real-time entries
export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-master-1',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol',
    manufacturer: 'Micro Labs Ltd',
    strength: '650mg',
    form: 'tablet',
    rxRequired: false,
    scheduleClass: 'OTC',
    category: 'Analgesic & Antipyretic',
    mrp: 34.50,
    barcode: '8901234567890',
    description: 'Relieves fever and mild to moderate pain.',
    alternatives: [
      { brandName: 'Calpol 650', genericName: 'Paracetamol', manufacturer: 'GSK India', price: 32.00 }
    ]
  }
];

export const INITIAL_PHARMACIES: Pharmacy[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_KYC_QUEUE: KYCSubmission[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-init-1',
    timestamp: new Date().toLocaleString(),
    actor: 'CDSCO System Gateway',
    role: 'admin',
    action: 'SYSTEM_INITIALIZED',
    details: 'Tablate National Emergency Medicine Discovery Platform Initialized. Ready for live pharmacy registrations & real-time stock broadcasts.',
    ipAddress: '127.0.0.1',
    severity: 'info'
  }
];
