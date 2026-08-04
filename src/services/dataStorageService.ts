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
   * 1. Saves/Updates a Pharmacy Store directly into Remote Database
   */
  public async savePharmacyStore(pharmacy: Pharmacy) {
    try {
      const dbRef = ref(rtdb, `pharmacies/${pharmacy.id}`);
      await setFirebaseData(dbRef, pharmacy);
      console.log('[Database Storage] Pharmacy store saved to DB:', pharmacy.id);
    } catch (err) {
      console.warn('[Database Storage] Save notice:', err);
    }
  }

  /**
   * Subscribes to Real-Time Pharmacy Directory changes from Remote Database
   */
  public subscribeToPharmacies(onUpdate: (pharmacies: Pharmacy[]) => void): () => void {
    try {
      const dbRef = ref(rtdb, 'pharmacies');
      return onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: Pharmacy[] = Object.values(val);
            onUpdate(list);
          }
        },
        (err) => console.warn('[Database Storage] Pharmacy listener warning:', err)
      );
    } catch (err) {
      return () => {};
    }
  }

  /**
   * 2. Saves an Inventory Item directly into Remote Database
   */
  public async saveInventoryItem(item: InventoryItem) {
    try {
      const dbRef = ref(rtdb, `inventory/${item.id}`);
      await setFirebaseData(dbRef, item);
      console.log('[Database Storage] Inventory item saved to DB:', item.id);
    } catch (err) {
      console.warn('[Database Storage] Inventory notice:', err);
    }
  }

  /**
   * Subscribes to Real-Time Inventory changes from Remote Database
   */
  public subscribeToInventory(onUpdate: (inventory: InventoryItem[]) => void): () => void {
    try {
      const dbRef = ref(rtdb, 'inventory');
      return onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: InventoryItem[] = Object.values(val);
            onUpdate(list);
          }
        },
        (err) => console.warn('[Database Storage] Inventory listener warning:', err)
      );
    } catch (err) {
      return () => {};
    }
  }

  /**
   * 3. Saves an Emergency Stock Request directly into Remote Database
   */
  public async saveStockRequest(req: LiveStockRequest) {
    try {
      const dbRef = ref(rtdb, `stock_requests/${req.id}`);
      await setFirebaseData(dbRef, req);
      console.log('[Database Storage] Emergency Request saved to DB:', req.id);
    } catch (err) {
      console.warn('[Database Storage] Stock request notice:', err);
    }
  }

  /**
   * Permanently deletes a stock request from Remote Database
   */
  public async deleteStockRequest(requestId: string) {
    try {
      const dbRef = ref(rtdb, `stock_requests/${requestId}`);
      await setFirebaseData(dbRef, null);
      console.log('[Database Storage] Stock request deleted from DB:', requestId);
    } catch (err) {}
  }

  /**
   * Permanently clears all stock requests from Remote Database
   */
  public async clearAllStockRequests() {
    try {
      const dbRef = ref(rtdb, 'stock_requests');
      await setFirebaseData(dbRef, null);
    } catch (err) {}
  }

  /**
   * Subscribes to Real-Time Emergency Stock Requests from Remote Database
   */
  public subscribeToStockRequests(onUpdate: (requests: LiveStockRequest[]) => void): () => void {
    try {
      const dbRef = ref(rtdb, 'stock_requests');
      return onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const reqList: LiveStockRequest[] = Object.values(val);
            reqList.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
            onUpdate(reqList);
          } else {
            onUpdate([]);
          }
        },
        (error) => console.warn('[Database Storage] Stock request listener error:', error)
      );
    } catch (err) {
      return () => {};
    }
  }

  /**
   * 4. Broadcasts Pharmacist Online/Offline Status to Remote Database
   */
  public async savePharmacistOnlineStatus(status: PharmacistOnlineStatus) {
    try {
      const dbRef = ref(rtdb, `pharmacist_status/${status.pharmacyId}`);
      await setFirebaseData(dbRef, status);
      console.log('[Database Storage] Pharmacist online status saved to DB:', status.pharmacyId, status.isOpenNow);
    } catch (err) {
      console.warn('[Database Storage] Pharmacist status save error:', err);
    }
  }

  /**
   * Subscribes to Pharmacist Online/Offline Statuses from Remote Database
   */
  public subscribeToPharmacistStatus(
    onUpdate: (statuses: PharmacistOnlineStatus[]) => void
  ): () => void {
    try {
      const dbRef = ref(rtdb, 'pharmacist_status');
      return onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const statuses: PharmacistOnlineStatus[] = Object.values(val);
            onUpdate(statuses);
          } else {
            onUpdate([]);
          }
        },
        (error) => console.warn('[Database Storage] Pharmacist status listener error:', error)
      );
    } catch (err) {
      return () => {};
    }
  }

  /**
   * 5. Saves a KYC Submission directly into Remote Database
   */
  public async saveKYCSubmission(kyc: KYCSubmission) {
    try {
      const dbRef = ref(rtdb, `kyc_submissions/${kyc.id}`);
      await setFirebaseData(dbRef, kyc);
      console.log('[Database Storage] KYC Submission saved to DB:', kyc.id);
    } catch (err) {
      console.warn('[Database Storage] KYC notice:', err);
    }
  }

  /**
   * Subscribes to Real-Time KYC Submissions from Remote Database
   */
  public subscribeToKYCQueue(onUpdate: (kycList: KYCSubmission[]) => void): () => void {
    try {
      const dbRef = ref(rtdb, 'kyc_submissions');
      return onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: KYCSubmission[] = Object.values(val);
            onUpdate(list);
          }
        },
        (err) => console.warn('[Database Storage] KYC queue listener warning:', err)
      );
    } catch (err) {
      return () => {};
    }
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
