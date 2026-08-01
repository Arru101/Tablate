import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  Radio, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  UserCheck,
  Building2,
  FileText,
  Phone,
  MapPin,
  Sparkles,
  LogOut,
  Clock,
  MessageSquare,
  RefreshCw,
  XCircle,
  UploadCloud,
  Power,
  KeyRound,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { LiveRadar } from '../components/pharmacist/LiveRadar';
import { InventoryManager } from '../components/pharmacist/InventoryManager';
import { KYCOnboardingModal } from '../components/pharmacist/KYCOnboardingModal';
import { useAppStore } from '../store/useAppStore';

export const PharmacistView: React.FC = () => {
  const { 
    isPharmacistRegistered, 
    pharmacistStore, 
    registerPharmacistStore, 
    loginPharmacist,
    logoutPharmacist, 
    togglePharmacyOnlineStatus,
    updatePharmacyDetails,
    pharmacies,
    kycQueue 
  } = useAppStore();

  const [showKYCModal, setShowKYCModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'inventory'>('radar');
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [regSuccessBanner, setRegSuccessBanner] = useState('');

  // Quick Registration Form State (Pharmacist decides custom User ID & Password)
  const [regData, setRegData] = useState({
    userId: 'PHARM-SHARMA101',
    password: 'Password#123',
    name: 'Apollo Chemist & Emergency Store',
    drugLicenseNo: '20B/21B-MH-994411',
    ownerName: 'Rajesh Sharma (PharmD)',
    phone: '+91 98201 12345',
    address: 'Shop 4, Grand Arcade, Bandra West',
    city: 'Mumbai',
    pincode: '400050'
  });

  const [registerError, setRegisterError] = useState('');

  // Edit Store Profile Modal for Pharmacist
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    timings: ''
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccessBanner('');
    const success = loginPharmacist(loginUserId, loginPassword);
    if (!success) {
      setLoginError('Sign-in failed. Incorrect User ID or Password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegSuccessBanner('');

    if (!regData.userId.trim() || !regData.password.trim()) {
      setRegisterError('Please enter your chosen User ID and Password.');
      return;
    }

    const result = registerPharmacistStore({
      userId: regData.userId.trim(),
      password: regData.password.trim(),
      name: regData.name.trim(),
      drugLicenseNo: regData.drugLicenseNo.trim(),
      licenseNumber: `MH-MUM-DL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerName: regData.ownerName.trim(),
      phone: regData.phone.trim(),
      address: regData.address.trim(),
      city: regData.city.trim(),
      pincode: regData.pincode.trim()
    });

    if (result) {
      // Step-by-Step Flow: Switch to Sign In tab with chosen User ID pre-filled!
      setLoginUserId(result.userId);
      setLoginPassword('');
      setRegSuccessBanner(`Account Registration Successful! Please enter your password to Sign In as "${result.userId}".`);
      setAuthMode('signin');
    }
  };

  // Check Pharmacist Store & KYC Verification Status
  const myPharmacy = pharmacistStore || pharmacies[0];
  const myKycSubmission = kycQueue.find(
    (k) =>
      (myPharmacy?.id && k.pharmacyId === myPharmacy.id) ||
      (k.drugLicenseNo && myPharmacy?.drugLicenseNo && k.drugLicenseNo.replace(/[\s-]/g, '').toUpperCase() === myPharmacy.drugLicenseNo.replace(/[\s-]/g, '').toUpperCase()) ||
      (k.licenseNumber && myPharmacy?.licenseNumber && k.licenseNumber.replace(/[\s-]/g, '').toUpperCase() === myPharmacy.licenseNumber.replace(/[\s-]/g, '').toUpperCase()) ||
      (k.ownerName && myPharmacy?.ownerName && k.ownerName.trim().toLowerCase() === myPharmacy.ownerName.trim().toLowerCase())
  );

  const isApproved = Boolean(
    myPharmacy?.verifiedBadge ||
    myKycSubmission?.status === 'approved' ||
    kycQueue.some(
      (k) =>
        k.status === 'approved' &&
        ((myPharmacy?.id && k.pharmacyId === myPharmacy.id) ||
          (k.drugLicenseNo && myPharmacy?.drugLicenseNo && k.drugLicenseNo.replace(/[\s-]/g, '').toUpperCase() === myPharmacy.drugLicenseNo.replace(/[\s-]/g, '').toUpperCase()) ||
          (k.ownerName && myPharmacy?.ownerName && k.ownerName.trim().toLowerCase() === myPharmacy.ownerName.trim().toLowerCase()))
    ) ||
    pharmacies.some((p) => p.verifiedBadge && (p.id === myPharmacy?.id || (p.drugLicenseNo && myPharmacy?.drugLicenseNo && p.drugLicenseNo === myPharmacy.drugLicenseNo)))
  );

  const isPending = Boolean(!isApproved && myKycSubmission?.status === 'pending');
  const isRejected = Boolean(!isApproved && myKycSubmission?.status === 'rejected');
  const hasNotSubmitted = !myKycSubmission && !isApproved;

  const handleOpenPharmacistEditAddress = () => {
    if (!myPharmacy) return;
    setEditAddressForm({
      address: myPharmacy.address,
      city: myPharmacy.city,
      state: myPharmacy.state,
      pincode: myPharmacy.pincode,
      phone: myPharmacy.phone,
      timings: myPharmacy.timings
    });
    setShowEditAddressModal(true);
  };

  const handleSavePharmacistAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPharmacy) return;
    updatePharmacyDetails(myPharmacy.id, {
      address: editAddressForm.address,
      city: editAddressForm.city,
      state: editAddressForm.state,
      pincode: editAddressForm.pincode,
      phone: editAddressForm.phone,
      timings: editAddressForm.timings
    });
    setShowEditAddressModal(false);
  };

  // 1. If Pharmacist is NOT logged in, show Sign In / Register Portal
  if (!isPharmacistRegistered) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-white dark:bg-slateDark-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shadow-glow shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Pharmacist Access Portal
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                  CDSCO SECURE GATE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Register a new pharmacy store with your chosen User ID & Password, then Sign In.
              </p>
            </div>
          </div>
        </div>

        {/* Success Intimation Banner upon Registration */}
        {regSuccessBanner && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{regSuccessBanner}</span>
          </div>
        )}

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              authMode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Step 2: Sign In with Chosen User ID & Password
          </button>

          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              authMode === 'register'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Step 1: Register New Pharmacy Store
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Chosen Pharmacist User ID / Drug License Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginUserId}
                  onChange={(e) => setLoginUserId(e.target.value)}
                  placeholder="Enter your chosen User ID (e.g. PHARM-SHARMA101)..."
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Account Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-mono text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In to Pharmacist Station</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <KeyRound className="w-4 h-4 text-purple-500" />
                Choose Your Pharmacist Credentials (Used to Sign In later):
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Choose Pharmacist User ID</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regData.userId}
                      onChange={(e) => setRegData({ ...regData, userId: e.target.value })}
                      placeholder="e.g. PHARM-SHARMA101"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-500/40 focus:outline-none focus:border-purple-500 font-mono font-extrabold text-purple-600 dark:text-purple-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Choose Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-purple-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="Create secure password..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-500/40 focus:outline-none focus:border-purple-500 font-mono font-extrabold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pharmacy Store Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Drug License Number (20B/21B)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.drugLicenseNo}
                    onChange={(e) => setRegData({ ...regData, drugLicenseNo: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-brand-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registered Pharmacist Name</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.ownerName}
                    onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Address & City</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.address}
                    onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                    placeholder="Street address..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={regData.city}
                    onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                    placeholder="City..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-semibold"
                  />
                </div>
              </div>
            </div>

            {registerError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{registerError}</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Register Account & Proceed to Sign In</span>
              </button>
            </div>
          </form>
        )}

        <KYCOnboardingModal isOpen={showKYCModal} onClose={() => setShowKYCModal(false)} />

      </div>
    );
  }

  // 2. If Registered BUT KYC is NOT APPROVED (Not Submitted, Pending, or Rejected), LOCK dashboard!
  if (!isApproved) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slateDark-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
        
        {isPending ? (
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20 shadow-glow">
            <Clock className="w-8 h-8 animate-spin" />
          </div>
        ) : isRejected ? (
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20 shadow-glow">
            <XCircle className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center border border-blue-500/20 shadow-glow">
            <UploadCloud className="w-8 h-8 text-blue-500 animate-bounce" />
          </div>
        )}

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            isPending
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : isRejected
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
          }`}>
            {isPending
              ? 'KYC Verification Pending CDSCO Admin Audit'
              : isRejected
              ? 'KYC Declined'
              : '5-Document KYC Verification Required'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {myPharmacy.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Pharmacist User ID: <strong className="text-brand-500">{myPharmacy.userId || 'PHARM-REG'}</strong> • License: {myPharmacy.drugLicenseNo}
          </p>
        </div>

        {/* Intimation Comment from Admin */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-brand-500" /> Admin Audit Intimation & Status:
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            "{isPending
              ? myKycSubmission?.adminComments || 'Under audit review by State Licensing Authority.'
              : isRejected
              ? myKycSubmission?.adminComments || myKycSubmission?.rejectionReason || 'Declined: Document photo unreadable or mismatch.'
              : 'Please upload Form 20B/21B Drug License, Owner Passport Photo, Shop Front Photo, Owner Inside Store Photo, and 15-sec Live Video to activate your pharmacist store.'}"
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => setShowKYCModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-xl transition flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>
              {isPending
                ? 'View / Update 5 KYC Uploads'
                : isRejected
                ? 'Re-Upload 5 Mandatory KYC Documents'
                : 'Complete Mandatory 5-Document KYC Now'}
            </span>
          </button>

          <button
            onClick={logoutPharmacist}
            className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold text-xs transition"
          >
            Sign Out
          </button>
        </div>

        <KYCOnboardingModal isOpen={showKYCModal} onClose={() => setShowKYCModal(false)} />

      </div>
    );
  }

  // 3. Fully Approved Pharmacist Dashboard
  return (
    <div className="space-y-8 pb-16">
      
      {/* Store Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-glow shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{myPharmacy.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CDSCO APPROVED & ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                Address: <strong className="text-brand-400">{myPharmacy.address}, {myPharmacy.city}</strong> • License: <strong className="text-brand-400">{myPharmacy.drugLicenseNo}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Edit Address Button for Pharmacist */}
            <button
              onClick={handleOpenPharmacistEditAddress}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold text-xs border border-slate-700 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Update Store Address</span>
            </button>

            {/* Real-Time Online / Offline Toggle Button */}
            <button
              onClick={() => togglePharmacyOnlineStatus(myPharmacy.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition border ${
                myPharmacy.isOpenNow
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Power className={`w-4 h-4 ${myPharmacy.isOpenNow ? 'animate-pulse text-emerald-300' : 'text-slate-400'}`} />
              <span>{myPharmacy.isOpenNow ? 'Store Status: ONLINE' : 'Store Status: OFFLINE'}</span>
            </button>

            <button
              onClick={logoutPharmacist}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Live Radar vs Inventory */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'radar'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Stock Requests Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Store Inventory & Expiry Tracker</span>
          </button>
        </div>
      </section>

      {/* Main Tab Content */}
      {activeTab === 'radar' ? (
        <LiveRadar />
      ) : (
        <InventoryManager />
      )}

      {/* Edit Address Modal for Pharmacist */}
      {showEditAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Update Store Address & Details
                </h3>
              </div>
              <button onClick={() => setShowEditAddressModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePharmacistAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={editAddressForm.address}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.city}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.state}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.pincode}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.phone}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Timings</label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.timings}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, timings: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditAddressModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Address</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
