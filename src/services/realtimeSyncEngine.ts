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

    // 2. Subscribe to Firebase Realtime Database across physical devices (Phone <-> Laptop)
    dataStorageService.subscribeToStockRequests((firebaseRequests) => {
      if (!firebaseRequests || firebaseRequests.length === 0) return;
      const store = useAppStore.getState();
      
      // Merge unique incoming requests
      const mergedMap = new Map<string, any>();
      store.liveRequests.forEach((req) => mergedMap.set(req.id, req));
      firebaseRequests.forEach((req) => {
        if (!mergedMap.has(req.id)) {
          mergedMap.set(req.id, req);
        } else {
          // Merge responses
          const existing = mergedMap.get(req.id);
          const mergedResponses = [...(existing.responses || [])];
          (req.responses || []).forEach((resp: any) => {
            if (!mergedResponses.some((r) => r.pharmacyId === resp.pharmacyId)) {
              mergedResponses.push(resp);
            }
          });
          mergedMap.set(req.id, {
            ...existing,
            ...req,
            responses: mergedResponses
          });
        }
      });

      const updatedList = Array.from(mergedMap.values()).sort(
        (a, b) => b.timestampMs - a.timestampMs
      );
      useAppStore.setState({ liveRequests: updatedList });
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
