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
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  HealthGoal,
  ScannedProduct,
  DailyLogItem,
  DailyMetabolicSummary,
  CrowdsourcedProductSubmission
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
  submitCrowdsourcedProduct
} from '@/lib/services/nutriScanService';

export default function NutriScanApp() {
  // 1. Core State
  const [activeGoal, setActiveGoal] = useState<HealthGoal>('blood_sugar');
  const [currentProduct, setCurrentProduct] = useState<ScannedProduct>(SAMPLE_PRODUCTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ScannedProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 2. Camera Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<unknown>(null);

  // 3. Daily Metabolic Journal State
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

  // 4. Missing Product Crowdsource Modal
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

  // 5. Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Daily Logs from localStorage
  useEffect(() => {
    const loaded = getStoredDailyLogs();
    setDailyLogs(loaded);
    setDailySummary(calculateDailySummary(loaded));
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

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
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Add current product to daily journal
  const handleAddToJournal = () => {
    const updated = saveDailyLogItem(currentProduct, servingsCount);
    setDailyLogs(updated);
    setDailySummary(calculateDailySummary(updated));
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

      // Give DOM time to mount viewport element
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
              // Successfully read barcode!
              await stopCameraScanner();
              triggerToast(`Barcode detected: ${decodedText}`);
              const found = await lookupProductByBarcode(decodedText);
              if (found) {
                setCurrentProduct(found);
                triggerToast(`Found: ${found.name}`);
              } else {
                setCrowdsourceForm(prev => ({ ...prev, barcode: decodedText }));
                setIsCrowdsourceOpen(true);
                triggerToast('Product not found. Add details to crowdsource!');
              }
            },
            () => {
              // frame scanning silence
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
  }, [stopCameraScanner, triggerToast]);

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

  const currentGoalMeta = HEALTH_GOALS.find(g => g.id === activeGoal) || HEALTH_GOALS[0];
  const activeVerdict = currentProduct.personalVerdicts[activeGoal];

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-black text-lg">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">NutriScan</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Food Intelligence & Metabolic Health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Daily Journal Quick Trigger */}
            <button
              onClick={() => setIsJournalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              title="View Daily Metabolic Intake"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Today&apos;s Clean Score:</span>
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

            {/* Missing Product Button */}
            <button
              onClick={() => setIsCrowdsourceOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Contribute Product</span>
            </button>
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
              Adjusts product scoring and warnings to your metabolic focus
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

        {/* ── SCANNER & SEARCH CONTROLS ── */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input Form */}
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

            {/* Live Camera Scanner Button */}
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
              <span>{isScannerOpen ? 'Close Camera' : 'Scan Barcode'}</span>
            </button>
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

          {/* Quick 1-Tap Demo Reference Shelf */}
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
                  Common in local Ugandan markets. Help index this product by adding its label details!
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

            {/* Nutri-Score & NOVA Badges + Journal Quick Action */}
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

              {/* Log to Journal Action */}
              <div className="flex items-center gap-1.5">
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
            <button
              onClick={handleAddToJournal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add to Today&apos;s Metabolic Log</span>
            </button>
          </div>
        </section>
      </main>

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
                    Contribute Local Product
                  </h2>
                  <p className="text-xs text-slate-500">
                    Help map packaged foods and beverages in African markets
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
                  placeholder="e.g. Mukwano Sunflower Cooking Oil or Riham Cola"
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
                    placeholder="e.g. Harris International"
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
          NutriScan Global • Independent Food Intelligence & Metabolic Analysis.
        </p>
        <p className="text-[11px] text-slate-400">
          Powered by Open Food Facts, World Health Organization (WHO) nutrient profiles, and community crowdsourced data.
        </p>
      </footer>
    </div>
  );
}
