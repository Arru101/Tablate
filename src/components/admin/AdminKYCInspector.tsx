import React, { useState } from 'react';
import { 
  FileCheck, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Eye, 
  Clock, 
  ShieldAlert,
  MessageSquare,
  User,
  Store,
  Video
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AdminKYCInspector: React.FC = () => {
  const { kycQueue, approveKYC, rejectKYC } = useAppStore();
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [adminCommentInput, setAdminCommentInput] = useState('');

  const selectedKYC = kycQueue.find((k) => k.id === selectedKycId) || kycQueue[0];

  const handleApproveWithComment = () => {
    if (!selectedKYC) return;
    const comment = adminCommentInput.trim() || 'Approved: Form 20B/21B drug license and owner photos verified with CDSCO state portal.';
    approveKYC(selectedKYC.id, comment);
    setAdminCommentInput('');
  };

  const handleRejectWithComment = () => {
    if (!selectedKYC) return;
    const comment = adminCommentInput.trim() || 'Declined: Drug License photo unreadable or shop front photo mismatch.';
    rejectKYC(selectedKYC.id, comment);
    setAdminCommentInput('');
  };

  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Pharmacist Drug License & 5-Document KYC Audit Inspector
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CDSCO State Licensing Authority — Review License, Owner Photo, Shop Front & Video Verification
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold text-xs border border-amber-500/20">
          {kycQueue.filter((k) => k.status === 'pending').length} Pending Verifications
        </span>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Queue List (Left 4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verification Queue
          </div>

          {kycQueue.map((kyc) => (
            <div
              key={kyc.id}
              onClick={() => setSelectedKycId(kyc.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                selectedKYC?.id === kyc.id
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-100 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {kyc.pharmacyName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    kyc.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : kyc.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {kyc.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Owner: {kyc.ownerName} • License: {kyc.drugLicenseNo}
              </div>
              {kyc.adminComments && (
                <div className="text-[11px] text-purple-600 dark:text-purple-300 italic mt-1.5 truncate">
                  "{kyc.adminComments}"
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Submitted: {kyc.submittedAt}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Inspection Panel (Right 8 columns) */}
        {selectedKYC ? (
          <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/80 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedKYC.pharmacyName}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  License #: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{selectedKYC.drugLicenseNo}</span> • GSTIN: {selectedKYC.gstin || 'N/A'}
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                selectedKYC.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : selectedKYC.status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                Status: {selectedKYC.status}
              </span>
            </div>

            {/* 5-Document Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>1. State Drug License (Form 20B/21B)</span>
                  <a href={selectedKYC.documents.drugLicenseUrl} target="_blank" rel="noreferrer" className="text-purple-500 hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Full
                  </a>
                </div>
                <img
                  src={selectedKYC.documents.drugLicenseUrl}
                  alt="Drug License"
                  className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>2. License Owner Photo</span>
                  <a href={selectedKYC.documents.licenseOwnerPhotoUrl} target="_blank" rel="noreferrer" className="text-purple-500 hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Full
                  </a>
                </div>
                <img
                  src={selectedKYC.documents.licenseOwnerPhotoUrl}
                  alt="License Owner"
                  className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>3. Shop Front Photo & Signboard</span>
                  <a href={selectedKYC.documents.shopFrontPhotoUrl} target="_blank" rel="noreferrer" className="text-purple-500 hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Full
                  </a>
                </div>
                <img
                  src={selectedKYC.documents.shopFrontPhotoUrl}
                  alt="Shop Front"
                  className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>4. Owner Inside Pharmacy Photo</span>
                  <a href={selectedKYC.documents.ownerInsidePharmacyPhotoUrl} target="_blank" rel="noreferrer" className="text-purple-500 hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Full
                  </a>
                </div>
                <img
                  src={selectedKYC.documents.ownerInsidePharmacyPhotoUrl}
                  alt="Owner Inside Pharmacy"
                  className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

            </div>

            {/* Video Verification Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4 text-purple-500" /> 5. Live 15-Second Video Verification
                </span>
                <span className="text-emerald-500 text-[10px] font-bold">Encrypted CDN Stream</span>
              </div>
              <video
                controls
                src={selectedKYC.documents.videoVerificationUrl}
                className="w-full h-36 rounded-xl bg-black object-cover border border-slate-700"
              />
            </div>

            {/* Admin Audit Comment Input Box */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-purple-500" /> Admin Intimation Comment (Visible to Pharmacist)
              </label>
              <textarea
                rows={2}
                value={adminCommentInput}
                onChange={(e) => setAdminCommentInput(e.target.value)}
                placeholder="Enter audit approval remarks or decline explanation for the pharmacist..."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-1">
                <button
                  onClick={handleRejectWithComment}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline KYC Application</span>
                </button>

                <button
                  onClick={handleApproveWithComment}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Activate Store License</span>
                </button>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
