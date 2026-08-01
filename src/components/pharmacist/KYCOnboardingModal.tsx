import React, { useState } from 'react';
import { 
  X, 
  FileCheck, 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Video, 
  UploadCloud, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  RefreshCw,
  User,
  Store,
  FileText
} from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { useAppStore } from '../../store/useAppStore';
import { PharmacistDeduplicationService } from '../../services/pharmacistDeduplicationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KYCOnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const { submitKYCOnboarding, showToast, pharmacies, kycQueue, pharmacistStore } = useAppStore();

  const [formData, setFormData] = useState({
    pharmacyName: pharmacistStore?.name || 'Apollo Chemist & Emergency Store',
    licenseNumber: pharmacistStore?.licenseNumber || 'MH-MUM-DL-2026-8812',
    drugLicenseNo: pharmacistStore?.drugLicenseNo || '20B/21B-MH-554411',
    gstin: '27ABCDE1234F1Z5',
    ownerName: pharmacistStore?.ownerName || 'Rajesh Sharma',
    ownerAadhaar: '9988-7766-5544',
    address: pharmacistStore?.address || 'Shop 4, Grand Arcade',
    city: pharmacistStore?.city || 'Mumbai',
    state: pharmacistStore?.state || 'Maharashtra',
    pincode: pharmacistStore?.pincode || '400050',
    phone: pharmacistStore?.phone || '+91 98201 12345',
    gpsLat: pharmacistStore?.lat || 19.0600,
    gpsLng: pharmacistStore?.lng || 72.8300,
    drugLicenseUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    licenseOwnerPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    shopFrontPhotoUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80',
    ownerInsidePharmacyPhotoUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=80',
    videoVerificationUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  });

  React.useEffect(() => {
    if (pharmacistStore) {
      setFormData((prev) => ({
        ...prev,
        pharmacyName: pharmacistStore.name || prev.pharmacyName,
        licenseNumber: pharmacistStore.licenseNumber || prev.licenseNumber,
        drugLicenseNo: pharmacistStore.drugLicenseNo || prev.drugLicenseNo,
        ownerName: pharmacistStore.ownerName || prev.ownerName,
        address: pharmacistStore.address || prev.address,
        city: pharmacistStore.city || prev.city,
        state: pharmacistStore.state || prev.state,
        pincode: pharmacistStore.pincode || prev.pincode,
        phone: pharmacistStore.phone || prev.phone,
        gpsLat: pharmacistStore.lat || prev.gpsLat,
        gpsLng: pharmacistStore.lng || prev.gpsLng
      }));
    }
  }, [pharmacistStore]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: keyof typeof formData) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingField(fieldKey);
      try {
        const res = await uploadToCloudinary(file, 'kyc_documents');
        setFormData((prev) => ({ ...prev, [fieldKey]: res.secure_url }));
        showToast('success', `Document uploaded to Cloudinary (dz6qjy2t6)!`);
      } catch (err: any) {
        showToast('error', `Cloudinary upload failed: ${err.message}`);
      } finally {
        setUploadingField(null);
      }
    }
  };

  const checkFieldUniqueness = (field: 'drugLicenseNo' | 'licenseNumber' | 'aadhaar', value: string) => {
    if (!value || value.length < 5) {
      setDuplicateWarning(null);
      return;
    }
    const checkObj = {
      [field === 'aadhaar' ? 'aadhaar' : field === 'drugLicenseNo' ? 'drugLicenseNo' : 'licenseNumber']: value
    };
    const res = PharmacistDeduplicationService.checkDuplicate(checkObj, pharmacies, kycQueue);
    if (res.isDuplicate) {
      setDuplicateWarning(res.reason || 'Duplicate record detected');
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = () => {
    const finalCheck = PharmacistDeduplicationService.checkDuplicate(
      {
        aadhaar: formData.ownerAadhaar,
        drugLicenseNo: formData.drugLicenseNo,
        licenseNumber: formData.licenseNumber
      },
      pharmacies,
      kycQueue
    );

    if (finalCheck.isDuplicate) {
      setDuplicateWarning(finalCheck.reason || 'Duplicate account detected.');
      showToast('error', `🚫 Duplicate Account Blocked: ${finalCheck.reason}`);
      return;
    }

    submitKYCOnboarding({
      pharmacyId: pharmacistStore?.id || `pharm-${Date.now()}`,
      pharmacyName: formData.pharmacyName,
      licenseNumber: formData.licenseNumber,
      drugLicenseNo: formData.drugLicenseNo,
      gstin: formData.gstin,
      ownerName: formData.ownerName,
      ownerAadhaar: formData.ownerAadhaar,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      phone: formData.phone,
      gpsLat: formData.gpsLat,
      gpsLng: formData.gpsLng,
      documents: {
        drugLicenseUrl: formData.drugLicenseUrl,
        licenseOwnerPhotoUrl: formData.licenseOwnerPhotoUrl,
        shopFrontPhotoUrl: formData.shopFrontPhotoUrl,
        ownerInsidePharmacyPhotoUrl: formData.ownerInsidePharmacyPhotoUrl,
        videoVerificationUrl: formData.videoVerificationUrl
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Pharmacist Mandatory 5-Document KYC Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                CDSCO & State Drug Control Compliance (Cloud Name: dz6qjy2t6)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2.5 animate-pulse">
            <span className="font-extrabold text-sm">🚫</span>
            <span className="font-bold">{duplicateWarning}</span>
          </div>
        )}

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Step 1: Store Details & Form 20B/21B Drug License
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pharmacy Store Name</label>
                <input
                  type="text"
                  value={formData.pharmacyName}
                  onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Drug License No. (Form 20B/21B)</label>
                <input
                  type="text"
                  value={formData.drugLicenseNo}
                  onChange={(e) => {
                    setFormData({ ...formData, drugLicenseNo: e.target.value });
                    checkFieldUniqueness('drugLicenseNo', e.target.value);
                  }}
                  onBlur={() => checkFieldUniqueness('drugLicenseNo', formData.drugLicenseNo)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono"
                />
              </div>
            </div>

            <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer hover:border-brand-500 transition">
              {uploadingField === 'drugLicenseUrl' ? (
                <RefreshCw className="w-7 h-7 text-brand-500 animate-spin mx-auto mb-1" />
              ) : (
                <FileText className="w-7 h-7 text-brand-500 mx-auto mb-1" />
              )}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Upload State Drug License (Form 20B/21B Certificate)
              </span>
              <span className="text-[10px] text-brand-500 font-mono mt-1 truncate max-w-md">
                Cloudinary: {formData.drugLicenseUrl}
              </span>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'drugLicenseUrl')} className="hidden" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Step 2: License Owner Verification & Official Photo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registered Pharmacist / Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number (12-Digit Unique ID)</label>
                <input
                  type="text"
                  value={formData.ownerAadhaar}
                  onChange={(e) => {
                    setFormData({ ...formData, ownerAadhaar: e.target.value });
                    checkFieldUniqueness('aadhaar', e.target.value);
                  }}
                  onBlur={() => checkFieldUniqueness('aadhaar', formData.ownerAadhaar)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono"
                />
              </div>
            </div>

            <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer hover:border-brand-500 transition">
              {uploadingField === 'licenseOwnerPhotoUrl' ? (
                <RefreshCw className="w-7 h-7 text-brand-500 animate-spin mx-auto mb-1" />
              ) : (
                <User className="w-7 h-7 text-brand-500 mx-auto mb-1" />
              )}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Upload License Owner Passport Photo
              </span>
              <span className="text-[10px] text-brand-500 font-mono mt-1 truncate max-w-md">
                Cloudinary: {formData.licenseOwnerPhotoUrl}
              </span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'licenseOwnerPhotoUrl')} className="hidden" />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Step 3: Shop Front Photo & Storefront Proof
            </h3>

            <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer hover:border-brand-500 transition">
              {uploadingField === 'shopFrontPhotoUrl' ? (
                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-1" />
              ) : (
                <Store className="w-8 h-8 text-brand-500 mx-auto mb-1" />
              )}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Upload Clear Photo of Pharmacy Shop Front & Signboard
              </span>
              <span className="text-[10px] text-brand-500 font-mono mt-1 truncate max-w-md">
                Cloudinary: {formData.shopFrontPhotoUrl}
              </span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'shopFrontPhotoUrl')} className="hidden" />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Step 4: Owner Inside Pharmacy Photo & Live 15-Sec Video Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="p-4 rounded-2xl bg-slate-800 text-center space-y-2 cursor-pointer hover:bg-slate-700 transition block">
                {uploadingField === 'ownerInsidePharmacyPhotoUrl' ? (
                  <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
                ) : (
                  <Camera className="w-7 h-7 text-emerald-400 mx-auto" />
                )}
                <span className="text-xs font-bold text-white block">4. Photo of Owner Inside Pharmacy</span>
                <span className="text-[10px] text-emerald-400 font-mono block truncate">Cloudinary Upload</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'ownerInsidePharmacyPhotoUrl')} className="hidden" />
              </label>

              <label className="p-4 rounded-2xl bg-slate-800 text-center space-y-2 cursor-pointer hover:bg-slate-700 transition block">
                {uploadingField === 'videoVerificationUrl' ? (
                  <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mx-auto" />
                ) : (
                  <Video className="w-7 h-7 text-teal-400 mx-auto" />
                )}
                <span className="text-xs font-bold text-white block">5. Upload 15-sec Video Verification</span>
                <span className="text-[10px] text-teal-400 font-mono block truncate">Encrypted CDN Upload</span>
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoVerificationUrl')} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Step 5: Review All 5 Documents & Legal Submission
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-slate-100">Summary of 5-Document Verification Payload:</div>
              <div>• 1. State Drug License Form 20B/21B: <strong className="text-brand-500 font-mono">Attached</strong></div>
              <div>• 2. License Owner Photo: <strong className="text-brand-500 font-mono">Attached</strong></div>
              <div>• 3. Shop Front Photo: <strong className="text-brand-500 font-mono">Attached</strong></div>
              <div>• 4. Owner Inside Pharmacy Photo: <strong className="text-brand-500 font-mono">Attached</strong></div>
              <div>• 5. 15-second Video Verification: <strong className="text-brand-500 font-mono">Attached</strong></div>
            </div>

            <label className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-brand-600" />
              <span>I declare under the Pharmacy Act 1948 that all uploaded documents & photos are authentic.</span>
            </label>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition"
            >
              <span>Continue Step {step + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xl hover:brightness-110 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit 5-Document KYC Application</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
