import { rtdb } from '../config/firebase';
import { ref, set as setFirebaseData, onValue } from 'firebase/database';
import { Medicine, Pharmacy, InventoryItem, KYCSubmission, LiveStockRequest, AuditLog } from '../types';

export interface PharmacistOnlineStatus {
  pharmacyId: string;
  pharmacyName: string;
  isOpenNow: boolean;
  updatedAt: number;
  address?: string;
  city?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export class DataStorageService {
  /**
   * 1. Saves/Updates a Pharmacy Store directly into Remote Database & Shared Storage
   */
  public async savePharmacyStore(pharmacy: Pharmacy) {
    // A. Local Storage Sync (For instant same-device cross-tab sync)
    try {
      const existingStr = localStorage.getItem('tablate_shared_pharmacies') || '[]';
      const existing: Pharmacy[] = JSON.parse(existingStr);
      const filtered = existing.filter((p) => p.id !== pharmacy.id);
      const updated = [pharmacy, ...filtered];
      localStorage.setItem('tablate_shared_pharmacies', JSON.stringify(updated));
    } catch (err) {}

    // B. Firebase RTDB Sync (For true cross-device sync)
    try {
      const dbRef = ref(rtdb, `pharmacies/${pharmacy.id}`);
      await setFirebaseData(dbRef, pharmacy);
      console.log('[Database Storage] Pharmacy store saved to DB:', pharmacy.id);
    } catch (err) {
      console.warn('[Database Storage] Save notice:', err);
    }
  }

  /**
   * Subscribes to Real-Time Pharmacy Directory changes from Remote Database & Local Fallback
   */
  public subscribeToPharmacies(onUpdate: (pharmacies: Pharmacy[]) => void): () => void {
    let unsubFirebase: (() => void) | null = null;
    let localInterval: ReturnType<typeof setInterval> | null = null;

    const pollLocal = () => {
      try {
        const raw = localStorage.getItem('tablate_shared_pharmacies');
        if (raw) {
          const list: Pharmacy[] = JSON.parse(raw);
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      } catch (e) {}
    };

    // Start local tab polling as immediate sync / fallback
    if (typeof window !== 'undefined') {
      pollLocal();
      localInterval = setInterval(pollLocal, 1500);
    }

    try {
      const dbRef = ref(rtdb, 'pharmacies');
      unsubFirebase = onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: Pharmacy[] = Object.values(val);
            // Save back to local storage to sync other tabs
            try {
              localStorage.setItem('tablate_shared_pharmacies', JSON.stringify(list));
            } catch (e) {}
            onUpdate(list);
          }
        },
        (err) => {
          console.warn('[Database Storage] Pharmacy listener warning:', err);
        }
      );
    } catch (err) {
      console.warn('[Database Storage] Could not listen to pharmacies:', err);
    }

    return () => {
      if (unsubFirebase) unsubFirebase();
      if (localInterval) clearInterval(localInterval);
    };
  }

  /**
   * 2. Saves an Inventory Item directly into Remote Database & Shared Storage
   */
  public async saveInventoryItem(item: InventoryItem) {
    try {
      const existingStr = localStorage.getItem('tablate_shared_inventory') || '[]';
      const existing: InventoryItem[] = JSON.parse(existingStr);
      const filtered = existing.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered];
      localStorage.setItem('tablate_shared_inventory', JSON.stringify(updated));
    } catch (err) {}

    try {
      const dbRef = ref(rtdb, `inventory/${item.id}`);
      await setFirebaseData(dbRef, item);
      console.log('[Database Storage] Inventory item saved to DB:', item.id);
    } catch (err) {
      console.warn('[Database Storage] Inventory notice:', err);
    }
  }

  /**
   * Subscribes to Real-Time Inventory changes from Remote Database & Local Fallback
   */
  public subscribeToInventory(onUpdate: (inventory: InventoryItem[]) => void): () => void {
    let unsubFirebase: (() => void) | null = null;
    let localInterval: ReturnType<typeof setInterval> | null = null;

    const pollLocal = () => {
      try {
        const raw = localStorage.getItem('tablate_shared_inventory');
        if (raw) {
          const list: InventoryItem[] = JSON.parse(raw);
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      pollLocal();
      localInterval = setInterval(pollLocal, 1500);
    }

    try {
      const dbRef = ref(rtdb, 'inventory');
      unsubFirebase = onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: InventoryItem[] = Object.values(val);
            try {
              localStorage.setItem('tablate_shared_inventory', JSON.stringify(list));
            } catch (e) {}
            onUpdate(list);
          }
        },
        (err) => console.warn('[Database Storage] Inventory listener warning:', err)
      );
    } catch (err) {}

    return () => {
      if (unsubFirebase) unsubFirebase();
      if (localInterval) clearInterval(localInterval);
    };
  }

  /**
   * 3. Saves an Emergency Stock Request directly into Remote Database & Shared Storage
   */
  public async saveStockRequest(req: LiveStockRequest) {
    try {
      const existingStr = localStorage.getItem('tablate_shared_requests_store') || '[]';
      const existing: LiveStockRequest[] = JSON.parse(existingStr);
      const filtered = existing.filter((r) => r.id !== req.id);
      const updated = [req, ...filtered].slice(0, 50);
      localStorage.setItem('tablate_shared_requests_store', JSON.stringify(updated));
    } catch (err) {}

    try {
      const dbRef = ref(rtdb, `stock_requests/${req.id}`);
      await setFirebaseData(dbRef, req);
      console.log('[Database Storage] Emergency Request saved to DB:', req.id);
    } catch (err) {
      console.warn('[Database Storage] Stock request notice:', err);
    }
  }

  /**
   * Permanently deletes a stock request from Remote Database & Shared Storage
   */
  public async deleteStockRequest(requestId: string) {
    try {
      const existingStr = localStorage.getItem('tablate_shared_requests_store') || '[]';
      const existing: LiveStockRequest[] = JSON.parse(existingStr);
      const filtered = existing.filter((r) => r.id !== requestId);
      localStorage.setItem('tablate_shared_requests_store', JSON.stringify(filtered));
    } catch (err) {}

    try {
      const dbRef = ref(rtdb, `stock_requests/${requestId}`);
      await setFirebaseData(dbRef, null);
    } catch (err) {}
  }

  /**
   * Permanently clears all stock requests from Remote Database & Shared Storage
   */
  public async clearAllStockRequests() {
    try {
      localStorage.setItem('tablate_shared_requests_store', '[]');
    } catch (err) {}

    try {
      const dbRef = ref(rtdb, 'stock_requests');
      await setFirebaseData(dbRef, null);
    } catch (err) {}
  }

  /**
   * Subscribes to Real-Time Emergency Stock Requests from Remote Database & Local Fallback
   */
  public subscribeToStockRequests(onUpdate: (requests: LiveStockRequest[]) => void): () => void {
    let unsubFirebase: (() => void) | null = null;
    let localInterval: ReturnType<typeof setInterval> | null = null;

    const pollLocal = () => {
      try {
        const raw = localStorage.getItem('tablate_shared_requests_store');
        if (raw) {
          const list: LiveStockRequest[] = JSON.parse(raw);
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      pollLocal();
      localInterval = setInterval(pollLocal, 1500);
    }

    try {
      const dbRef = ref(rtdb, 'stock_requests');
      unsubFirebase = onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const reqList: LiveStockRequest[] = Object.values(val);
            reqList.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
            try {
              localStorage.setItem('tablate_shared_requests_store', JSON.stringify(reqList));
            } catch (e) {}
            onUpdate(reqList);
          } else {
            onUpdate([]);
          }
        },
        (error) => console.warn('[Database Storage] Stock request listener error:', error)
      );
    } catch (err) {}

    return () => {
      if (unsubFirebase) unsubFirebase();
      if (localInterval) clearInterval(localInterval);
    };
  }

  /**
   * 4. Broadcasts Pharmacist Online/Offline Status to Remote Database & Shared Storage
   */
  public async savePharmacistOnlineStatus(status: PharmacistOnlineStatus) {
    try {
      const existingStr = localStorage.getItem('tablate_shared_pharmacist_status') || '[]';
      const existing: PharmacistOnlineStatus[] = JSON.parse(existingStr);
      const filtered = existing.filter((s) => s.pharmacyId !== status.pharmacyId);
      const updated = [status, ...filtered];
      localStorage.setItem('tablate_shared_pharmacist_status', JSON.stringify(updated));
    } catch (err) {}

    try {
      const dbRef = ref(rtdb, `pharmacist_status/${status.pharmacyId}`);
      await setFirebaseData(dbRef, status);
      console.log('[Database Storage] Pharmacist online status saved to DB:', status.pharmacyId, status.isOpenNow);
    } catch (err) {
      console.warn('[Database Storage] Pharmacist status save error:', err);
    }
  }

  /**
   * Subscribes to Pharmacist Online/Offline Statuses from Remote Database & Local Fallback
   */
  public subscribeToPharmacistStatus(
    onUpdate: (statuses: PharmacistOnlineStatus[]) => void
  ): () => void {
    let unsubFirebase: (() => void) | null = null;
    let localInterval: ReturnType<typeof setInterval> | null = null;

    const pollLocal = () => {
      try {
        const raw = localStorage.getItem('tablate_shared_pharmacist_status');
        if (raw) {
          const list: PharmacistOnlineStatus[] = JSON.parse(raw);
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      pollLocal();
      localInterval = setInterval(pollLocal, 1500);
    }

    try {
      const dbRef = ref(rtdb, 'pharmacist_status');
      unsubFirebase = onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const statuses: PharmacistOnlineStatus[] = Object.values(val);
            try {
              localStorage.setItem('tablate_shared_pharmacist_status', JSON.stringify(statuses));
            } catch (e) {}
            onUpdate(statuses);
          } else {
            onUpdate([]);
          }
        },
        (error) => console.warn('[Database Storage] Pharmacist status listener error:', error)
      );
    } catch (err) {}

    return () => {
      if (unsubFirebase) unsubFirebase();
      if (localInterval) clearInterval(localInterval);
    };
  }

  /**
   * 5. Saves a KYC Submission directly into Remote Database & Shared Storage
   */
  public async saveKYCSubmission(kyc: KYCSubmission) {
    try {
      const existingStr = localStorage.getItem('tablate_shared_kyc_queue') || '[]';
      const existing: KYCSubmission[] = JSON.parse(existingStr);
      const filtered = existing.filter((k) => k.id !== kyc.id);
      const updated = [kyc, ...filtered];
      localStorage.setItem('tablate_shared_kyc_queue', JSON.stringify(updated));
    } catch (err) {}

    try {
      const dbRef = ref(rtdb, `kyc_submissions/${kyc.id}`);
      await setFirebaseData(dbRef, kyc);
      console.log('[Database Storage] KYC Submission saved to DB:', kyc.id);
    } catch (err) {
      console.warn('[Database Storage] KYC notice:', err);
    }
  }

  /**
   * Subscribes to Real-Time KYC Submissions from Remote Database & Local Fallback
   */
  public subscribeToKYCQueue(onUpdate: (kycList: KYCSubmission[]) => void): () => void {
    let unsubFirebase: (() => void) | null = null;
    let localInterval: ReturnType<typeof setInterval> | null = null;

    const pollLocal = () => {
      try {
        const raw = localStorage.getItem('tablate_shared_kyc_queue');
        if (raw) {
          const list: KYCSubmission[] = JSON.parse(raw);
          if (list && list.length > 0) {
            onUpdate(list);
          }
        }
      } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      pollLocal();
      localInterval = setInterval(pollLocal, 1500);
    }

    try {
      const dbRef = ref(rtdb, 'kyc_submissions');
      unsubFirebase = onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: KYCSubmission[] = Object.values(val);
            try {
              localStorage.setItem('tablate_shared_kyc_queue', JSON.stringify(list));
            } catch (e) {}
            onUpdate(list);
          }
        },
        (err) => console.warn('[Database Storage] KYC queue listener warning:', err)
      );
    } catch (err) {}

    return () => {
      if (unsubFirebase) unsubFirebase();
      if (localInterval) clearInterval(localInterval);
    };
  }

  /**
   * 6. Saves Audit Log directly into Remote Database
   */
  public async saveAuditLog(log: AuditLog) {
    try {
      const dbRef = ref(rtdb, `audit_logs/${log.id}`);
      await setFirebaseData(dbRef, log);
    } catch (err) {
      console.warn('[Database Storage] Audit Log notice:', err);
    }
  }

  /**
   * Subscribes to Audit Logs from Remote Database
   */
  public subscribeToAuditLogs(onUpdate: (logs: AuditLog[]) => void): () => void {
    try {
      const dbRef = ref(rtdb, 'audit_logs');
      return onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: AuditLog[] = Object.values(val);
            list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            onUpdate(list);
          }
        },
        (err) => console.warn('[Database Storage] Audit log listener warning:', err)
      );
    } catch (err) {
      return () => {};
    }
  }

  /**
   * Exports full platform data snapshot as downloadable JSON file
   */
  public exportEssentialDataSnapshot(data: {
    medicines: Medicine[];
    pharmacies: Pharmacy[];
    kycQueue: KYCSubmission[];
    auditLogs: AuditLog[];
  }) {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `tablate_essential_data_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

export const dataStorageService = new DataStorageService();
