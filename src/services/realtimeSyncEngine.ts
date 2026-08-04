import { useAppStore } from '../store/useAppStore';
import { realtimeBroadcastService } from './realtimeBroadcastService';
import { dataStorageService } from './dataStorageService';

class RealtimeSyncEngine {
  private timerId: any = null;
  private isInitialized = false;

  public startSyncBus() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Initialize Multi-Tab BroadcastChannel
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

    // 2. Subscribe to Emergency Stock Requests from Remote Database
    dataStorageService.subscribeToStockRequests((firebaseRequests) => {
      const store = useAppStore.getState();
      const dismissed = store.dismissedRequestIds || [];
      const validRequests = (firebaseRequests || []).filter((r) => !dismissed.includes(r.id));
      validRequests.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));

      const currentIds = new Set(store.liveRequests.map((r) => r.id));
      const brandNewRequests = validRequests.filter((r) => !currentIds.has(r.id));
      if (brandNewRequests.length > 0) {
        brandNewRequests.forEach((req) => {
          store.showToast('info', `⚡ LIVE RADAR: Patient needs "${req.medicineName}" nearby!`);
        });
      }

      useAppStore.setState({ liveRequests: validRequests });
    });

    // 3. Subscribe to Remote Database Pharmacies Directory
    dataStorageService.subscribeToPharmacies((dbPharmacies) => {
      if (!dbPharmacies || dbPharmacies.length === 0) return;
      useAppStore.setState((state) => {
        const dbMap = new Map(dbPharmacies.map((p) => [p.id, p]));
        const merged = state.pharmacies.map((p) => dbMap.get(p.id) || p);
        const newFromDb = dbPharmacies.filter((p) => !state.pharmacies.some((existing) => existing.id === p.id));
        return { pharmacies: [...merged, ...newFromDb] };
      });
    });

    // 4. Subscribe to Remote Database Inventory Updates
    dataStorageService.subscribeToInventory((dbInventory) => {
      if (!dbInventory || dbInventory.length === 0) return;
      useAppStore.setState((state) => {
        const dbMap = new Map(dbInventory.map((i) => [i.id, i]));
        const merged = state.inventory.map((i) => dbMap.get(i.id) || i);
        const newFromDb = dbInventory.filter((i) => !state.inventory.some((existing) => existing.id === i.id));
        return { inventory: [...merged, ...newFromDb] };
      });
    });

    // 5. Subscribe to Remote Database KYC Applications
    dataStorageService.subscribeToKYCQueue((dbKYC) => {
      if (!dbKYC || dbKYC.length === 0) return;
      useAppStore.setState((state) => {
        const dbMap = new Map(dbKYC.map((k) => [k.id, k]));
        const merged = state.kycQueue.map((k) => dbMap.get(k.id) || k);
        const newFromDb = dbKYC.filter((k) => !state.kycQueue.some((existing) => existing.id === k.id));
        return { kycQueue: [...merged, ...newFromDb] };
      });
    });

    // 6. Subscribe to Pharmacist Online Statuses from Remote Database
    dataStorageService.subscribeToPharmacistStatus((statuses) => {
      if (!statuses || statuses.length === 0) return;
      useAppStore.setState((state) => {
        const existingIds = new Set(state.pharmacies.map((p) => p.id));
        const updatedPharmacies = state.pharmacies.map((p) => {
          const match = statuses.find((s) => s.pharmacyId === p.id);
          if (match) {
            return { ...p, isOpenNow: match.isOpenNow };
          }
          return p;
        });

        const newRemoteStores: typeof state.pharmacies = [];
        for (const s of statuses) {
          if (s.isOpenNow && !existingIds.has(s.pharmacyId)) {
            newRemoteStores.push({
              id: s.pharmacyId,
              name: s.pharmacyName,
              licenseNumber: 'MH-MUM-DL-LIVE',
              drugLicenseNo: '20B/21B-MH-LIVE',
              ownerName: 'Licensed Pharmacist',
              phone: s.phone || '+91 98000 99887',
              address: s.address || 'Central Pharmacy Arcade',
              city: s.city || 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              lat: s.lat || 19.0596,
              lng: s.lng || 72.8295,
              rating: 5.0,
              totalReviews: 1,
              isOpenNow: true,
              is24x7: true,
              timings: '24 Hours Open',
              verifiedBadge: true
            });
          }
        }

        return {
          pharmacies: [...updatedPharmacies, ...newRemoteStores]
        };
      });
    });

    // 7. Periodic Expiry Cleanup (Every 10s)
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
