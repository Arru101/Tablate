import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  MessageSquare,
  Trash2,
  CheckCircle2,
  FilterX,
  Image as ImageIcon,
  Eye,
  X,
  ZoomIn
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const LiveRadar: React.FC = () => {
  const { 
    liveRequests, 
    respondToLiveRequest, 
    dismissLiveRequest, 
    clearAllLiveRequests,
    cleanupExpiredRequests, 
    pharmacies,
    pharmacistStore 
  } = useAppStore();

  const [customComment, setCustomComment] = useState<{ [reqId: string]: string }>({});
  const [inspectingImageUrl, setInspectingImageUrl] = useState<string | null>(null);

  // Safe Array Guard for live requests stream
  const safeLiveRequests = liveRequests || [];

  // Auto-cleanup timer: runs every 10 seconds to purge expired requests
  useEffect(() => {
    cleanupExpiredRequests();
    const interval = setInterval(() => {
      cleanupExpiredRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentPharmacyId = pharmacistStore?.id || (pharmacies || [])[0]?.id || 'pharm-1';

  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Live Genuine Emergency Medicine Radar
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/20">
                REAL PATIENTS ONLY
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only genuine patient emergency requests broadcasted within your store radius appear here.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {safeLiveRequests.length > 0 && (
            <button
              onClick={clearAllLiveRequests}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear All Radar Requests</span>
            </button>
          )}

          <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Radar Active
          </span>
        </div>
      </div>

      {/* Requests Stream */}
      {safeLiveRequests.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 space-y-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-60" />
          <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
            No Active Medicine Requests on Radar
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            The radar is strictly listening for real patient broadcasts. When a patient types a medicine or uploads a prescription image, it will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeLiveRequests.map((req) => {
            const safeResponses = req.responses || [];
            const hasResponded = safeResponses.some((r) => r.pharmacyId === currentPharmacyId);
            const reqComment = customComment[req.id] || '';

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/30 dark:from-slate-800/80 dark:to-slate-800/40 border border-emerald-500/20 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED PATIENT REQUEST
                      </span>

                      {req.imageUrl && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-cyan-500 text-white rounded-md flex items-center gap-1 shadow">
                          <ImageIcon className="w-3 h-3" /> PRESCRIPTION IMAGE ATTACHED
                        </span>
                      )}

                      {req.scheduleClass && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-md border border-purple-500/20">
                          {req.scheduleClass}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {req.medicineName}
                    </h3>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" /> ~1.4 km from your store
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Requested {req.requestedAt}
                      </span>
                    </div>
                  </div>

                  {/* Pharmacist Delete / Fulfill Request Action */}
                  <button
                    onClick={() => dismissLiveRequest(req.id)}
                    title="Delete / Fulfill Medicine Request"
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Request</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-mono text-slate-400">Req #{req.id.slice(-4)}</span>
                    <button
                      onClick={() => dismissLiveRequest(req.id)}
                      title="Dismiss Request"
                      className="p-1 text-slate-400 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Patient Uploaded Image Preview & Inspection Box */}
                {req.imageUrl && (
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-cyan-500/40 shrink-0 relative group">
                        <img
                          src={req.imageUrl}
                          alt="Patient prescription"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setInspectingImageUrl(req.imageUrl!)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                      </div>

                      <div>
                        <div className="text-xs font-extrabold text-cyan-900 dark:text-cyan-200">
                          Prescription / Strip Photo Attached by Patient
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Inspect photo to verify exact brand, dosage & strength required.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingImageUrl(req.imageUrl!)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5 shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full Image</span>
                    </button>
                  </div>
                )}

                {/* 1-Tap Response Actions with Intimation Comment */}
                {!hasResponded ? (
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={reqComment}
                        onChange={(e) => setCustomComment({ ...customComment, [req.id]: e.target.value })}
                        placeholder="Add response note for patient (e.g. 'In stock, 50 units available. Rx required')..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => respondToLiveRequest(req.id, currentPharmacyId, true, reqComment)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Available (In Stock)</span>
                      </button>

                      <button
                        onClick={() => respondToLiveRequest(req.id, currentPharmacyId, false, reqComment)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Mark Unavailable (Decline)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold space-y-1 border border-emerald-500/20">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> You responded to patient in real-time.
                    </div>
                    {safeResponses.find((r) => r.pharmacyId === currentPharmacyId)?.pharmacistComment && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-normal italic pl-5">
                        "{safeResponses.find((r) => r.pharmacyId === currentPharmacyId)?.pharmacistComment}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pharmacist Image Lightbox Inspection Modal */}
      {inspectingImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 text-center">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <span>Pharmacist Image Inspection — Prescription / Strip Photo</span>
              </div>
              <button
                onClick={() => setInspectingImageUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black border border-slate-800 flex items-center justify-center p-2">
              <img
                src={inspectingImageUrl}
                alt="Full size prescription"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setInspectingImageUrl(null)}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
              >
                Close & Return to Radar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
