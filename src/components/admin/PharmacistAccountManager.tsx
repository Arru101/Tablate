import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Edit, 
  Trash2, 
  KeyRound, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Power
} from 'lucide-react';
import { Pharmacy } from '../../types';
import { useAppStore } from '../../store/useAppStore';

export const PharmacistAccountManager: React.FC = () => {
  const { 
    pharmacies, 
    updatePharmacyDetails, 
    resetPharmacistPassword, 
    deletePharmacyPermanently,
    togglePharmacyOnlineStatus,
    togglePharmacyVerificationBadge,
    showToast 
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Store Details Modal State
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    drugLicenseNo: '',
    timings: ''
  });

  // Password Reset Modal State
  const [passResetPharmacy, setPassResetPharmacy] = useState<Pharmacy | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Delete Store Modal State
  const [deleteConfirmPharmacy, setDeleteConfirmPharmacy] = useState<Pharmacy | null>(null);

  const filteredPharmacies = pharmacies.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.userId && p.userId.toLowerCase().includes(q)) ||
      (p.drugLicenseNo && p.drugLicenseNo.toLowerCase().includes(q))
    );
  });

  const handleStartEdit = (p: Pharmacy) => {
    setEditingPharmacy(p);
    setEditForm({
      name: p.name,
      ownerName: p.ownerName,
      phone: p.phone,
      address: p.address,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      drugLicenseNo: p.drugLicenseNo || '',
      timings: p.timings || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacy) return;
    updatePharmacyDetails(editingPharmacy.id, {
      name: editForm.name,
      ownerName: editForm.ownerName,
      phone: editForm.phone,
      address: editForm.address,
      city: editForm.city,
      state: editForm.state,
      pincode: editForm.pincode,
      drugLicenseNo: editForm.drugLicenseNo,
      timings: editForm.timings
    });
    setEditingPharmacy(null);
  };

  const handleSavePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passResetPharmacy || !newPassword.trim()) return;
    resetPharmacistPassword(passResetPharmacy.id, newPassword.trim());
    setPassResetPharmacy(null);
    setNewPassword('');
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmPharmacy) return;
    deletePharmacyPermanently(deleteConfirmPharmacy.id);
    setDeleteConfirmPharmacy(null);
  };

  return (
    <div className="bg-white dark:bg-slateDark-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-500">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Registered Pharmacists Account Manager
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit store address on map, reset passwords, or revoke licenses permanently.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search store, city, license..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Responsive Data Table with Horizontal Scroll for Mobile */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Pharmacy & User ID</th>
              <th className="p-3.5">Drug License</th>
              <th className="p-3.5">Full Address (Map Position)</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {filteredPharmacies.map((pharm) => (
              <tr key={pharm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                
                <td className="p-3.5">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {pharm.name}
                    {pharm.verifiedBadge && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400 font-bold">
                    User ID: {pharm.userId || pharm.id}
                  </div>
                  <div className="text-[10px] text-slate-400">Owner: {pharm.ownerName}</div>
                </td>

                <td className="p-3.5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {pharm.drugLicenseNo || pharm.licenseNumber}
                </td>

                <td className="p-3.5 max-w-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 inline mr-1" />
                    {pharm.address}, {pharm.city} ({pharm.pincode})
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    GPS: {pharm.lat.toFixed(3)}, {pharm.lng.toFixed(3)}
                  </div>
                </td>

                <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                  {pharm.phone}
                </td>

                <td className="p-3.5">
                  <button
                    onClick={() => togglePharmacyOnlineStatus(pharm.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                      pharm.isOpenNow
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}
                  >
                    {pharm.isOpenNow ? '🟢 Online' : '🔴 Offline'}
                  </button>
                </td>

                <td className="p-3.5 text-right space-x-1.5 shrink-0">
                  
                  {/* Approve / Toggle Verification Badge */}
                  <button
                    onClick={() => togglePharmacyVerificationBadge(pharm.id)}
                    title={pharm.verifiedBadge ? 'Verified Store (Click to Revoke Verification)' : 'Approve & Activate Verified Badge'}
                    className={`p-1.5 rounded-xl font-bold text-xs transition ${
                      pharm.verifiedBadge
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 inline mr-1" />
                    {pharm.verifiedBadge ? 'Verified' : 'Approve'}
                  </button>

                  {/* Edit Store Profile & Address */}
                  <button
                    onClick={() => handleStartEdit(pharm)}
                    title="Edit Store Profile & Address"
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-600 dark:text-slate-300 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Reset Password */}
                  <button
                    onClick={() => setPassResetPharmacy(pharm)}
                    title="Reset Password"
                    className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-300 hover:text-white transition"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  {/* Revoke & Permanently Delete Store */}
                  <button
                    onClick={() => setDeleteConfirmPharmacy(pharm)}
                    title="Revoke & Delete Permanently"
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Address & Profile Modal */}
      {editingPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Edit Store Address & Profile — {editingPharmacy.name}
              </h3>
              <button onClick={() => setEditingPharmacy(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Drug License (20B/21B)</label>
                  <input
                    type="text"
                    required
                    value={editForm.drugLicenseNo}
                    onChange={(e) => setEditForm({ ...editForm, drugLicenseNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPharmacy(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Store Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passResetPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Reset Pharmacist Password
                </h3>
              </div>
              <button onClick={() => setPassResetPharmacy(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Set a new password for <strong className="text-slate-900 dark:text-slate-100">{passResetPharmacy.name}</strong> (User ID: <span className="font-mono text-brand-500">{passResetPharmacy.userId || passResetPharmacy.id}</span>).
            </p>

            <form onSubmit={handleSavePasswordReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPassResetPharmacy(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-500/30 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Permanently Revoke Store License?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently revoke and delete <strong className="text-rose-500">{deleteConfirmPharmacy.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmPharmacy(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Yes, Delete Store Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
