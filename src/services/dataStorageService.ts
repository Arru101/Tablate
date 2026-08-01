import { rtdb } from '../config/firebase';
import { ref, set as setFirebaseData, onValue } from 'firebase/database';
import { Medicine, Pharmacy, KYCSubmission, LiveStockRequest, AuditLog } from '../types';

export class DataStorageService {
  /**
   * Saves a stock request to Firebase Realtime Database & Shared Storage
   */
  public async saveStockRequest(req: LiveStockRequest) {
    // 1. Local / Broadcast Storage
    try {
      const existingStr = localStorage.getItem('tablate_shared_requests_store') || '[]';
      const existing: LiveStockRequest[] = JSON.parse(existingStr);
      const filtered = existing.filter((r) => r.id !== req.id);
      const updated = [req, ...filtered].slice(0, 50);
      localStorage.setItem('tablate_shared_requests_store', JSON.stringify(updated));
    } catch (err) {}

    // 2. Firebase Realtime Database Sync across physical devices (Phone -> Laptop)
    try {
      const dbRef = ref(rtdb, `stock_requests/${req.id}`);
      await setFirebaseData(dbRef, req);
      console.log('[Firebase RTDB] Emergency Request synced across devices:', req.id);
    } catch (err) {
      console.warn('[Firebase RTDB] Storage notice (offline/mock):', err);
    }
  }

  /**
   * Permanently deletes a stock request from Firebase RTDB & Shared Storage
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
      console.log('[Firebase RTDB] Emergency Request deleted:', requestId);
    } catch (err) {}
  }

  /**
   * Permanently clears all stock requests from Firebase RTDB & Shared Storage
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
   * Listens to real-time changes on Firebase RTDB across physical devices (Phone <-> Laptop).
   * Returns an unsubscribe function to clean up the listener.
   */
  public subscribeToStockRequests(onUpdate: (requests: LiveStockRequest[]) => void): () => void {
    let unsubFirebase: (() => void) | null = null;
    let localPollInterval: ReturnType<typeof setInterval> | null = null;

    // B. localStorage polling — SAME-DEVICE fallback only (tabs/windows on same browser).
    //    This does NOT sync across physical devices (phone/laptop), only supplements Firebase.
    const startLocalPolling = () => {
      if (typeof window !== 'undefined' && !localPollInterval) {
        localPollInterval = setInterval(() => {
          try {
            const sharedStr = localStorage.getItem('tablate_shared_requests_store');
            if (sharedStr) {
              const parsed: LiveStockRequest[] = JSON.parse(sharedStr);
              if (parsed && parsed.length > 0) {
                onUpdate(parsed);
              }
            }
          } catch (err) {}
        }, 2000);
      }
    };

    // A. Firebase Realtime Database — the ONLY true cross-device sync mechanism.
    //    onValue fires immediately with current data AND on every subsequent change.
    try {
      const dbRef = ref(rtdb, 'stock_requests');
      const unsub = onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const reqList: LiveStockRequest[] = Object.values(val);
            reqList.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
            onUpdate(reqList);
          } else {
            // Firebase returned empty/null — no active requests
            onUpdate([]);
          }
        },
        (error) => {
          console.warn('[Firebase RTDB] Realtime listener error:', error);
          startLocalPolling();
        }
      );
      unsubFirebase = unsub;
    } catch (err) {
      console.warn('[Firebase RTDB] Could not start listener:', err);
      startLocalPolling();
    }

    // Return cleanup function
    return () => {
      if (unsubFirebase) unsubFirebase();
      if (localPollInterval) clearInterval(localPollInterval);
    };
  }

  /**
   * Saves a KYC submission to Firebase Realtime Database
   */
  public async saveKYCSubmission(kyc: KYCSubmission) {
    try {
      const dbRef = ref(rtdb, `kyc_submissions/${kyc.id}`);
      await setFirebaseData(dbRef, kyc);
      console.log('[Firebase RTDB] KYC Submission persisted:', kyc.id);
    } catch (err) {
      console.warn('[Firebase RTDB] Storage notice:', err);
    }
  }

  /**
   * Saves Audit Logs to Firebase
   */
  public async saveAuditLog(log: AuditLog) {
    try {
      const dbRef = ref(rtdb, `audit_logs/${log.id}`);
      await setFirebaseData(dbRef, log);
    } catch (err) {
      console.warn('[Firebase RTDB] Audit Log notice:', err);
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
