import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, CheckCircle, RefreshCw, Radio, Image as ImageIcon } from 'lucide-react';
import { scanMedicineImage, OCRResult } from '../../services/ocrService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OCRModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const { setSearchQuery, addRecentSearch, createLiveStockRequest, showToast } = useAppStore();

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      setOcrResult(null);
      setCloudinaryUrl(null);
    }
  };

  const handleRunOCR = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      // 1. Upload to Cloudinary CDN
      const cRes = await uploadToCloudinary(selectedFile, 'tablate_prescriptions');
      const finalUrl = cRes.secure_url;
      setCloudinaryUrl(finalUrl);
      
      // 2. Perform OCR Extraction
      const res = await scanMedicineImage(selectedFile);
      setOcrResult(res);

      // AUTOMATICALLY DISPATCH IMAGE REQUEST TO AREA PHARMACISTS WITH IMAGE URL!
      const medName = res.extractedMedicineName || 'Prescription Image Request';
      setSearchQuery(medName);
      addRecentSearch(medName);
      createLiveStockRequest(medName, finalUrl || previewUrl || undefined);
      showToast('success', `📷 Prescription image uploaded! Live request sent to pharmacists.`);
    } catch (err: any) {
      // Fallback OCR
      const res = await scanMedicineImage(selectedFile);
      setOcrResult(res);

      const medName = res.extractedMedicineName || 'Prescription Image Request';
      setSearchQuery(medName);
      addRecentSearch(medName);
      createLiveStockRequest(medName, previewUrl || undefined);
      showToast('success', `📷 Prescription image processed! Live request sent to pharmacists.`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyResult = () => {
    if (ocrResult) {
      const medName = ocrResult.extractedMedicineName;
      setSearchQuery(medName);
      addRecentSearch(medName);
      
      // BROADCAST LIVE IMAGE REQUEST TO AREA PHARMACISTS!
      createLiveStockRequest(medName, cloudinaryUrl || previewUrl || undefined);
      showToast('success', `📷 Prescription Image Request sent to area pharmacists!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Prescription & Strip Photo Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded image is broadcasted to pharmacists for direct visual inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        {!selectedFile ? (
          <label className="flex flex-col items-center justify-center h-52 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition p-4">
            <UploadCloud className="w-10 h-10 text-brand-500 mb-2" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Upload Medicine Strip or Prescription Photo
            </span>
            <span className="text-xs text-slate-400 mt-1">Pharmacist will see this exact image to verify availability</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center">
              {previewUrl && (
                <img src={previewUrl} alt="Medicine strip preview" className="h-full object-contain" />
              )}
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                  <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
                  <span className="text-xs font-semibold">Uploading image to Cloudinary CDN & Broadcasting...</span>
                </div>
              )}
            </div>

            {cloudinaryUrl && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-mono truncate flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{cloudinaryUrl}</span>
              </div>
            )}

            {/* OCR Extracted Card */}
            {ocrResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Extracted Medicine
                  </span>
                  <span>AI Recognized</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {ocrResult.extractedMedicineName}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white/60 dark:bg-black/30 p-2 rounded-lg">
                  "{ocrResult.rawText}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {selectedFile && !ocrResult && (
            <button
              onClick={handleRunOCR}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-lg hover:bg-brand-500 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload & Send Image Request</span>
            </button>
          )}

          {ocrResult && (
            <button
              onClick={handleApplyResult}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-xl hover:brightness-110 transition"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>Send Image Request to Pharmacists</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
