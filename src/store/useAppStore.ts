import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  UserRole, 
  LanguageCode, 
  Medicine, 
  Pharmacy, 
  InventoryItem, 
  LiveStockRequest, 
  KYCSubmission, 
  AuditLog, 
  SearchFilterState 
} from '../types';
import { 
  INITIAL_MEDICINES, 
  INITIAL_PHARMACIES, 
  INITIAL_INVENTORY, 
  INITIAL_KYC_QUEUE, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { dataStorageService } from '../services/dataStorageService';
import { realtimeBroadcastService } from '../services/realtimeBroadcastService';
import { resolveCityCoordinates, cacheUserLocation, getCachedUserLocation } from '../utils/geoUtils';
import { PharmacistDeduplicationService } from '../services/pharmacistDeduplicationService';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface AppState {
  // Theme & Language & Role
  currentRole: UserRole;
  language: LanguageCode;
  darkMode: boolean;
  
  // Security & Authentication States
  isAdminAuthenticated: boolean;
  isPharmacistRegistered: boolean;
  pharmacistStore: Pharmacy | null;

  // Geolocation
  userLocation: { lat: number; lng: number; addressName: string; isLiveGps: boolean };

  // Data Collections
  medicines: Medicine[];
  pharmacies: Pharmacy[];
  inventory: InventoryItem[];
  liveRequests: LiveStockRequest[];
  dismissedRequestIds: string[];
  kycQueue: KYCSubmission[];
  auditLogs: AuditLog[];
  directionTimers: Record<string, number>;
  
  // Search & Filtering
  filters: SearchFilterState;
  favorites: string[];
  recentSearches: string[];
  
  // UI State
  activeToast: Toast | null;
  selectedPharmacyForDetail: Pharmacy | null;
  selectedMedicineForDetail: Medicine | null;
  
  // Security Actions
  authenticateAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  registerPharmacistStore: (storeData: Partial<Pharmacy> & { password?: string; userId?: string }) => { userId: string; password: string } | null;
  loginPharmacist: (userIdOrLicense: string, password: string) => boolean;
  logoutPharmacist: () => void;
  togglePharmacyOnlineStatus: (pharmacyId: string) => void;

  // Genuine Request Filtering & Expiry Actions
  cleanupExpiredRequests: () => void;
  dismissLiveRequest: (requestId: string) => void;
  clearAllLiveRequests: () => void;

  // Pharmacist & Admin Store Address Update Actions
  updatePharmacyDetails: (pharmacyId: string, updatedData: Partial<Pharmacy>) => void;
  resetPharmacistPassword: (pharmacyId: string, newPassword: string) => void;
  deletePharmacyPermanently: (pharmacyId: string) => void;

  // Actions
  setRole: (role: UserRole) => void;
  setLanguage: (lang: LanguageCode) => void;
  toggleDarkMode: () => void;
  setUserLocation: (lat: number, lng: number, addressName: string, isLiveGps?: boolean) => void;
  detectLiveLocation: () => void;
  
  // Data Backup Action
  downloadDataBackup: () => void;

  // Search Actions
  setSearchQuery: (query: string) => void;
  setRadius: (radiusKm: number) => void;
  toggleNightOnly: () => void;
  toggleRxOnly: () => void;
  setSortBy: (sortBy: 'distance' | 'rating' | 'price') => void;
  addRecentSearch: (query: string) => void;
  toggleFavorite: (pharmacyId: string) => void;
  
  // Patient Actions
  createLiveStockRequest: (medicineName: string, imageUrl?: string) => void;
  reportInaccurateStock: (pharmacyId: string, medicineName: string, notes: string) => void;
  startDirectionTimer: (pharmacyId: string) => void;
  
  // Pharmacist Actions
  respondToLiveRequest: (requestId: string, pharmacyId: string, available: boolean, pharmacistComment?: string, alternativeOffered?: string) => void;
  updateInventoryQuantity: (inventoryId: string, newQty: number, status: 'in_stock' | 'low_stock' | 'out_of_stock') => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  submitKYCOnboarding: (kyc: Omit<KYCSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  
  // Admin Actions
  approveKYC: (kycId: string, adminComment?: string) => void;
  rejectKYC: (kycId: string, adminComment?: string) => void;
  togglePharmacyVerificationBadge: (pharmacyId: string) => void;
  addMedicineToCatalog: (med: Omit<Medicine, 'id'>) => void;
  
  // Toast & Modals
  showToast: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  clearToast: () => void;
  setSelectedPharmacyDetail: (pharmacy: Pharmacy | null) => void;
  setSelectedMedicineDetail: (medicine: Medicine | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: 'patient',
      language: 'en',
      darkMode: true,
      
      isAdminAuthenticated: false,
      isPharmacistRegistered: false,
      pharmacistStore: null,

      userLocation: {
        lat: 19.0596,
        lng: 72.8295,
        addressName: 'Bandra West, Mumbai',
        isLiveGps: false
      },

      medicines: INITIAL_MEDICINES,
      pharmacies: INITIAL_PHARMACIES,
      inventory: INITIAL_INVENTORY,

      liveRequests: [],
      kycQueue: INITIAL_KYC_QUEUE,
      auditLogs: INITIAL_AUDIT_LOGS,
      directionTimers: {},
      dismissedRequestIds: (() => {
        try {
          return JSON.parse(localStorage.getItem('tablate_dismissed_request_ids') || '[]');
        } catch (e) {
          return [];
        }
      })(),

      filters: {
        radiusKm: 3,
        nightOnly: false,
        rxOnly: false,
        sortBy: 'distance',
        searchQuery: ''
      },

      favorites: ['pharm-1', 'pharm-4'],
      recentSearches: [],

      activeToast: null,
      selectedPharmacyForDetail: null,
      selectedMedicineForDetail: null,

      startDirectionTimer: (pharmacyId: string) => {
        const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
        set((state) => ({
          directionTimers: {
            ...state.directionTimers,
            [pharmacyId]: expiresAt
          }
        }));
        get().showToast(
          'info',
          '⏱ 30-Minute Navigation Active! Reservation timer started (card auto-removes in 30 mins).'
        );
      },

      // Automatic Cleanup of Expired & Unwanted Requests (>15 mins)
      cleanupExpiredRequests: () => {
        const now = Date.now();
        set((state) => ({
          liveRequests: state.liveRequests.filter(
            (req) => req.expiresAtMs > now && req.status !== 'expired'
          )
        }));
      },

      // Pharmacist Permanent Deletion / Dismissal of Request
      dismissLiveRequest: (requestId: string) => {
        set((state) => {
          const updatedDismissed = [...new Set([...(state.dismissedRequestIds || []), requestId])];
          try {
            localStorage.setItem('tablate_dismissed_request_ids', JSON.stringify(updatedDismissed));
          } catch (e) {}
          return {
            liveRequests: state.liveRequests.filter((req) => req.id !== requestId),
            dismissedRequestIds: updatedDismissed
          };
        });

        dataStorageService.deleteStockRequest(requestId);
        get().showToast('info', 'Medicine request permanently deleted from radar.');
      },

      clearAllLiveRequests: () => {
        const allIds = get().liveRequests.map((r) => r.id);
        set((state) => {
          const updatedDismissed = [...new Set([...(state.dismissedRequestIds || []), ...allIds])];
          try {
            localStorage.setItem('tablate_dismissed_request_ids', JSON.stringify(updatedDismissed));
          } catch (e) {}
          return {
            liveRequests: [],
            dismissedRequestIds: updatedDismissed
          };
        });

        dataStorageService.clearAllStockRequests();
        get().showToast('info', 'All emergency requests cleared from radar.');
      },

      // Pharmacist & Admin Address Update
      updatePharmacyDetails: (pharmacyId: string, updatedData: Partial<Pharmacy>) => {
        const targetPharm = get().pharmacies.find((p) => p.id === pharmacyId);
        if (!targetPharm) {
          get().showToast('error', 'Pharmacy store not found.');
          return;
        }

        const newCity = updatedData.city || targetPharm.city;
        const newAddress = updatedData.address || targetPharm.address;
        const coords = resolveCityCoordinates(newCity, newAddress, updatedData.state || targetPharm.state);

        const mergedData: Pharmacy = {
          ...targetPharm,
          ...updatedData,
          lat: updatedData.lat ?? coords.lat,
          lng: updatedData.lng ?? coords.lng
        };

        set((state) => {
          const updatedPharmacies = state.pharmacies.map((p) =>
            p.id === pharmacyId ? mergedData : p
          );

          const updatedCurrentStore = state.pharmacistStore?.id === pharmacyId
            ? mergedData
            : state.pharmacistStore;

          const auditLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            actor: state.currentRole === 'admin' ? 'CDSCO Admin Desk' : `Pharmacist: ${mergedData.name}`,
            role: state.currentRole,
            action: 'PHARMACY_MAP_ADDRESS_UPDATED',
            details: `Updated store address on map for ${mergedData.name}. New Address: ${newAddress}, ${newCity} (Lat: ${mergedData.lat}, Lng: ${mergedData.lng})`,
            ipAddress: '127.0.0.1',
            severity: 'info'
          };

          return {
            pharmacies: updatedPharmacies,
            pharmacistStore: updatedCurrentStore,
            auditLogs: [auditLog, ...state.auditLogs]
          };
        });

        get().showToast(
          'success',
          `Map pin & store address for "${mergedData.name}" updated to "${newAddress}, ${newCity}" in real time!`
        );
      },

      // Admin Permanent Deletion of Pharmacy
      deletePharmacyPermanently: (pharmacyId: string) => {
        const targetPharm = get().pharmacies.find((p) => p.id === pharmacyId);
        const storeName = targetPharm?.name || 'Pharmacy Store';

        set((state) => {
          const isCurrentActiveStore = state.pharmacistStore?.id === pharmacyId;

          const auditLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            actor: 'CDSCO Admin Desk',
            role: 'admin',
            action: 'PHARMACY_PERMANENTLY_REVOKED',
            details: `Admin permanently revoked drug license & deleted store: ${storeName} (ID: ${pharmacyId})`,
            ipAddress: '10.0.0.1',
            severity: 'critical'
          };

          return {
            pharmacies: state.pharmacies.filter((p) => p.id !== pharmacyId),
            inventory: state.inventory.filter((inv) => inv.pharmacyId !== pharmacyId),
            kycQueue: state.kycQueue.filter((k) => k.pharmacyId !== pharmacyId),
            isPharmacistRegistered: isCurrentActiveStore ? false : state.isPharmacistRegistered,
            pharmacistStore: isCurrentActiveStore ? null : state.pharmacistStore,
            auditLogs: [auditLog, ...state.auditLogs]
          };
        });

        get().showToast('error', `Store "${storeName}" has been permanently revoked & removed from platform by Admin.`);
      },

      // Admin Password Reset for Pharmacist
      resetPharmacistPassword: (pharmacyId: string, newPassword: string) => {
        const targetPharm = get().pharmacies.find((p) => p.id === pharmacyId);
        if (!targetPharm) {
          get().showToast('error', 'Pharmacy store not found.');
          return;
        }

        set((state) => {
          const updatedPharmacies = state.pharmacies.map((p) =>
            p.id === pharmacyId ? { ...p, password: newPassword } : p
          );

          const updatedCurrentStore = state.pharmacistStore?.id === pharmacyId
            ? { ...state.pharmacistStore, password: newPassword }
            : state.pharmacistStore;

          const auditLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            actor: 'CDSCO Admin Desk',
            role: 'admin',
            action: 'PHARMACIST_PASSWORD_RESET',
            details: `Admin changed password for store ${targetPharm.name} (User ID: ${targetPharm.userId || targetPharm.id})`,
            ipAddress: '10.0.0.1',
            severity: 'warning'
          };

          return {
            pharmacies: updatedPharmacies,
            pharmacistStore: updatedCurrentStore,
            auditLogs: [auditLog, ...state.auditLogs]
          };
        });

        get().showToast('success', `Password for ${targetPharm.name} successfully updated by Admin!`);
      },

      // Online/Offline Store Toggle with Real-Time Multi-Device Sync
      togglePharmacyOnlineStatus: (pharmacyId: string) => {
        let isNowOnline = false;
        set((state) => {
          const updatedPharmacies = state.pharmacies.map((p) => {
            if (p.id === pharmacyId) {
              isNowOnline = !p.isOpenNow;
              return { ...p, isOpenNow: isNowOnline };
            }
            return p;
          });
          
          const currentStore = state.pharmacistStore?.id === pharmacyId
            ? { ...state.pharmacistStore, isOpenNow: isNowOnline }
            : state.pharmacistStore;

          return {
            pharmacies: updatedPharmacies,
            pharmacistStore: currentStore
          };
        });

        realtimeBroadcastService.broadcastStoreStatus(pharmacyId, isNowOnline);

        get().showToast(
          isNowOnline ? 'success' : 'warning',
          `Store Status Updated: Pharmacy is now ${isNowOnline ? 'ONLINE (Receiving Radar Pings)' : 'OFFLINE (Store Closed)'}`
        );
      },

      // Admin Auth Logic
      authenticateAdmin: (password: string) => {
        if (password === '976849020Aa#1') {
          set({ isAdminAuthenticated: true });
          get().showToast('success', 'Admin Command Desk Authenticated Successfully!');
          return true;
        } else {
          get().showToast('error', 'Invalid Admin Security Password. Access Denied.');
          return false;
        }
      },

      logoutAdmin: () => {
        set({ isAdminAuthenticated: false });
        get().showToast('info', 'Admin logged out.');
      },

      // Pharmacist Login
      loginPharmacist: (userIdOrLicenseInput: string, passwordInput: string) => {
        const cleanId = userIdOrLicenseInput.trim().toLowerCase();
        const cleanPass = passwordInput.trim();

        if (!cleanId || !cleanPass) {
          get().showToast('warning', 'Please enter both User ID / Drug License Number and Password.');
          return false;
        }

        let store = get().pharmacies.find((p) => {
          const matchUser = p.userId ? p.userId.trim().toLowerCase() === cleanId : false;
          const matchDrugLic = p.drugLicenseNo ? p.drugLicenseNo.trim().toLowerCase() === cleanId : false;
          const matchLic = p.licenseNumber ? p.licenseNumber.trim().toLowerCase() === cleanId : false;
          const matchPhone = p.phone ? p.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') : false;
          
          const matchPass = p.password ? p.password.trim() === cleanPass : false;
          return (matchUser || matchDrugLic || matchLic || matchPhone) && matchPass;
        });

        if (!store) {
          const kycMatch = get().kycQueue.find(
            (k) =>
              (k.pharmacyId && k.pharmacyId.trim().toLowerCase() === cleanId) ||
              (k.drugLicenseNo && k.drugLicenseNo.trim().toLowerCase() === cleanId) ||
              (k.licenseNumber && k.licenseNumber.trim().toLowerCase() === cleanId)
          );

          if (kycMatch) {
            const targetCity = kycMatch.city || 'Mumbai';
            const coords = resolveCityCoordinates(targetCity, kycMatch.address, kycMatch.state);
            store = {
              id: kycMatch.pharmacyId,
              userId: cleanId.startsWith('pharm-') ? cleanId : `PHARM-${kycMatch.pharmacyId.slice(-4)}`,
              password: cleanPass,
              name: kycMatch.pharmacyName,
              licenseNumber: kycMatch.licenseNumber,
              drugLicenseNo: kycMatch.drugLicenseNo,
              ownerName: kycMatch.ownerName,
              phone: kycMatch.phone || '+91 98000 99887',
              address: kycMatch.address,
              city: targetCity,
              state: kycMatch.state || 'Maharashtra',
              pincode: kycMatch.pincode || '400001',
              lat: kycMatch.gpsLat || coords.lat,
              lng: kycMatch.gpsLng || coords.lng,
              rating: 5.0,
              totalReviews: 1,
              isOpenNow: true,
              is24x7: true,
              timings: '24 Hours Open',
              verifiedBadge: kycMatch.status === 'approved'
            };

            set((state) => ({
              pharmacies: [store!, ...state.pharmacies.filter((p) => p.id !== store!.id)]
            }));
          }
        }

        if (store) {
          // Check if kycQueue has an approved application for this store
          const hasApprovedKyc = get().kycQueue.some(
            (k) =>
              k.status === 'approved' &&
              (k.pharmacyId === store!.id ||
                (k.drugLicenseNo && store!.drugLicenseNo && k.drugLicenseNo.trim().toUpperCase() === store!.drugLicenseNo.trim().toUpperCase()) ||
                (k.ownerName && store!.ownerName && k.ownerName.trim().toLowerCase() === store!.ownerName.trim().toLowerCase()))
          );

          const updatedStore: Pharmacy = {
            ...store,
            verifiedBadge: store.verifiedBadge || hasApprovedKyc
          };

          set((state) => ({
            isPharmacistRegistered: true,
            pharmacistStore: updatedStore,
            pharmacies: state.pharmacies.map((p) => (p.id === updatedStore.id ? updatedStore : p))
          }));

          get().showToast('success', `Sign-In Successful! Welcome back, ${updatedStore.name}.`);
          return true;
        } else {
          get().showToast('error', `Login Failed: Incorrect User ID or Password.`);
          return false;
        }
      },

      // Pharmacist Registration
      registerPharmacistStore: (storeData) => {
        const cleanUserId = (storeData.userId || '').trim();
        const cleanPass = (storeData.password || '').trim();
        const cleanLic = (storeData.drugLicenseNo || '').trim().toLowerCase();
        const cleanPhone = (storeData.phone || '').replace(/\s+/g, '');

        if (!cleanUserId || !cleanPass) {
          get().showToast('warning', 'Please choose a Pharmacist User ID and Password.');
          return null;
        }

        const existingUserId = get().pharmacies.find(
          (p) => p.userId && p.userId.trim().toLowerCase() === cleanUserId.toLowerCase()
        );

        if (existingUserId) {
          get().showToast(
            'error',
            `Registration Blocked: User ID "${cleanUserId}" is already taken. Please choose a different User ID.`
          );
          return null;
        }

        const existingPharm = get().pharmacies.find((p) => {
          const matchLic = p.drugLicenseNo && p.drugLicenseNo.trim().toLowerCase() === cleanLic;
          const matchPhone = p.phone && p.phone.replace(/\s+/g, '') === cleanPhone;
          return matchLic || matchPhone;
        });

        const existingKYC = get().kycQueue.find((k) => {
          return k.drugLicenseNo && k.drugLicenseNo.trim().toLowerCase() === cleanLic;
        });

        if (existingPharm || existingKYC) {
          const matchedName = existingPharm?.name || existingKYC?.pharmacyName || 'A store';
          get().showToast(
            'error',
            `Duplicate Blocked: Store "${matchedName}" with Drug License "${storeData.drugLicenseNo}" is already registered. Please Sign In.`
          );
          return null;
        }

        const cityGiven = storeData.city || 'Mumbai';
        const coords = resolveCityCoordinates(cityGiven, storeData.address, storeData.state);

        const newStore: Pharmacy = {
          id: `pharm-reg-${Date.now()}`,
          userId: cleanUserId,
          password: cleanPass,
          name: storeData.name || 'Registered Licensed Pharmacy',
          licenseNumber: storeData.licenseNumber || 'MH-MUM-DL-2026-REG',
          drugLicenseNo: storeData.drugLicenseNo || '20B/21B-MH-REG-99',
          ownerName: storeData.ownerName || 'Licensed Pharmacist',
          phone: storeData.phone || '+91 98000 99887',
          address: storeData.address || 'Central Pharmacy Arcade',
          city: cityGiven,
          state: storeData.state || 'Maharashtra',
          pincode: storeData.pincode || '400001',
          lat: coords.lat,
          lng: coords.lng,
          rating: 5.0,
          totalReviews: 1,
          isOpenNow: true,
          is24x7: true,
          timings: '24 Hours Open',
          verifiedBadge: false
        };

        set((state) => ({
          pharmacies: [newStore, ...state.pharmacies.filter((p) => p.id !== newStore.id)]
        }));

        get().showToast('success', `Pharmacist Account Created! Please Sign In with your User ID: "${cleanUserId}"`);
        return { userId: cleanUserId, password: cleanPass };
      },

      logoutPharmacist: () => {
        set({ isPharmacistRegistered: false, pharmacistStore: null });
        get().showToast('info', 'Pharmacist Store Logged Out.');
      },

      // Data Backup Download
      downloadDataBackup: () => {
        dataStorageService.exportEssentialDataSnapshot({
          medicines: get().medicines,
          pharmacies: get().pharmacies,
          kycQueue: get().kycQueue,
          auditLogs: get().auditLogs
        });
        get().showToast('success', 'Essential Data Snapshot exported as JSON!');
      },

      // Automatic High-Accuracy Geolocation & Reverse Geocoding Engine
      detectLiveLocation: () => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          const cached = getCachedUserLocation();
          if (cached && !get().userLocation.isLiveGps) {
            set({
              userLocation: {
                lat: cached.lat,
                lng: cached.lng,
                addressName: cached.addressName,
                isLiveGps: true
              }
            });
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              let addressName = `Live GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
                );
                if (res.ok) {
                  const data = await res.json();
                  const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || data.address?.road || '';
                  const city = data.address?.city || data.address?.town || data.address?.state_district || 'Mumbai';
                  addressName = suburb ? `${suburb}, ${city}` : city;
                }
              } catch (e) {}

              set({
                userLocation: {
                  lat,
                  lng,
                  addressName,
                  isLiveGps: true
                }
              });

              cacheUserLocation(lat, lng, addressName);
              get().showToast('success', `📍 Live Location Acquired: ${addressName}`);
            },
            async () => {
              try {
                const ipRes = await fetch('https://ipapi.co/json/');
                if (ipRes.ok) {
                  const ipData = await ipRes.json();
                  if (ipData.latitude && ipData.longitude) {
                    const lat = ipData.latitude;
                    const lng = ipData.longitude;
                    const addressName = `${ipData.city || 'Mumbai'}, ${ipData.region || 'Maharashtra'}`;

                    set({
                      userLocation: {
                        lat,
                        lng,
                        addressName,
                        isLiveGps: true
                      }
                    });

                    cacheUserLocation(lat, lng, addressName);
                    get().showToast('info', `📍 Location Auto-Fetched (IP Geolocation): ${addressName}`);
                    return;
                  }
                }
              } catch (e) {}

              get().showToast('warning', 'GPS Access Permission Denied. Using City Location.');
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
          );
        }
      },

      // Actions
      setRole: (role) => set({ currentRole: role }),
      setLanguage: (language) => set({ language }),
      toggleDarkMode: () => {
        const next = !get().darkMode;
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ darkMode: next });
      },
      setUserLocation: (lat, lng, addressName, isLiveGps = false) => set({ userLocation: { lat, lng, addressName, isLiveGps } }),

      // Search Actions
      setSearchQuery: (query) => set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
      setRadius: (radiusKm) => set((state) => ({ filters: { ...state.filters, radiusKm } })),
      toggleNightOnly: () => set((state) => ({ filters: { ...state.filters, nightOnly: !state.filters.nightOnly } })),
      toggleRxOnly: () => set((state) => ({ filters: { ...state.filters, rxOnly: !state.filters.rxOnly } })),
      setSortBy: (sortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        set((state) => {
          const filtered = state.recentSearches.filter((q) => q.toLowerCase() !== query.toLowerCase());
          return { recentSearches: [query, ...filtered].slice(0, 8) };
        });
      },

      toggleFavorite: (pharmacyId) => {
        set((state) => {
          const exists = state.favorites.includes(pharmacyId);
          const updated = exists ? state.favorites.filter((id) => id !== pharmacyId) : [...state.favorites, pharmacyId];
          return { favorites: updated };
        });
      },

      // Patient Actions with REAL-TIME CROSS-DEVICE BROADCAST
      createLiveStockRequest: (medicineNameInput: string, imageUrl?: string) => {
        const cleanName = medicineNameInput.trim() || 'Prescription Image Request';
        const now = Date.now();
        const expiresAt = now + 15 * 60 * 1000;

        const matchedMed = get().medicines.find(
          (m) =>
            m.brandName.toLowerCase() === cleanName.toLowerCase() ||
            m.genericName.toLowerCase().includes(cleanName.toLowerCase())
        );

        const loc = get().userLocation;
        const newReq: LiveStockRequest = {
          id: `req-${now}`,
          patientId: 'pat-current',
          patientName: 'Genuine Patient User',
          patientPhone: '+91 99887 76655',
          medicineName: matchedMed ? matchedMed.brandName : cleanName,
          imageUrl: imageUrl,
          lat: loc.lat,
          lng: loc.lng,
          radiusKm: get().filters.radiusKm,
          requestedAt: 'Just now',
          timestampMs: now,
          expiresAtMs: expiresAt,
          isGenuineVerified: true,
          scheduleClass: matchedMed ? matchedMed.scheduleClass : 'Rx Prescription',
          category: matchedMed ? matchedMed.category : 'General Therapeutics',
          status: 'searching',
          responses: []
        };

        set((state) => ({
          liveRequests: [newReq, ...state.liveRequests.filter((r) => r.id !== newReq.id)]
        }));
        
        // Broadcast across all connected device windows, tabs & physical devices (Firebase RTDB + Shared Storage)!
        realtimeBroadcastService.broadcastNewRequest(newReq);
        dataStorageService.saveStockRequest(newReq);

        get().showToast(
          'info',
          imageUrl 
            ? `📷 Prescription Image Request broadcasted live to all online pharmacists!`
            : `Genuine request for "${cleanName}" broadcasted live to all online pharmacists!`
        );
      },

      reportInaccurateStock: (pharmacyId, medicineName, notes) => {
        const log: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          actor: 'Patient User',
          role: 'patient',
          action: 'STOCK_ACCURACY_REPORT',
          details: `Reported inaccurate stock for ${medicineName}. Notes: ${notes}`,
          ipAddress: '127.0.0.1',
          severity: 'warning'
        };

        set((state) => ({
          auditLogs: [log, ...state.auditLogs]
        }));

        dataStorageService.saveAuditLog(log);
        get().showToast('warning', `Report logged for audit desk: ${medicineName} at pharmacy #${pharmacyId}. Thank you for verifying.`);
      },

      // Pharmacist Actions with REAL-TIME CROSS-DEVICE BROADCAST
      respondToLiveRequest: (requestId, pharmacyIdInput, available, pharmacistComment, alternativeOffered) => {
        const activeStore = get().pharmacistStore;
        const pharmacy = (activeStore && (activeStore.id === pharmacyIdInput || get().isPharmacistRegistered))
          ? activeStore
          : get().pharmacies.find((p) => p.id === pharmacyIdInput) || activeStore || get().pharmacies[0];

        const pharmacyId = pharmacy?.id || pharmacyIdInput;
        const storeName = pharmacy?.name || 'Local Pharmacy';
        const now = Date.now();
        const responseExpiresAt = now + 30 * 60 * 1000; // 30 minutes timer starts when pharmacist hits Available!

        const newResponse = {
          pharmacyId,
          pharmacyName: storeName,
          available,
          pharmacistComment: pharmacistComment || (available ? 'In Stock — Ready for physical pickup.' : 'Out of stock at this moment.'),
          alternativeOffered,
          respondedAt: new Date().toLocaleTimeString(),
          expiresAtMs: responseExpiresAt
        };

        set((state) => {
          const targetReq = state.liveRequests.find((r) => r.id === requestId);
          const targetMedName = targetReq?.medicineName || 'Requested Medicine';

          let matchedMed: Medicine | undefined = state.medicines.find(
            (m) =>
              m.brandName.toLowerCase() === targetMedName.toLowerCase() ||
              m.genericName.toLowerCase() === targetMedName.toLowerCase()
          );

          if (!matchedMed) {
            matchedMed = {
              id: `med-${Date.now()}`,
              brandName: targetMedName,
              genericName: targetMedName,
              manufacturer: 'CDSCO Verified Labs',
              strength: 'Standard',
              form: 'tablet',
              rxRequired: false,
              scheduleClass: 'OTC',
              category: 'Emergency Supply',
              mrp: 50.00,
              description: 'Emergency supply verified by licensed pharmacist.',
              alternatives: []
            };
          }

          const activeMedicine: Medicine = matchedMed;

          const existingInv = state.inventory.find(
            (i) =>
              i.pharmacyId === pharmacyId &&
              (i.medicine?.brandName.toLowerCase() === targetMedName.toLowerCase() ||
                i.medicine?.genericName.toLowerCase() === targetMedName.toLowerCase())
          );

          let updatedInventory = state.inventory;
          if (existingInv) {
            updatedInventory = state.inventory.map((i) =>
              i.id === existingInv.id
                ? {
                    ...i,
                    status: available ? ('in_stock' as const) : ('out_of_stock' as const),
                    quantity: available ? 25 : 0,
                    lastUpdated: 'Just now (Live Pharmacist Confirmed)'
                  }
                : i
            );
          } else if (available) {
            const newInvItem: InventoryItem = {
              id: `inv-live-${Date.now()}`,
              pharmacyId,
              medicineId: activeMedicine.id,
              medicine: activeMedicine,
              batchNumber: 'BT-EMERGENCY-2026',
              expiryDate: '2028-12-31',
              quantity: 30,
              price: activeMedicine.mrp,
              status: 'in_stock',
              lastUpdated: 'Just now (Live Pharmacist Confirmed)'
            };
            updatedInventory = [newInvItem, ...state.inventory];
          }

          const updatedRequests = state.liveRequests.map((req) => {
            if (req.id === requestId) {
              const newResponses = [
                ...req.responses.filter((r) => r.pharmacyId !== pharmacyId),
                newResponse
              ];
              const updatedReq = {
                ...req,
                status: (available ? 'matched' : req.status) as any,
                responses: newResponses
              };
              dataStorageService.saveStockRequest(updatedReq);
              return updatedReq;
            }
            return req;
          });

          // Ensure store registration address is directly bound across pharmacies
          const updatedPharmacies = state.pharmacies.map((p) => {
            if (p.id === pharmacyId && pharmacy) {
              return {
                ...p,
                address: pharmacy.address || p.address,
                city: pharmacy.city || p.city,
                state: pharmacy.state || p.state,
                pincode: pharmacy.pincode || p.pincode,
                phone: pharmacy.phone || p.phone,
                lat: pharmacy.lat || p.lat,
                lng: pharmacy.lng || p.lng
              };
            }
            return p;
          });
          const hasPharm = updatedPharmacies.some((p) => p.id === pharmacyId);
          const finalPharmaciesList = hasPharm
            ? updatedPharmacies
            : pharmacy ? [pharmacy, ...updatedPharmacies] : updatedPharmacies;

          return {
            liveRequests: updatedRequests,
            inventory: updatedInventory,
            pharmacies: finalPharmaciesList,
            directionTimers: available
              ? { ...state.directionTimers, [pharmacyId]: responseExpiresAt }
              : state.directionTimers,
            medicines: state.medicines.some((m) => m.id === activeMedicine.id)
              ? state.medicines
              : [activeMedicine, ...state.medicines]
          };
        });

        // Broadcast response to all connected patient devices/tabs!
        realtimeBroadcastService.broadcastPharmacistResponse(requestId, newResponse);

        get().showToast(
          available ? 'success' : 'warning',
          `⚡ Live Update: ${storeName} ${available ? 'CONFIRMED IN STOCK (APPROVED)' : 'MARKED UNAVAILABLE (DECLINED)'}. Note: "${pharmacistComment || (available ? 'Available' : 'Out of stock')}"`
        );
      },

      updateInventoryQuantity: (inventoryId, newQty, status) => {
        set((state) => ({
          inventory: state.inventory.map((item) => {
            if (item.id === inventoryId) {
              return {
                ...item,
                quantity: newQty,
                status,
                lastUpdated: 'Just now'
              };
            }
            return item;
          })
        }));
        get().showToast('success', 'Stock inventory successfully updated & saved!');
      },

      addInventoryItem: (item) => {
        const newInv: InventoryItem = {
          ...item,
          id: `inv-${Date.now()}`,
          lastUpdated: 'Just now'
        };
        set((state) => ({ inventory: [newInv, ...state.inventory] }));
        get().showToast('success', `${item.medicine.brandName} added to store inventory.`);
      },

      submitKYCOnboarding: (kyc) => {
        // Enforce strict 5-vector deduplication check
        const dupCheck = PharmacistDeduplicationService.checkDuplicate(
          {
            aadhaar: kyc.ownerAadhaar,
            drugLicenseNo: kyc.drugLicenseNo,
            licenseNumber: kyc.licenseNumber
          },
          get().pharmacies,
          get().kycQueue
        );

        if (dupCheck.isDuplicate) {
          get().showToast('error', `🚫 Duplicate Registration Blocked: ${dupCheck.reason}`);
          return;
        }

        const targetCity = kyc.city || 'Mumbai';
        const coords = resolveCityCoordinates(targetCity, kyc.address, kyc.state);
        const newKYC: KYCSubmission = {
          ...kyc,
          id: `kyc-${Date.now()}`,
          gpsLat: kyc.gpsLat || coords.lat,
          gpsLng: kyc.gpsLng || coords.lng,
          submittedAt: new Date().toLocaleString(),
          status: 'pending',
          adminComments: 'Submitted and queued for CDSCO State Licensing Officer inspection.'
        };
        set((state) => ({ kycQueue: [newKYC, ...state.kycQueue] }));
        
        dataStorageService.saveKYCSubmission(newKYC);
        get().showToast('success', 'Full 5-Document KYC application submitted! Aadhaar & Drug License verified unique.');
      },

      // Admin Actions
      approveKYC: (kycId, adminComment = 'Approved: Form 20B/21B verified with CDSCO state portal.') => {
        set((state) => {
          const kyc = state.kycQueue.find((k) => k.id === kycId);
          if (!kyc) return state;

          const cleanLicense = kyc.drugLicenseNo ? kyc.drugLicenseNo.trim().toUpperCase() : '';

          // Look for existing registered pharmacy store
          const existingPharm = state.pharmacies.find(
            (p) =>
              p.id === kyc.pharmacyId ||
              (p.drugLicenseNo && p.drugLicenseNo.trim().toUpperCase() === cleanLicense) ||
              (p.licenseNumber && p.licenseNumber.trim().toUpperCase() === kyc.licenseNumber.trim().toUpperCase())
          );

          let updatedPharmacy: Pharmacy;

          if (existingPharm) {
            // PRESERVE EXISTING USER CREATED CREDENTIALS & STORE LOCATION DETAILS!
            updatedPharmacy = {
              ...existingPharm,
              name: kyc.pharmacyName,
              licenseNumber: kyc.licenseNumber || existingPharm.licenseNumber,
              drugLicenseNo: kyc.drugLicenseNo || existingPharm.drugLicenseNo,
              ownerName: kyc.ownerName || existingPharm.ownerName,
              address: kyc.address || existingPharm.address,
              city: kyc.city || existingPharm.city,
              state: kyc.state || existingPharm.state,
              pincode: kyc.pincode || existingPharm.pincode,
              phone: kyc.phone || existingPharm.phone,
              lat: kyc.gpsLat || existingPharm.lat,
              lng: kyc.gpsLng || existingPharm.lng,
              verifiedBadge: true
            };
          } else {
            const generatedUserId = `PHARM-${Math.floor(1000 + Math.random() * 9000)}`;
            const assignedPassword = `Pass#${Math.floor(1000 + Math.random() * 9000)}`;
            const city = kyc.city || 'Mumbai';
            const coords = resolveCityCoordinates(city, kyc.address, kyc.state);
            updatedPharmacy = {
              id: kyc.pharmacyId,
              userId: generatedUserId,
              password: assignedPassword,
              name: kyc.pharmacyName,
              licenseNumber: kyc.licenseNumber,
              drugLicenseNo: kyc.drugLicenseNo,
              ownerName: kyc.ownerName,
              phone: kyc.phone || '+91 98000 11223',
              address: kyc.address,
              city: city,
              state: kyc.state || 'Maharashtra',
              pincode: kyc.pincode || '400001',
              lat: kyc.gpsLat || coords.lat,
              lng: kyc.gpsLng || coords.lng,
              rating: 5.0,
              totalReviews: 1,
              isOpenNow: true,
              is24x7: false,
              timings: '08:00 AM - 10:00 PM',
              verifiedBadge: true
            };
          }

          // Update active pharmacistStore if it belongs to this approved pharmacy
          let updatedActiveStore = state.pharmacistStore;
          if (state.pharmacistStore) {
            const isMatch =
              state.pharmacistStore.id === updatedPharmacy.id ||
              (state.pharmacistStore.drugLicenseNo &&
                updatedPharmacy.drugLicenseNo &&
                state.pharmacistStore.drugLicenseNo.replace(/[\s-]/g, '').toUpperCase() ===
                  updatedPharmacy.drugLicenseNo.replace(/[\s-]/g, '').toUpperCase()) ||
              (state.pharmacistStore.ownerName &&
                updatedPharmacy.ownerName &&
                state.pharmacistStore.ownerName.trim().toLowerCase() ===
                  updatedPharmacy.ownerName.trim().toLowerCase());

            if (isMatch || state.isPharmacistRegistered) {
              updatedActiveStore = {
                ...state.pharmacistStore,
                ...updatedPharmacy,
                verifiedBadge: true
              };
            }
          }

          const updatedPharmaciesList = state.pharmacies.some((p) => p.id === updatedPharmacy.id)
            ? state.pharmacies.map((p) => (p.id === updatedPharmacy.id ? updatedPharmacy : p))
            : [updatedPharmacy, ...state.pharmacies];

          return {
            kycQueue: state.kycQueue.map((k) =>
              k.id === kycId
                ? { ...k, status: 'approved', adminComments: adminComment }
                : k.pharmacyId === updatedPharmacy.id || k.drugLicenseNo === updatedPharmacy.drugLicenseNo
                ? { ...k, status: 'approved', adminComments: adminComment }
                : k
            ),
            pharmacies: updatedPharmaciesList,
            pharmacistStore: updatedActiveStore,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: 'Admin Desk',
                role: 'admin',
                action: 'KYC_APPROVE',
                details: `Approved pharmacy license for "${kyc.pharmacyName}". Verified Badge Activated.`,
                ipAddress: '10.0.0.1',
                severity: 'info'
              },
              ...state.auditLogs
            ]
          };
        });
        get().showToast('success', `✅ Pharmacist KYC Approved & Verified Badge Activated on Map!`);
      },

      rejectKYC: (kycId, adminComment = 'Declined: Drug License photo unreadable or owner photo mismatch.') => {
        set((state) => {
          const targetKyc = state.kycQueue.find((k) => k.id === kycId);
          const updatedPharmacies = state.pharmacies.map((p) => {
            if (
              targetKyc &&
              (p.id === targetKyc.pharmacyId || p.drugLicenseNo === targetKyc.drugLicenseNo)
            ) {
              return { ...p, verifiedBadge: false };
            }
            return p;
          });

          let updatedActiveStore = state.pharmacistStore;
          if (
            updatedActiveStore &&
            targetKyc &&
            (updatedActiveStore.id === targetKyc.pharmacyId ||
              updatedActiveStore.drugLicenseNo === targetKyc.drugLicenseNo)
          ) {
            updatedActiveStore = { ...updatedActiveStore, verifiedBadge: false };
          }

          return {
            kycQueue: state.kycQueue.map((k) =>
              k.id === kycId
                ? { ...k, status: 'rejected', rejectionReason: adminComment, adminComments: adminComment }
                : k
            ),
            pharmacies: updatedPharmacies,
            pharmacistStore: updatedActiveStore
          };
        });
        get().showToast('error', `KYC Application declined with comment: "${adminComment}"`);
      },

      togglePharmacyVerificationBadge: (pharmacyId: string) => {
        let isNowVerified = false;
        set((state) => {
          const updatedPharmacies = state.pharmacies.map((p) => {
            if (p.id === pharmacyId) {
              isNowVerified = !p.verifiedBadge;
              return { ...p, verifiedBadge: isNowVerified };
            }
            return p;
          });

          let updatedActiveStore = state.pharmacistStore;
          if (state.pharmacistStore && (state.pharmacistStore.id === pharmacyId || state.isPharmacistRegistered)) {
            updatedActiveStore = { ...state.pharmacistStore, verifiedBadge: isNowVerified };
          }

          const targetPharm = state.pharmacies.find((p) => p.id === pharmacyId);
          const updatedKyc = state.kycQueue.map((k) => {
            if (
              k.pharmacyId === pharmacyId ||
              (targetPharm && k.drugLicenseNo === targetPharm.drugLicenseNo)
            ) {
              return { ...k, status: isNowVerified ? ('approved' as const) : ('rejected' as const) };
            }
            return k;
          });

          return {
            pharmacies: updatedPharmacies,
            pharmacistStore: updatedActiveStore,
            kycQueue: updatedKyc
          };
        });

        get().showToast(
          isNowVerified ? 'success' : 'warning',
          `Pharmacy Verification Status: ${isNowVerified ? 'ACTIVATED (Approved)' : 'REVOKED'}`
        );
      },

      addMedicineToCatalog: (med) => {
        const newMed: Medicine = {
          ...med,
          id: `med-${Date.now()}`
        };
        set((state) => ({ medicines: [newMed, ...state.medicines] }));
        get().showToast('success', `${med.brandName} added to National Medicine Catalog.`);
      },

      // Toast & Modals
      showToast: (type, message) => {
        const id = `toast-${Date.now()}`;
        set({ activeToast: { id, type, message } });
        setTimeout(() => {
          if (get().activeToast?.id === id) {
            set({ activeToast: null });
          }
        }, 4500);
      },

      clearToast: () => set({ activeToast: null }),
      setSelectedPharmacyDetail: (pharmacy) => set({ selectedPharmacyForDetail: pharmacy }),
      setSelectedMedicineDetail: (medicine) => set({ selectedMedicineForDetail: medicine })
    }),
    {
      name: 'tablate_essential_storage_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        isPharmacistRegistered: state.isPharmacistRegistered,
        pharmacistStore: state.pharmacistStore,
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        pharmacies: state.pharmacies,
        medicines: state.medicines,
        inventory: state.inventory,
        kycQueue: state.kycQueue,
        auditLogs: state.auditLogs
      }),
    }
  )
);

// Initialize Real-Time Physical Device & Multi-Tab Listener
if (typeof window !== 'undefined') {
  // A. BroadcastChannel & LocalStorage Event Sync
  realtimeBroadcastService.initRealtimeSync(
    (newReq) => {
      useAppStore.setState((state) => ({
        liveRequests: [newReq, ...state.liveRequests.filter((r) => r.id !== newReq.id)]
      }));
      useAppStore.getState().showToast('info', `⚡ LIVE RADAR PING: Patient requested "${newReq.medicineName}"!`);
    },
    (requestId, response) => {
      useAppStore.setState((state) => ({
        liveRequests: state.liveRequests.map((req) => {
          if (req.id === requestId) {
            const updatedResponses = [
              ...req.responses.filter((r) => r.pharmacyId !== response.pharmacyId),
              response
            ];
            return {
              ...req,
              status: response.available ? 'matched' : req.status,
              responses: updatedResponses
            };
          }
          return req;
        })
      }));
      const toastType = response.available ? 'success' : 'warning';
      const toastMsg = response.available 
        ? `⚡ REAL-TIME RESPONSE: "${response.pharmacyName}" confirmed medicine IS IN STOCK!`
        : `⚡ REAL-TIME RESPONSE: "${response.pharmacyName}" marked medicine out of stock.`;
      useAppStore.getState().showToast(toastType, toastMsg);
    },
    (pharmacyId, isOpenNow) => {
      useAppStore.setState((state) => ({
        pharmacies: state.pharmacies.map((p) => p.id === pharmacyId ? { ...p, isOpenNow } : p)
      }));
    },
    () => {
      useAppStore.setState({ liveRequests: [] });
    }
  );

  // B. Firebase RTDB & Shared Network Storage Sync across Physical Devices (Phone <-> Laptop)
  dataStorageService.subscribeToStockRequests((updatedRequests) => {
    useAppStore.setState((state) => {
      const dismissed = state.dismissedRequestIds || [];
      if (!updatedRequests || updatedRequests.length === 0) {
        return { liveRequests: [] };
      }
      // Strictly exclude any request that has been deleted/dismissed by pharmacist!
      const validRequests = updatedRequests.filter((r) => !dismissed.includes(r.id));
      validRequests.sort((a, b) => b.timestampMs - a.timestampMs);
      return { liveRequests: validRequests };
    });
  });
}
