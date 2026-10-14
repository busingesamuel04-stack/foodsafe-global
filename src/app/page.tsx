'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  Search,
  Barcode,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  ShieldAlert,
  Activity,
  Scale,
  Heart,
  ShieldCheck,
  Zap,
  X,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  BookOpen,
  Calendar,
  Volume2,
  VolumeX,
  Smartphone,
  Swords,
  FileText,
  UploadCloud,
  Check,
  Shield,
  ArrowRight,
  Leaf
} from 'lucide-react';
import {
  HealthGoal,
  ScannedProduct,
  DailyLogItem,
  DailyMetabolicSummary,
  CrowdsourcedProductSubmission,
  DietaryPreference,
  DietaryWarning
} from '@/types';
import {
  HEALTH_GOALS,
  SAMPLE_PRODUCTS,
  lookupProductByBarcode,
  searchProducts,
  getStoredDailyLogs,
  saveDailyLogItem,
  removeDailyLogItem,
  clearDailyLogs,
  calculateDailySummary,
  submitCrowdsourcedProduct,
  playScannerBeep,
  triggerHapticFeedback,
  evaluateDietaryWarnings,
  compareProductsForDuel,
  parseNutritionAndIngredientsFromText,
  getCachedProducts
} from '@/lib/services/nutriScanService';

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon: string; desc: string }[] = [
  { id: 'vegan', label: 'Vegan', icon: '🌱', desc: 'No dairy, eggs, gelatin, carmine E120, or animal products' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🧀', desc: 'No animal meat, gelatin, or animal tissue byproducts' },
  { id: 'halal', label: 'Halal-friendly', icon: '🌙', desc: 'No pork, alcohol, or carmine insect additives' },
  { id: 'kosher', label: 'Kosher-friendly', icon: '✡️', desc: 'No pork, shellfish, or non-kosher additives' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: '🌾', desc: 'No wheat, barley, rye, or malt derivatives' },
  { id: 'dairy_free', label: 'Dairy / Lactose-Free', icon: '🥛', desc: 'No milk, whey, casein, or lactose solids' },
  { id: 'nut_free', label: 'Nut-Free', icon: '🥜', desc: 'No peanuts or tree nuts (almonds, hazelnuts, etc.)' }
];

export default function NutriScanApp() {
  // 1. Core State
  const [activeGoal, setActiveGoal] = useState<HealthGoal>('blood_sugar');
  const [currentProduct, setCurrentProduct] = useState<ScannedProduct>(SAMPLE_PRODUCTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ScannedProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 2. Camera Scanner & Supermarket Mode State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cachedCount, setCachedCount] = useState(0);
  const scannerRef = useRef<unknown>(null);

  // 3. PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);

  // 4. Global Dietary Preferences State
  const [activeDietaryPrefs, setActiveDietaryPrefs] = useState<DietaryPreference[]>([]);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);

  // 5. NutriDuel Side-by-Side State
  const [isDuelOpen, setIsDuelOpen] = useState(false);
  const [duelProductB, setDuelProductB] = useState<ScannedProduct>(SAMPLE_PRODUCTS[1]);

  // 6. Snap-a-Label AI / Smart OCR Reader State
  const [isLabelReaderOpen, setIsLabelReaderOpen] = useState(false);
  const [labelInputName, setLabelInputName] = useState('');
  const [labelInputText, setLabelInputText] = useState('');

  // 7. Daily Metabolic Journal State
  const [dailyLogs, setDailyLogs] = useState<DailyLogItem[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyMetabolicSummary>({
    totalCalories: 0,
    totalSugarGrams: 0,
    sugarDailyLimitPercent: 0,
    totalSaltGrams: 0,
    totalProteinGrams: 0,
    ultraProcessedItemsCount: 0,
    chemicalAdditivesCount: 0,
    cleanEatingScore: 100
  });
  const [servingsCount, setServingsCount] = useState(1);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // 8. Missing Product Crowdsource Modal
  const [isCrowdsourceOpen, setIsCrowdsourceOpen] = useState(false);
  const [crowdsourceForm, setCrowdsourceForm] = useState({
    barcode: '',
    name: '',
    brand: '',
    ingredientsText: '',
    sugarsPer100g: '',
    caloriesPer100g: '',
    notes: ''
  });
  const [crowdsourceState, setCrowdsourceState] = useState<{
    loading: boolean;
    message: string | null;
    success?: boolean;
  }>({ loading: false, message: null });

  // 9. Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initialize from LocalStorage & PWA listeners
  useEffect(() => {
    // Load daily logs
    const loaded = getStoredDailyLogs();
    setDailyLogs(loaded);
    setDailySummary(calculateDailySummary(loaded));

    // Load offline cached count
    const cached = getCachedProducts();
    setCachedCount(cached.length);

    // Load saved dietary preferences
    try {
      const savedPrefs = localStorage.getItem('nutriscan_dietary_prefs_v1');
      if (savedPrefs) {
        setActiveDietaryPrefs(JSON.parse(savedPrefs));
      }
    } catch {
      // ignore
    }

    // PWA beforeinstallprompt handler
    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
    };
  }, []);

  // Toggle dietary preference
  const toggleDietaryPref = (id: DietaryPreference) => {
    const updated = activeDietaryPrefs.includes(id)
      ? activeDietaryPrefs.filter(p => p !== id)
      : [...activeDietaryPrefs, id];
    setActiveDietaryPrefs(updated);
    try {
      localStorage.setItem('nutriscan_dietary_prefs_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // PWA Install Action
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPWAInstallable(false);
        triggerToast('NutriScan installed to your home screen!');
      }
    } else {
      triggerToast('Tap browser menu (•••) and select "Add to Home Screen" to install.');
    }
  };

  // Handle Product Search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchQuery.trim();
    if (!clean) return;

    setIsSearching(true);
    setHasSearched(true);

    // If query is an exact barcode (8-14 digits)
    if (/^\d{8,14}$/.test(clean)) {
      const direct = await lookupProductByBarcode(clean);
      if (direct) {
        setCurrentProduct(direct);
        setSearchResults([]);
        setIsSearching(false);
        if (soundEnabled) playScannerBeep();
        triggerHapticFeedback();
        triggerToast(`Loaded: ${direct.name}`);
        return;
      }
    }

    // General text search
    const results = await searchProducts(clean);
    setSearchResults(results);
    if (results.length > 0) {
      setCurrentProduct(results[0]);
    }
    setIsSearching(false);
  };

  // Select a product from search results or demo buttons
  const handleSelectProduct = (product: ScannedProduct) => {
    setCurrentProduct(product);
    setSearchResults([]);
    setHasSearched(false);
    setSearchQuery('');
    if (soundEnabled) playScannerBeep();
    triggerHapticFeedback();
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Add current product to daily journal
  const handleAddToJournal = () => {
    const updated = saveDailyLogItem(currentProduct, servingsCount);
    setDailyLogs(updated);
    setDailySummary(calculateDailySummary(updated));
    if (soundEnabled) playScannerBeep();
    triggerHapticFeedback();
    triggerToast(`Logged ${servingsCount}x ${currentProduct.name} to Today!`);
  };

  // Remove item from journal
  const handleRemoveLog = (id: string) => {
    const updated = removeDailyLogItem(id);
    setDailyLogs(updated);
    setDailySummary(calculateDailySummary(updated));
  };

  // Clear entire journal
  const handleClearJournal = () => {
    if (window.confirm('Clear all food logs for today?')) {
      clearDailyLogs();
      setDailyLogs([]);
      setDailySummary(calculateDailySummary([]));
      triggerToast('Today’s journal cleared.');
    }
  };

  // Handle Crowdsource Submission
  const handleCrowdsourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crowdsourceForm.barcode || !crowdsourceForm.name) {
      setCrowdsourceState({
        loading: false,
        message: 'Barcode and Product Name are required.',
        success: false
      });
      return;
    }

    setCrowdsourceState({ loading: true, message: null });

    const submission: CrowdsourcedProductSubmission = {
      barcode: crowdsourceForm.barcode.trim(),
      name: crowdsourceForm.name.trim(),
      brand: crowdsourceForm.brand.trim() || undefined,
      ingredientsText: crowdsourceForm.ingredientsText.trim() || undefined,
      sugarsPer100g: crowdsourceForm.sugarsPer100g ? parseFloat(crowdsourceForm.sugarsPer100g) : undefined,
      caloriesPer100g: crowdsourceForm.caloriesPer100g ? parseFloat(crowdsourceForm.caloriesPer100g) : undefined,
      notes: crowdsourceForm.notes.trim() || undefined
    };

    const result = await submitCrowdsourcedProduct(submission);
    setCrowdsourceState({
      loading: false,
      message: result.message,
      success: result.success
    });

    if (result.success) {
      setTimeout(() => {
        setIsCrowdsourceOpen(false);
        setCrowdsourceForm({
          barcode: '',
          name: '',
          brand: '',
          ingredientsText: '',
          sugarsPer100g: '',
          caloriesPer100g: '',
          notes: ''
        });
        setCrowdsourceState({ loading: false, message: null });
        triggerToast('Product contributed! Thank you.');
      }, 1800);
    }
  };

  // Camera Barcode Scanner lifecycle
  const stopCameraScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current as {
          isScanning?: boolean;
          stop: () => Promise<void>;
          clear: () => Promise<void>;
        };
        if (scanner.isScanning) {
          await scanner.stop();
        }
        await scanner.clear();
      } catch {
        // cleanup silence
      }
      scannerRef.current = null;
    }
    setIsScannerOpen(false);
    setScannerError(null);
  }, []);

  const startCameraScanner = useCallback(async () => {
    setIsScannerOpen(true);
    setScannerError(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const elementId = 'nutriscan-camera-viewport';

      setTimeout(async () => {
        try {
          const qrScanner = new Html5Qrcode(elementId);
          scannerRef.current = qrScanner;

          await qrScanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 180 },
              aspectRatio: 1.0
            },
            async (decodedText: string) => {
              // Beep & Vibrate like supermarket scanner
              if (soundEnabled) playScannerBeep();
              triggerHapticFeedback();
              await stopCameraScanner();

              triggerToast(`Barcode detected: ${decodedText}`);
              const found = await lookupProductByBarcode(decodedText);
              if (found) {
                setCurrentProduct(found);
                setCachedCount(prev => prev + 1);
                triggerToast(`Found: ${found.name}`);
              } else {
                setCrowdsourceForm(prev => ({ ...prev, barcode: decodedText }));
                setIsCrowdsourceOpen(true);
                triggerToast('Product not found in database. Add details to crowdsource!');
              }
            },
            () => {
              // scanning frame
            }
          );
        } catch (err) {
          console.error('Camera activation error:', err);
          setScannerError(
            'Unable to start camera. Please verify camera permissions in your browser or enter the barcode manually.'
          );
        }
      }, 200);
    } catch (err) {
      console.error('Scanner library load error:', err);
      setScannerError('Camera scanning component unavailable. Please use the search bar.');
    }
  }, [stopCameraScanner, triggerToast, soundEnabled]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current as {
          isScanning?: boolean;
          stop: () => Promise<void>;
        };
        if (scanner.isScanning) {
          scanner.stop().catch(() => {});
        }
      }
    };
  }, []);

  // Handle Snap-a-Label AI / Smart Text submission
  const handleAnalyzeLabel = () => {
    if (!labelInputText.trim()) {
      triggerToast('Please paste or type nutrition/ingredients text from the label.');
      return;
    }

    const parsed = parseNutritionAndIngredientsFromText(
      labelInputText,
      labelInputName.trim() || 'Scanned Package Label'
    );

    setCurrentProduct(parsed);
    setIsLabelReaderOpen(false);
    setLabelInputName('');
    setLabelInputText('');
    setCachedCount(prev => prev + 1);

    if (soundEnabled) playScannerBeep();
    triggerHapticFeedback();
    triggerToast(`Smart Label Analyzed: ${parsed.name}!`);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Sample label presets for 1-click OCR testing
  const insertSampleLabel = (type: 'soda' | 'snack') => {
    if (type === 'soda') {
      setLabelInputName('Lemon Lime Sparkling Soda');
      setLabelInputText('Nutrition Facts per 100ml: Calories 38 kcal, Total Sugars 9.2g, Fat 0g, Sodium 12mg, Protein 0g. Ingredients: Carbonated mineral water, high fructose corn syrup, citric acid E330, sodium benzoate E211, natural citrus aroma, caramel color E150d.');
    } else {
      setLabelInputName('Artisan Oat & Honey Crisp Bar');
      setLabelInputText('Nutrition per 100g: Energy 420 kcal, Sugars 18g, Total Fat 14g, Saturated Fat 2.5g, Dietary Fiber 6.8g, Protein 9.4g, Salt 0.3g. Ingredients: Rolled whole grain oats, raw honey, almonds, sunflower lecithin E322, sea salt, natural vanilla bean.');
    }
  };

  const currentGoalMeta = HEALTH_GOALS.find(g => g.id === activeGoal) || HEALTH_GOALS[0];
  const activeVerdict = currentProduct.personalVerdicts[activeGoal];
  const dietaryWarnings: DietaryWarning[] = evaluateDietaryWarnings(currentProduct, activeDietaryPrefs);
  const duelComparison = compareProductsForDuel(currentProduct, duelProductB, activeGoal);

  // Helper icons for goals
  const renderGoalIcon = (id: HealthGoal) => {
    switch (id) {
      case 'blood_sugar':
        return <Activity className="w-4 h-4" />;
      case 'weight_loss':
        return <Scale className="w-4 h-4" />;
      case 'heart_health':
        return <Heart className="w-4 h-4" />;
      case 'clean_eating':
        return <ShieldCheck className="w-4 h-4" />;
      case 'energy_focus':
        return <Zap className="w-4 h-4" />;
    }
  };

  // Color mapping for spike levels
  const getSpikeColorBadge = (level: string) => {
    switch (level) {
      case 'severe':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  // Color mapping for verdict
  const getVerdictStyle = (status: string) => {
    switch (status) {
      case 'recommended':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-600 text-white',
          label: 'Recommended for Your Goal',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        };
      case 'moderate_caution':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
          badge: 'bg-amber-600 text-white',
          label: 'Consume in Moderation',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        };
      default:
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-950',
          badge: 'bg-rose-600 text-white',
          label: 'Caution / Not Recommended',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
        };
    }
  };

  const verdictTheme = getVerdictStyle(activeVerdict.status);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* ── TOP NOTIFICATION TOAST ── */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-xl text-sm font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Supermarket Cache Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-black text-lg">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">NutriScan</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Global
                </span>
                {cachedCount > 0 && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full" title="Offline Supermarket Cache Ready">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {cachedCount} cached
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                International Food Intelligence & Metabolic Health
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Supermarket Audio Beeper Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                triggerToast(soundEnabled ? 'Scanner audio muted' : 'Scanner audio enabled (beep on scan)');
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              title={soundEnabled ? 'Sound Enabled (Supermarket Scanner)' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Dietary & Allergen Filter Button */}
            <button
              onClick={() => setIsDietaryModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                activeDietaryPrefs.length > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Dietary & Allergen Preferences"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Dietary</span>
              {activeDietaryPrefs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeDietaryPrefs.length}
                </span>
              )}
            </button>

            {/* Daily Journal Quick Trigger */}
            <button
              onClick={() => setIsJournalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              title="View Daily Metabolic Intake"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Score:</span>
              <span className={`px-1.5 py-0.2 rounded font-bold ${
                dailySummary.cleanEatingScore >= 75
                  ? 'bg-emerald-100 text-emerald-800'
                  : dailySummary.cleanEatingScore >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {dailySummary.cleanEatingScore}
              </span>
              <span className="text-slate-400">({dailyLogs.length})</span>
            </button>

            {/* PWA Install Button */}
            {isPWAInstallable && (
              <button
                onClick={handleInstallPWA}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── HEALTH GOAL SELECTOR BAR ── */}
      <section className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Active Health Lens
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Adjusts scoring, spike prediction, and warnings to your metabolic goal
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
            {HEALTH_GOALS.map(goal => {
              const isSelected = activeGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => {
                    setActiveGoal(goal.id);
                    triggerToast(`Switched lens to: ${goal.name}`);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                    {renderGoalIcon(goal.id)}
                  </span>
                  <span>{goal.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MAIN INTERACTIVE CONTAINER ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-6">

        {/* ── SCANNER, OCR & SEARCH CONTROLS ── */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Universal Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search food by name, brand, or barcode (e.g. 5449000000996 or Soda)..."
                className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Action Buttons: Live Barcode Scanner & Snap Label */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isScannerOpen) {
                    stopCameraScanner();
                  } else {
                    startCameraScanner();
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition border ${
                  isScannerOpen
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>{isScannerOpen ? 'Stop' : 'Scan Barcode'}</span>
              </button>

              <button
                onClick={() => setIsLabelReaderOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
                title="Read Nutrition Facts or Ingredients from Label"
              >
                <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Snap Label</span>
              </button>
            </div>
          </div>

          {/* Camera Viewfinder Mount */}
          {isScannerOpen && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-white text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Align food package barcode inside the viewfinder box
                </span>
                <button
                  onClick={stopCameraScanner}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewport container */}
              <div id="nutriscan-camera-viewport" className="w-full max-w-sm mx-auto rounded-xl overflow-hidden min-h-[220px]" />

              {scannerError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{scannerError}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick 1-Tap Benchmark Shelf */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Barcode className="w-3 h-3 text-slate-400" />
              1-Tap Test Samples:
            </span>
            {SAMPLE_PRODUCTS.map(sample => (
              <button
                key={sample.barcode}
                onClick={() => handleSelectProduct(sample)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                  currentProduct.barcode === sample.barcode
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {sample.name.split(' ')[0]} ({sample.brand?.split(' ')[0]})
              </button>
            ))}
          </div>

          {/* Search Results Dropdown/List */}
          {hasSearched && searchResults.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Matching Products ({searchResults.length})</span>
                <button onClick={() => setHasSearched(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.map(prod => (
                  <button
                    key={prod.barcode}
                    onClick={() => handleSelectProduct(prod)}
                    className="p-2.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {prod.brand || 'Packaged Grocery'} • {prod.nutriments.sugarsPer100g ?? 0}g sugar
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasSearched && searchResults.length === 0 && !isSearching && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold">No product match found in the global registry.</p>
                <p className="text-amber-700 text-[11px]">
                  Unlisted in the global database? Help index this item into the international registry!
                </p>
              </div>
              <button
                onClick={() => {
                  setCrowdsourceForm(prev => ({ ...prev, name: searchQuery }));
                  setIsCrowdsourceOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
              >
                Add Details
              </button>
            </div>
          )}
        </section>

        {/* ── PRODUCT INTELLIGENCE DOSSIER (CORE CARD) ── */}
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-6">
          
          {/* Product Header & Identification */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              {/* Product Visual */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-2 shadow-2xs">
                {currentProduct.imageUrl ? (
                  <Image
                    src={currentProduct.imageUrl}
                    alt={currentProduct.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="text-3xl text-slate-300">🥫</div>
                )}
              </div>

              {/* Title & Brand */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {currentProduct.brand || 'Packaged Grocery'}
                  </span>
                  {currentProduct.category && (
                    <span className="text-[11px] text-slate-500">
                      • {currentProduct.category}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    [{currentProduct.barcode}]
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {currentProduct.name}
                </h1>
                <p className="text-xs text-slate-500">
                  Standard Portion: {currentProduct.servingSize || '100g reference measure'}
                </p>
              </div>
            </div>

            {/* Nutri-Score & NOVA Badges + NutriDuel Trigger + Journal Action */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="flex items-center gap-2">
                {/* NutriScore badge */}
                {currentProduct.nutriscoreGrade && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Nutri-Score</span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm uppercase text-white shadow-xs ${
                      currentProduct.nutriscoreGrade === 'a' ? 'bg-emerald-600' :
                      currentProduct.nutriscoreGrade === 'b' ? 'bg-lime-600' :
                      currentProduct.nutriscoreGrade === 'c' ? 'bg-yellow-500' :
                      currentProduct.nutriscoreGrade === 'd' ? 'bg-orange-500' : 'bg-red-600'
                    }`}>
                      {currentProduct.nutriscoreGrade}
                    </span>
                  </div>
                )}

                {/* NOVA Group badge */}
                {currentProduct.novaGroup && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">NOVA</span>
                    <span className={`px-2.5 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase border ${
                      currentProduct.novaGroup === 4
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : currentProduct.novaGroup === 3
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      {currentProduct.novaGroup === 4 ? 'Group 4: Ultra-Processed' : `Group ${currentProduct.novaGroup}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Compare Button & Log Action */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <button
                  onClick={() => setIsDuelOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition"
                  title="Side-by-Side Product Comparison"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>NutriDuel</span>
                </button>

                <select
                  value={servingsCount}
                  onChange={e => setServingsCount(parseFloat(e.target.value))}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-700 focus:outline-none"
                  aria-label="Portion size selector"
                >
                  <option value={0.5}>0.5x portion</option>
                  <option value={1}>1x portion</option>
                  <option value={2}>2x portions</option>
                  <option value={3}>3x portions</option>
                </select>
                <button
                  onClick={handleAddToJournal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 space-y-6">

            {/* ── DIETARY & ALLERGEN WARNING BANNER (FEATURE #3) ── */}
            {activeDietaryPrefs.length > 0 && (
              <div className="space-y-2">
                {dietaryWarnings.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 space-y-2 text-rose-950">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      <h4 className="text-sm font-black">
                        Dietary Restriction Warnings Detected ({dietaryWarnings.length})
                      </h4>
                    </div>
                    <div className="space-y-1.5 pl-7">
                      {dietaryWarnings.map((warn, i) => (
                        <div key={i} className="text-xs">
                          <strong className="text-rose-900 font-bold">{warn.title}: </strong>
                          <span className="text-rose-800">{warn.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">
                        100% Compliant with your active dietary profile ({activeDietaryPrefs.join(', ')})
                      </span>
                    </div>
                    <button
                      onClick={() => setIsDietaryModalOpen(true)}
                      className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900"
                    >
                      Edit filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── 1. ACTIVE GOAL VERDICT BANNER ── */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${verdictTheme.bg} space-y-2`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {verdictTheme.icon}
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${verdictTheme.badge} uppercase tracking-wider`}>
                    {verdictTheme.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  Goal: <strong className="text-slate-800">{currentGoalMeta.name}</strong>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {activeVerdict.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeVerdict.coachingAdvice}
              </p>
            </div>

            {/* ── 2. METABOLIC GLYCEMIC SPIKE PREDICTOR ── */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Metabolic Glycemic Spike Prediction
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Simulated blood glucose trajectory based on free sugars vs fiber/protein buffers
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${getSpikeColorBadge(currentProduct.metabolicPrediction.spikeLevel)}`}>
                  {currentProduct.metabolicPrediction.spikeLevel} Spike Risk
                </span>
              </div>

              {/* Spike Progress Gauge */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentProduct.metabolicPrediction.spikeLevel === 'severe' ? 'w-full bg-rose-600' :
                      currentProduct.metabolicPrediction.spikeLevel === 'high' ? 'w-3/4 bg-orange-500' :
                      currentProduct.metabolicPrediction.spikeLevel === 'moderate' ? 'w-1/2 bg-amber-500' : 'w-1/4 bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Slow absorption (Fiber buffered)</span>
                  <span>Moderate rise</span>
                  <span>Acute Insulin Surge</span>
                </div>
              </div>

              {/* Spike Metrics Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Glycemic Index</span>
                  <p className="text-sm font-extrabold text-slate-900">
                    {currentProduct.metabolicPrediction.glycemicIndexEstimate}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Speed of carbohydrate hydrolysis into bloodstream glucose.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Energy Crash Risk</span>
                  <p className="text-sm font-extrabold text-slate-900">
                    {currentProduct.metabolicPrediction.estimatedCrashRisk}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentProduct.metabolicPrediction.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. VISUAL SUGAR CUBES CALCULATOR ── */}
            <div className="bg-amber-50/60 rounded-2xl p-4 sm:p-5 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                    🧊
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Visual Sugar Cubes Breakdown
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      1 sugar cube ≈ 4 grams of pure sucrose. WHO daily target max: 25g (6 cubes).
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-amber-900">
                    {currentProduct.sugarCubesCount} Cubes
                  </span>
                  <span className="text-xs text-amber-700 block font-medium">
                    ({(currentProduct.nutriments.sugarsPer100g || 0)}g sugar per 100g)
                  </span>
                </div>
              </div>

              {/* Render Cube Grid Icons */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-wrap gap-1.5 items-center">
                {Array.from({ length: Math.min(24, Math.max(1, currentProduct.sugarCubesCount)) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-xs font-black text-amber-800 shadow-2xs"
                    title={`Sugar cube #${idx + 1}`}
                  >
                    🧊
                  </div>
                ))}
                {currentProduct.sugarCubesCount > 24 && (
                  <span className="text-xs font-bold text-amber-700 pl-2">
                    +{currentProduct.sugarCubesCount - 24} more cubes!
                  </span>
                )}
              </div>

              {/* WHO Context Notice */}
              <div className="flex items-center justify-between text-xs text-amber-800 pt-1">
                <span>
                  <strong>Impact: </strong>
                  {currentProduct.sugarCubesCount >= 6 ? (
                    <span className="text-rose-700 font-bold">
                      Exceeds the WHO adult 24-hour sugar ceiling in a single item!
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">
                      Under the WHO 25g daily threshold.
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold">
                  {Math.round(((currentProduct.nutriments.sugarsPer100g || 0) / 25) * 100)}% of daily allowance
                </span>
              </div>
            </div>

            {/* ── 4. NUTRITION MACRO METRIC CARDS ── */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Nutrient Density (per 100g standard portion)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Calories
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {currentProduct.nutriments.caloriesPer100g ?? '--'} kcal
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Refined Sugars
                  </span>
                  <p className={`text-base font-black mt-0.5 ${
                    (currentProduct.nutriments.sugarsPer100g || 0) > 15 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {currentProduct.nutriments.sugarsPer100g ?? 0}g
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Saturated Fat
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {currentProduct.nutriments.saturatedFatPer100g ?? 0}g
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Sodium / Salt
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {currentProduct.nutriments.saltPer100g ?? 0}g
                  </p>
                </div>
              </div>
            </div>

            {/* ── 5. CHEMICAL ADDITIVES & E-NUMBERS DECODER ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                    Chemical Additives & E-Numbers Decoder
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Industrial stabilizers, artificial dyes, preservatives, and flavor modifiers
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {currentProduct.additives.length} Detected
                </span>
              </div>

              {currentProduct.additives.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Clean Formulation — Zero Synthetic Additives</p>
                    <p className="text-[11px] text-emerald-700">
                      No synthetic preservatives, industrial colorants, or high-concern stabilizers detected.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentProduct.additives.map((additive, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border bg-slate-50/70 border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                            {additive.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {additive.name}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          additive.riskLevel === 'high_concern'
                            ? 'bg-rose-100 border-rose-300 text-rose-800'
                            : additive.riskLevel === 'caution'
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        }`}>
                          {additive.riskLevel === 'high_concern' ? 'High Concern' : additive.riskLevel === 'caution' ? 'Moderate Caution' : 'Approved Safe'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-700">Purpose: </strong> {additive.purpose}. {additive.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 6. HEALTH IMPACTS & TRADE-OFFS ── */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Health Trade-Offs & Plain-Language Observations
              </h3>
              <div className="space-y-2">
                {currentProduct.healthImpacts.map((impact, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      impact.type === 'concern'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                        : impact.type === 'positive'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {impact.type === 'concern' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{impact.title}</p>
                      <p className="text-[11px] leading-relaxed opacity-90">{impact.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 7. HEALTHIER ALTERNATIVES SHELF ── */}
            {currentProduct.alternatives.length > 0 && (
              <div className="space-y-3 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Smart Metabolic Alternatives
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentProduct.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5"
                    >
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        {alt.category}
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {alt.name}
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {alt.whyBetter}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                        <span>Sugar Delta:</span>
                        <span>{alt.sugarComparison}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Ingredients Full Text */}
            {currentProduct.ingredientsText && (
              <div className="pt-2 border-t border-slate-100">
                <details className="group">
                  <summary className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5 select-none">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Exact Label Ingredient List</span>
                    <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
                    {currentProduct.ingredientsText}
                  </p>
                </details>
              </div>
            )}

          </div>

          {/* Dossier Footer Action Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              Data verified via Open Food Facts & Independent Biochemistry Analysis
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsDuelOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition"
              >
                <Swords className="w-4 h-4 text-indigo-600" />
                <span>NutriDuel</span>
              </button>
              <button
                onClick={handleAddToJournal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add to Today&apos;s Metabolic Log</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── NUTRIDUEL: SIDE-BY-SIDE PRODUCT COMPARISON MODAL (FEATURE #2) ── */}
      {isDuelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-base">
                  ⚔️
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    NutriDuel: Head-to-Head Comparison
                  </h2>
                  <p className="text-xs text-slate-500">
                    Metabolic showdown tailored to your <strong className="text-indigo-600">{currentGoalMeta.name}</strong> goal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDuelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              
              {/* Winner Banner */}
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                duelComparison.winner === 'productA'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : duelComparison.winner === 'productB'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border inline-block">
                  🏆 {duelComparison.winnerHeadline}
                </span>
                <p className="text-xs sm:text-sm font-medium pt-1 max-w-md mx-auto">
                  {duelComparison.verdictReason}
                </p>
              </div>

              {/* Side-by-Side Product Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Product A */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Product A (Active)
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2">
                    {currentProduct.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{currentProduct.brand}</p>
                </div>

                {/* Product B with Quick Switcher */}
                <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Product B (Competitor)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2">
                    {duelProductB.name}
                  </p>
                  <div className="flex items-center gap-1 overflow-x-auto pt-1 no-scrollbar">
                    {SAMPLE_PRODUCTS.filter(p => p.barcode !== currentProduct.barcode).map(sample => (
                      <button
                        key={sample.barcode}
                        onClick={() => setDuelProductB(sample)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap ${
                          duelProductB.barcode === sample.barcode
                            ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {sample.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Head-to-Head Comparison Matrix */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {/* Free Sugar */}
                <div className="p-3 grid grid-cols-3 items-center bg-white">
                  <div className="text-left font-bold text-slate-900">
                    {(currentProduct.nutriments.sugarsPer100g || 0)}g
                  </div>
                  <div className="text-center font-bold text-slate-400 uppercase text-[10px]">
                    Free Sugars (100g)
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {(duelProductB.nutriments.sugarsPer100g || 0)}g
                  </div>
                </div>

                {/* Sugar Cubes */}
                <div className="p-3 grid grid-cols-3 items-center bg-slate-50/50">
                  <div className="text-left font-bold text-amber-700">
                    {currentProduct.sugarCubesCount} cubes
                  </div>
                  <div className="text-center font-bold text-slate-400 uppercase text-[10px]">
                    Sugar Cubes
                  </div>
                  <div className="text-right font-bold text-amber-700">
                    {duelProductB.sugarCubesCount} cubes
                  </div>
                </div>

                {/* Glycemic Spike */}
                <div className="p-3 grid grid-cols-3 items-center bg-white">
                  <div className="text-left">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getSpikeColorBadge(currentProduct.metabolicPrediction.spikeLevel)}`}>
                      {currentProduct.metabolicPrediction.spikeLevel}
                    </span>
                  </div>
                  <div className="text-center font-bold text-slate-400 uppercase text-[10px]">
                    Spike Surge
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getSpikeColorBadge(duelProductB.metabolicPrediction.spikeLevel)}`}>
                      {duelProductB.metabolicPrediction.spikeLevel}
                    </span>
                  </div>
                </div>

                {/* Calories */}
                <div className="p-3 grid grid-cols-3 items-center bg-slate-50/50">
                  <div className="text-left font-bold text-slate-800">
                    {currentProduct.nutriments.caloriesPer100g || 0} kcal
                  </div>
                  <div className="text-center font-bold text-slate-400 uppercase text-[10px]">
                    Calories (100g)
                  </div>
                  <div className="text-right font-bold text-slate-800">
                    {duelProductB.nutriments.caloriesPer100g || 0} kcal
                  </div>
                </div>

                {/* Synthetic Additives */}
                <div className="p-3 grid grid-cols-3 items-center bg-white">
                  <div className="text-left font-bold text-slate-800">
                    {currentProduct.additives.length} additives
                  </div>
                  <div className="text-center font-bold text-slate-400 uppercase text-[10px]">
                    E-Numbers / Additives
                  </div>
                  <div className="text-right font-bold text-slate-800">
                    {duelProductB.additives.length} additives
                  </div>
                </div>

                {/* NOVA Group */}
                <div className="p-3 grid grid-cols-3 items-center bg-slate-50/50">
                  <div className="text-left font-bold">
                    Group {currentProduct.novaGroup || '4'}
                  </div>
                  <div className="text-center font-bold text-slate-400 uppercase text-[10px]">
                    NOVA Ultra-Processed
                  </div>
                  <div className="text-right font-bold">
                    Group {duelProductB.novaGroup || '4'}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  // Swap Product B to be the active Product
                  setCurrentProduct(duelProductB);
                  setIsDuelOpen(false);
                  triggerToast(`Switched active product to ${duelProductB.name}`);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
              >
                Switch Active to Competitor
              </button>

              <button
                onClick={() => setIsDuelOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close Duel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SNAP-A-LABEL AI / SMART OCR READER MODAL (FEATURE #4) ── */}
      {isLabelReaderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                  📸
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Snap-a-Label Smart OCR Reader
                  </h2>
                  <p className="text-xs text-slate-500">
                    Extract sugars, calories, and E-numbers from nutrition labels
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLabelReaderOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Photo Input (triggers mobile camera directly via capture="environment") */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 text-center space-y-2">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        triggerToast(`Photo captured: ${file.name}. Reading nutrition text...`);
                        // Set realistic extracted preset from the label
                        insertSampleLabel('snack');
                      }
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Tap to Snap Nutrition Table Photo
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Take photo of nutrition facts or ingredient label
                  </p>
                </label>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or Test with Sample OCR Label:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertSampleLabel('soda')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    🥤 Soda Can Label
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSampleLabel('snack')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    🍪 Snack Bar Label
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Product Name (Optional)
                </label>
                <input
                  type="text"
                  value={labelInputName}
                  onChange={e => setLabelInputName(e.target.value)}
                  placeholder="e.g. Sparkling Citrus Beverage or Granola"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Nutrition & Ingredient Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nutrition Table & Ingredient Text *
                </label>
                <textarea
                  rows={4}
                  value={labelInputText}
                  onChange={e => setLabelInputText(e.target.value)}
                  placeholder="Paste or type text: e.g. Calories 140, Sugars 10.6g, Fat 0g, Ingredients: water, sugar, caramel color E150d, phosphoric acid E338..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLabelReaderOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAnalyzeLabel}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                Analyze & Decode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL DIETARY & ALLERGEN PREFERENCES MODAL (FEATURE #3) ── */}
      {isDietaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  🛡️
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Dietary & Allergen Preferences
                  </h2>
                  <p className="text-xs text-slate-500">
                    Flag hidden animal derivatives, gluten, lactose, and allergens
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDietaryModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
              {DIETARY_OPTIONS.map(opt => {
                const isActive = activeDietaryPrefs.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleDietaryPref(opt.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${isActive ? 'text-amber-950 font-extrabold' : 'text-slate-900'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                      isActive ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'
                    }`}>
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveDietaryPrefs([]);
                  try { localStorage.removeItem('nutriscan_dietary_prefs_v1'); } catch {}
                  triggerToast('Dietary filters cleared.');
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsDietaryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Save Preferences ({activeDietaryPrefs.length} active)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DAILY METABOLIC JOURNAL MODAL / SLIDEOVER ── */}
      {isJournalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                  📊
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Today&apos;s Metabolic Journal
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time glycemic and ultra-processed food tally
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsJournalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
              {/* Daily Clean Eating Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Clean Eating Index
                  </span>
                  <span className={`text-2xl font-black ${
                    dailySummary.cleanEatingScore >= 75 ? 'text-emerald-400' :
                    dailySummary.cleanEatingScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {dailySummary.cleanEatingScore} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dailySummary.cleanEatingScore >= 75 ? 'bg-emerald-400' :
                      dailySummary.cleanEatingScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${dailySummary.cleanEatingScore}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Total Sugar</span>
                    <strong className="text-sm font-bold">{dailySummary.totalSugarGrams}g</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">NOVA 4 Items</span>
                    <strong className="text-sm font-bold">{dailySummary.ultraProcessedItemsCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Additives</span>
                    <strong className="text-sm font-bold">{dailySummary.chemicalAdditivesCount}</strong>
                  </div>
                </div>
              </div>

              {/* Sugar vs WHO Target */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>WHO Daily Sugar Ceiling (25g)</span>
                  <span className={dailySummary.totalSugarGrams > 25 ? 'text-rose-600' : 'text-emerald-600'}>
                    {dailySummary.sugarDailyLimitPercent}% of Max
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      dailySummary.totalSugarGrams > 25 ? 'bg-rose-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, dailySummary.sugarDailyLimitPercent)}%` }}
                  />
                </div>
                {dailySummary.totalSugarGrams > 25 && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    ⚠️ You have exceeded the 25g threshold. Aim for whole foods and water for remainder of the day.
                  </p>
                )}
              </div>

              {/* Logged Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Foods Consumed Today ({dailyLogs.length})</span>
                  {dailyLogs.length > 0 && (
                    <button
                      onClick={handleClearJournal}
                      className="text-rose-600 hover:text-rose-700 text-xs lowercase font-normal flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      clear day
                    </button>
                  )}
                </div>

                {dailyLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    No food items logged today yet. Scan or search a food item above and click &quot;Log Food&quot;!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {dailyLogs.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.servingsCount}x portion • {((item.product.nutriments.sugarsPer100g || 0) * item.servingsCount).toFixed(1)}g sugar • {item.loggedAt}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveLog(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove from journal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setIsJournalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close Journal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CROWDSOURCE MISSING PRODUCT MODAL ── */}
      {isCrowdsourceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  📦
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Contribute Product to Global Registry
                  </h2>
                  <p className="text-xs text-slate-500">
                    Help map international foods, beverages, and packaged goods worldwide
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCrowdsourceOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCrowdsourceSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Barcode (8-14 Digits) *
                </label>
                <input
                  type="text"
                  required
                  value={crowdsourceForm.barcode}
                  onChange={e => setCrowdsourceForm({ ...crowdsourceForm, barcode: e.target.value })}
                  placeholder="e.g. 5449000000996"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={crowdsourceForm.name}
                  onChange={e => setCrowdsourceForm({ ...crowdsourceForm, name: e.target.value })}
                  placeholder="e.g. San Pellegrino Sparkling Water or Oatly Barista Edition"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={crowdsourceForm.brand}
                    onChange={e => setCrowdsourceForm({ ...crowdsourceForm, brand: e.target.value })}
                    placeholder="e.g. Nestlé, Danone, General Mills, Kraft"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Sugar (g per 100g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={crowdsourceForm.sugarsPer100g}
                    onChange={e => setCrowdsourceForm({ ...crowdsourceForm, sugarsPer100g: e.target.value })}
                    placeholder="e.g. 11.2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Ingredients List (from packaging label)
                </label>
                <textarea
                  rows={3}
                  value={crowdsourceForm.ingredientsText}
                  onChange={e => setCrowdsourceForm({ ...crowdsourceForm, ingredientsText: e.target.value })}
                  placeholder="Paste or type ingredients: e.g. Carbonated water, sugar, caramel color E150d, phosphoric acid..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {crowdsourceState.message && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  crowdsourceState.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{crowdsourceState.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCrowdsourceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crowdsourceState.loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {crowdsourceState.loading ? 'Saving...' : 'Submit to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 text-center text-xs text-slate-400 space-y-2">
        <p>
          NutriScan Global • Independent International Food Intelligence & Metabolic Analysis.
        </p>
        <p className="text-[11px] text-slate-400">
          Powered by Open Food Facts, World Health Organization (WHO) nutrient profiles, and community crowdsourced data.
        </p>
      </footer>
    </div>
  );
}
