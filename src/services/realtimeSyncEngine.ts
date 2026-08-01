import { useAppStore } from '../store/useAppStore';
import { realtimeBroadcastService } from './realtimeBroadcastService';
import { dataStorageService } from './dataStorageService';

class RealtimeSyncEngine {
  private timerId: any = null;
  private isInitialized = false;

  public startSyncBus() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Initialize BroadcastChannel & LocalStorage Event Listeners (Multi-Tab / Multi-Window Sync)
    realtimeBroadcastService.initRealtimeSync(
      (newRequest) => {
        const store = useAppStore.getState();
        const exists = store.liveRequests.some((r) => r.id === newRequest.id);
        if (!exists) {
          useAppStore.setState({
            liveRequests: [newRequest, ...store.liveRequests]
          });
          store.showToast('info', `⚡ Real-time stock search: ${newRequest.medicineName}`);
        }
      },
      (requestId, response) => {
        const store = useAppStore.getState();
        useAppStore.setState({
          liveRequests: store.liveRequests.map((req) => {
            if (req.id === requestId) {
              const responses = req.responses || [];
              const alreadyResponded = responses.some((res) => res.pharmacyId === response.pharmacyId);
              if (!alreadyResponded) {
                return {
                  ...req,
                  status: response.available ? 'matched' : req.status,
                  responses: [response, ...responses]
                };
              }
            }
            return req;
          })
        });
        if (response.available) {
          store.showToast('success', `✅ Pharmacy "${response.pharmacyName}" confirmed medicine available!`);
        }
      },
      (pharmacyId, isOpenNow) => {
        const store = useAppStore.getState();
        useAppStore.setState({
          pharmacies: store.pharmacies.map((p) =>
            p.id === pharmacyId ? { ...p, isOpenNow } : p
          )
        });
      },
      () => {
        useAppStore.setState({ liveRequests: [] });
      }
    );

    // 2. Subscribe to Firebase Realtime Database — SINGLE SOURCE OF TRUTH for cross-device sync
    //    This is the ONLY mechanism that works across physical devices (Phone <-> Laptop).
    dataStorageService.subscribeToStockRequests((firebaseRequests) => {
      const store = useAppStore.getState();
      const dismissed = store.dismissedRequestIds || [];

      // Filter out requests dismissed/deleted by pharmacist
      const validRequests = (firebaseRequests || []).filter(
        (r) => !dismissed.includes(r.id)
      );

      // Sort newest first
      validRequests.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));

      // Detect genuinely new requests (not already in state) and show toast
      const currentIds = new Set(store.liveRequests.map((r) => r.id));
      const brandNewRequests = validRequests.filter((r) => !currentIds.has(r.id));
      if (brandNewRequests.length > 0) {
        brandNewRequests.forEach((req) => {
          store.showToast('info', `⚡ LIVE RADAR: Patient needs "${req.medicineName}" nearby!`);
        });
      }

      // Always update state from Firebase (authoritative source)
      useAppStore.setState({ liveRequests: validRequests });
    });

    // 3. Periodic Expiry Cleanup (Every 10s)
    this.timerId = setInterval(() => {
      const store = useAppStore.getState();
      store.cleanupExpiredRequests();
    }, 10000);
  }

  public stopSyncBus() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isInitialized = false;
  }
}

export const realtimeSyncEngine = new RealtimeSyncEngine();
