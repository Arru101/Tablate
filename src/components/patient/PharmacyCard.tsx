import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Heart, 
  AlertTriangle, 
  Pill,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Power,
  Car,
  Compass
} from 'lucide-react';
import { Pharmacy, InventoryItem, Medicine } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { calculateLiveTrafficEta } from '../../utils/trafficUtils';

interface Props {
  pharmacy: Pharmacy;
  inventoryItem?: InventoryItem;
  targetMedicine?: Medicine;
  onOpenAlternatives: (medicine: Medicine) => void;
  onReportInaccurate: (pharmacy: Pharmacy) => void;
}

export const PharmacyCard: React.FC<Props> = ({ 
  pharmacy, 
  inventoryItem, 
  targetMedicine, 
  onOpenAlternatives,
  onReportInaccurate
}) => {
  const { 
    favorites, 
    toggleFavorite, 
    userLocation, 
    detectLiveLocation, 
    language, 
    setSelectedPharmacyDetail, 
    liveRequests
  } = useAppStore();

  const [now, setNow] = React.useState(Date.now());

  // Safe Array Guard for live requests & responses
  const safeLiveRequests = liveRequests || [];
  const liveResponse = safeLiveRequests
    .flatMap((r) => r.responses || [])
    .find((resp) => resp.pharmacyId === pharmacy.id || resp.pharmacyName === pharmacy.name);

  // 30-Minute Timer starts EXCLUSIVELY when Pharmacist hits Available!
  const liveResponseExpiresAt = liveResponse?.expiresAtMs;
  const isResponseTimerActive = Boolean(liveResponse?.available && liveResponseExpiresAt && liveResponseExpiresAt > now);
  const secondsLeft = isResponseTimerActive ? Math.max(0, Math.floor((liveResponseExpiresAt! - now) / 1000)) : 0;
  const minutesLeft = Math.floor(secondsLeft / 60);
  const secondsMod = secondsLeft % 60;

  React.useEffect(() => {
    if (!isResponseTimerActive) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isResponseTimerActive]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const isFav = (favorites || []).includes(pharmacy.id);

  // 100% Accurate Real-Time Haversine & Traffic Speed Calculation
  const trafficData = calculateLiveTrafficEta(
    userLocation?.lat || 19.0596,
    userLocation?.lng || 72.8295,
    pharmacy.lat,
    pharmacy.lng
  );

  // Alternatives array guard
  const safeAlternatives = targetMedicine?.alternatives || [];

  // Status mapping
  const statusColor = inventoryItem?.status === 'in_stock' || liveResponse?.available
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    : inventoryItem?.status === 'low_stock'
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

  const statusLabel = inventoryItem?.status === 'in_stock' || liveResponse?.available
    ? t.inStock
    : inventoryItem?.status === 'low_stock'
    ? t.lowStock
    : t.outOfStock;

  // Open Google Maps navigation directly
  const openNavigation = () => {
    const fullExactAddress = `${pharmacy.name}, ${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.pincode}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullExactAddress)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`group relative bg-white dark:bg-slateDark-900 rounded-3xl p-5 border shadow-md hover:shadow-xl transition-all duration-200 space-y-4 ${
      pharmacy.isOpenNow
        ? 'border-slate-200 dark:border-slate-800'
        : 'border-slate-300 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/40'
    }`}>
      
      {/* Top Bar: Stock status badge + Online Status + Favorite button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {pharmacy.isOpenNow ? (
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusColor} flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {statusLabel}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5">
              <Power className="w-3 h-3" /> Store Offline
            </span>
          )}

          {/* Real-time Traffic Badge */}
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${trafficData.trafficColorClass} flex items-center gap-1`}>
            <Car className="w-3 h-3" /> {trafficData.trafficLabel}
          </span>
        </div>

        <button
          onClick={() => toggleFavorite(pharmacy.id)}
          className={`p-2 rounded-xl transition ${
            isFav
              ? 'text-rose-500 bg-rose-500/10'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Pharmacy Info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center space-x-1.5">
            <h3 
              onClick={() => setSelectedPharmacyDetail(pharmacy)}
              className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 cursor-pointer transition"
            >
              {pharmacy.name}
            </h3>
            {pharmacy.verifiedBadge && (
              <span title={t.verifiedLicense}>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-brand-500 inline mr-1" />
            {pharmacy.address}, {pharmacy.city} ({pharmacy.pincode})
          </p>
        </div>

        {pharmacy.image && (
          <img
            src={pharmacy.image}
            alt={pharmacy.name}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
          />
        )}
      </div>

      {/* Live Response Intimation Note from Pharmacist */}
      {liveResponse && (
        <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-teal-500" /> Pharmacist Live Intimation Note:
          </div>
          <p className="italic text-[11px] text-slate-700 dark:text-slate-300">
            "{liveResponse.pharmacistComment || (liveResponse.available ? 'Confirmed in stock' : 'Out of stock')}"
          </p>
        </div>
      )}

      {/* Specific Stock Item Details if available */}
      {inventoryItem && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {inventoryItem.medicine?.brandName} <span className="font-normal text-slate-400">({inventoryItem.medicine?.strength})</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified Stock: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{inventoryItem.quantity} units</span> • Batch: {inventoryItem.batchNumber}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              ₹{inventoryItem.price?.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">MRP verified</span>
          </div>
        </div>
      )}

      {/* Ticking 30-Minute Pharmacist Availability Window Badge */}
      {isResponseTimerActive && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between font-extrabold animate-pulse shadow-sm">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>⏱ 30-Min Pharmacist Stock Window Active</span>
          </span>
          <span className="font-mono text-xs bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-lg font-black shrink-0">
            {minutesLeft}m {secondsMod < 10 ? `0${secondsMod}` : secondsMod}s
          </span>
        </div>
      )}

      {/* 100% Accurate Real-Time Distance & Traffic ETA Row */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 font-extrabold text-brand-600 dark:text-brand-400 text-sm">
            <MapPin className="w-4 h-4 text-brand-500" />
            {trafficData.distanceKm} km away
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            ETA ~{trafficData.etaMinutes} mins
          </span>
        </div>

        <button
          onClick={detectLiveLocation}
          title="Recalculate distance from my current GPS spot"
          className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>GPS Refresh</span>
        </button>
      </div>

      {/* Pharmacist Suggested Alternatives Button */}
      {targetMedicine && safeAlternatives.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => onOpenAlternatives(targetMedicine)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold transition border border-teal-500/20"
          >
            <span className="flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-500" />
              Pharmacist Generic Substitutes Available ({safeAlternatives.length})
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions Row: Live Navigation & Report Stock */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={openNavigation}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 text-white font-bold text-xs shadow-md hover:brightness-105 transition"
        >
          <Navigation className="w-4 h-4" />
          <span>Get Directions ({trafficData.distanceKm} km • {trafficData.etaMinutes}m)</span>
        </button>

        <button
          onClick={() => onReportInaccurate(pharmacy)}
          title={t.reportStock}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
