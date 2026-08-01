import React from 'react';
import { 
  Pill, 
  Search, 
  Store, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Globe, 
  MapPin, 
  Lock,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

export const Header: React.FC = () => {
  const { 
    currentRole, 
    setRole, 
    language, 
    setLanguage, 
    darkMode, 
    toggleDarkMode, 
    userLocation,
    detectLiveLocation,
    isAdminAuthenticated,
    isPharmacistRegistered
  } = useAppStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const languagesList: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slateDark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setRole('patient')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-glow">
              <Pill className="w-6 h-6 transform -rotate-45" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-md border border-brand-500/20">
                  INDIA RADAR
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Role Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setRole('patient')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'patient'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.patientPortal}</span>
            </button>

            <button
              onClick={() => setRole('pharmacist')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'pharmacist'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.pharmacistPortal}</span>
              {!isPharmacistRegistered && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Registration Required" />
              )}
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.adminPortal}</span>
              {!isAdminAuthenticated && (
                <span title="Locked with Password">
                  <Lock className="w-3 h-3 text-amber-500" />
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Tools: Live GPS Location, Language, Dark Mode */}
          <div className="flex items-center space-x-3">
            
            {/* Live Location Detector & City Selector Pill */}
            <div className="flex items-center space-x-1">
              <button
                onClick={detectLiveLocation}
                title="Click to detect live GPS location"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-bold transition shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                <span className="max-w-[130px] truncate">
                  {userLocation.isLiveGps ? userLocation.addressName : 'Live GPS'}
                </span>
              </button>

              {/* City Quick Fallback Selector */}
              <div className="relative group">
                <button
                  title="Select City Fallback"
                  className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[100px] truncate">{userLocation.addressName.split(',')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <div className="absolute right-0 mt-1 w-52 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                    Select Indian City Radar
                  </div>
                  {[
                    { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
                    { name: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
                    { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
                    { name: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347 },
                    { name: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
                    { name: 'Park Street, Kolkata', lat: 22.5539, lng: 88.3524 },
                    { name: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
                    { name: 'Navrangpura, Ahmedabad', lat: 23.0368, lng: 72.5611 }
                  ].map((city) => (
                    <button
                      key={city.name}
                      onClick={() => useAppStore.getState().setUserLocation(city.lat, city.lng, city.name, false)}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-500 font-medium transition flex items-center justify-between"
                    >
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition">
                <Globe className="w-3.5 h-3.5 text-brand-500" />
                <span className="uppercase font-bold">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 w-48 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition ${
                      language === lang.code
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setRole('patient')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold ${
              currentRole === 'patient' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            onClick={() => setRole('pharmacist')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold ${
              currentRole === 'pharmacist' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Pharmacist</span>
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold ${
              currentRole === 'admin' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
};
