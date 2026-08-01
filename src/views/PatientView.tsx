import React, { useState } from 'react';
import { 
  Pill, 
  MapPin, 
  Clock, 
  SlidersHorizontal, 
  Compass, 
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  Heart,
  Grid,
  List,
  ShieldCheck,
  Store,
  MessageSquare,
  XCircle,
  Power,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { SmartSearchInput } from '../components/patient/SmartSearchInput';
import { PharmacyCard } from '../components/patient/PharmacyCard';
import { InteractiveMap } from '../components/patient/InteractiveMap';
import { OCRModal } from '../components/patient/OCRModal';
import { VoiceSearchModal } from '../components/patient/VoiceSearchModal';
import { BarcodeModal } from '../components/patient/BarcodeModal';
import { MedicineAlternativesDrawer } from '../components/patient/MedicineAlternativesDrawer';
import { ReportStockModal } from '../components/patient/ReportStockModal';
import { Medicine, Pharmacy } from '../types';
import { TRANSLATIONS } from '../data/translations';

export const PatientView: React.FC = () => {
  const { 
    filters, 
    medicines, 
    pharmacies, 
    inventory, 
    userLocation, 
    detectLiveLocation,
    language,
    liveRequests,
    directionTimers
  } = useAppStore();

  const [showOCR, setShowOCR] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [onlineOnlyFilter, setOnlineOnlyFilter] = useState(false);

  const [targetAltMedicine, setTargetAltMedicine] = useState<Medicine | null>(null);
  const [targetReportPharmacy, setTargetReportPharmacy] = useState<any>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Online Pharmacies Count
  const onlinePharmacies = (pharmacies || []).filter((p) => p.isOpenNow);
  const searchClean = (filters?.searchQuery || '').trim().toLowerCase();
  const now = Date.now();

  // Calculate Haversine GPS Distance from User Location for Any Pharmacy
  const getPharmDistance = (pharm: Pharmacy) => {
    const userLat = userLocation?.lat || 19.0596;
    const userLng = userLocation?.lng || 72.8295;
    const R = 6371;
    const dLat = (pharm.lat - userLat) * (Math.PI / 180);
    const dLng = (pharm.lng - userLng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * (Math.PI / 180)) *
        Math.cos(pharm.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find all pharmacies that responded "Available" within the 30-minute window
  const respondingAvailablePharmacies = (pharmacies || []).filter((pharm) =>
    (liveRequests || []).some((r) =>
      (r.responses || []).some(
        (resp) =>
          resp.available &&
          (!resp.expiresAtMs || now < resp.expiresAtMs) &&
          (resp.pharmacyId === pharm.id ||
            (resp.pharmacyName && pharm.name && resp.pharmacyName.toLowerCase() === pharm.name.toLowerCase()))
      )
    )
  );

  // If MULTIPLE pharmacists responded "Available", pick ONLY the SINGLE NEAREST ONE to current user location!
  let nearestRespondingPharmacyId: string | null = null;
  if (respondingAvailablePharmacies.length > 0) {
    const sortedByDist = [...respondingAvailablePharmacies].sort(
      (a, b) => getPharmDistance(a) - getPharmDistance(b)
    );
    nearestRespondingPharmacyId = sortedByDist[0].id;
  }

  const matchedPharmacies = (pharmacies || []).filter((pharm) => {
    if (onlineOnlyFilter && !pharm.isOpenNow) return false;
    if (filters.nightOnly && !pharm.is24x7) return false;

    // 1. If multiple pharmacists responded available, ONLY show the nearest responding pharmacy!
    const isResponding = respondingAvailablePharmacies.some((p) => p.id === pharm.id);
    if (isResponding) {
      return pharm.id === nearestRespondingPharmacyId;
    }

    // 2. If explicit search query is entered by user, show matching pharmacies
    if (searchClean) {
      const nameMatch = (pharm.name || '').toLowerCase().includes(searchClean);
      const addrMatch = (pharm.address || '').toLowerCase().includes(searchClean);
      const cityMatch = (pharm.city || '').toLowerCase().includes(searchClean);
      
      const storeInv = (inventory || []).filter((inv) => inv.pharmacyId === pharm.id);
      const medMatch = storeInv.some(
        (inv) =>
          (inv.medicine?.brandName || '').toLowerCase().includes(searchClean) ||
          (inv.medicine?.genericName || '').toLowerCase().includes(searchClean)
      );

      return nameMatch || addrMatch || cityMatch || medMatch;
    }

    // Default: Keep user page clean until a pharmacist hits Available!
    return false;
  });

  // Sort matched pharmacies strictly by distance to user's current GPS location
  const sortedMatchedPharmacies = [...matchedPharmacies].sort(
    (a, b) => getPharmDistance(a) - getPharmDistance(b)
  );

  // Active Patient Emergency Request with 30-Minute Expiry Filter for Responses
  const activePatientRequest = (liveRequests || [])[0];
  const activeResponses = activePatientRequest
    ? (activePatientRequest.responses || []).filter((resp) => !resp.expiresAtMs || now < resp.expiresAtMs)
    : [];

  return (
    <div className="responsive-container py-6 space-y-8">
      
      {/* Hero Header Banner */}
      <section className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-teal-950 to-slate-950 p-6 sm:p-10 text-white shadow-2xl overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          
          {/* Online Pharmacists Radar Counter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{onlinePharmacies.length} LICENSED PHARMACIES ONLINE & ACTIVE ON RADAR</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 text-slate-200 border border-white/10 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>REAL-TIME DISCOVERY</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Verify Emergency Medicine Stock <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-white bg-clip-text text-transparent">
              Before You Travel
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-2xl">
            Locate nearby licensed physical pharmacies in India with verified stock availability, live traffic travel times, and direct pharmacist visual inspection.
          </p>

          {/* GPS Radar Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={detectLiveLocation}
              className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>{t.detectLiveGps}</span>
            </button>

            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-xs font-medium border border-white/10 text-slate-200">
              📍 Current Location: <strong className="text-teal-300 font-bold">{userLocation?.addressName || 'Bandra West, Mumbai'}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Medicine Search Bar Component */}
      <section className="sticky top-16 z-30 pt-2 backdrop-blur-md">
        <SmartSearchInput
          onOpenOCR={() => setShowOCR(true)}
          onOpenVoice={() => setShowVoice(true)}
          onOpenBarcode={() => setShowBarcode(true)}
        />
      </section>

      {/* Real-Time Request Status Tracker Widget with Safe Array Guards */}
      {activePatientRequest && (
        <section className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 text-white shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
                <Radio className="w-5 h-5 animate-ping" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-teal-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" /> REAL-TIME EMERGENCY REQUEST TRACKER
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Searching Availability for: "{activePatientRequest.medicineName}"
                </h3>
              </div>
            </div>

            <div className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-cyan-300">
              {activeResponses.length} Pharmacist Responses Received
            </div>
          </div>

          {/* Real-time Responses List from Pharmacists */}
          {activeResponses.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div>
                <strong className="text-white">Broadcasted to {onlinePharmacies.length} Online Pharmacists on Radar!</strong>
                <p className="text-[11px] text-slate-400">
                  Pharmacists are inspecting stock now. As soon as a pharmacist approves or declines, the response note will appear here in real time.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeResponses.map((resp, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    resp.available
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 font-extrabold">
                      {resp.available ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] uppercase font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> CONFIRMED IN STOCK (APPROVED)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] uppercase font-black flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> MARKED UNAVAILABLE (DECLINED)
                        </span>
                      )}
                      <span className="text-sm text-white">{resp.pharmacyName}</span>
                    </div>

                    <p className="text-xs italic pl-1 font-semibold text-slate-300">
                      Pharmacist Note: "{resp.pharmacistComment}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {resp.expiresAtMs && resp.expiresAtMs > now && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-extrabold border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {Math.floor(Math.max(0, resp.expiresAtMs - now) / 60000)}m left
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      {resp.respondedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Results Section: Interactive Map + Pharmacy Cards Grid */}
      <section className="space-y-5">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Licensed Pharmacies ({matchedPharmacies.length})
            </span>

            <button
              onClick={() => setOnlineOnlyFilter(!onlineOnlyFilter)}
              className={`px-3 py-1 rounded-full text-xs font-extrabold border transition flex items-center gap-1.5 ${
                onlineOnlyFilter
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{onlineOnlyFilter ? 'Showing Online Only' : `🟢 Filter Online Only (${onlinePharmacies.length})`}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'split'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Split Map & List</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Full Grid View</span>
            </button>
          </div>
        </div>

        {/* Layout Mode: Split vs Full Grid */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-5 lg:sticky lg:top-36">
              <InteractiveMap pharmacies={sortedMatchedPharmacies} />
            </div>

            <div className="lg:col-span-7 space-y-4">
              {sortedMatchedPharmacies.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-teal-500/30 dark:border-teal-500/20 space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mx-auto border border-teal-500/20">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-black text-base text-slate-900 dark:text-slate-100">
                      Emergency Radar Active — User Page Clean
                    </div>
                    <p className="max-w-md mx-auto text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Enter a medicine name above or broadcast an emergency request. Pharmacist store cards will pop up automatically as soon as any pharmacist hits <strong className="text-emerald-600 dark:text-emerald-400 font-bold">"Confirm Available"</strong>!
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span>⏱ Cards auto-disappear 30 minutes after clicking "Get Directions"</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedMatchedPharmacies.map((pharm) => {
                    const storeInv = (inventory || []).find((inv) => inv.pharmacyId === pharm.id);
                    return (
                      <PharmacyCard
                        key={pharm.id}
                        pharmacy={pharm}
                        inventoryItem={storeInv}
                        onOpenAlternatives={(med) => setTargetAltMedicine(med)}
                        onReportInaccurate={(p) => setTargetReportPharmacy(p)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6">
            {sortedMatchedPharmacies.map((pharm) => {
              const storeInv = (inventory || []).find((inv) => inv.pharmacyId === pharm.id);
              return (
                <PharmacyCard
                  key={pharm.id}
                  pharmacy={pharm}
                  inventoryItem={storeInv}
                  onOpenAlternatives={(med) => setTargetAltMedicine(med)}
                  onReportInaccurate={(p) => setTargetReportPharmacy(p)}
                />
              );
            })}
          </div>
        )}

      </section>

      {/* Modals */}
      <OCRModal isOpen={showOCR} onClose={() => setShowOCR(false)} />
      <VoiceSearchModal isOpen={showVoice} onClose={() => setShowVoice(false)} />
      <BarcodeModal isOpen={showBarcode} onClose={() => setShowBarcode(false)} />
      
      {targetAltMedicine && (
        <MedicineAlternativesDrawer
          medicine={targetAltMedicine}
          isOpen={!!targetAltMedicine}
          onClose={() => setTargetAltMedicine(null)}
        />
      )}

      {targetReportPharmacy && (
        <ReportStockModal
          pharmacy={targetReportPharmacy}
          isOpen={!!targetReportPharmacy}
          onClose={() => setTargetReportPharmacy(null)}
        />
      )}

    </div>
  );
};
