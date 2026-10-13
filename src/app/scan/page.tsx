'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Scan, 
  Search, 
  Camera, 
  CameraOff, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  FlaskConical, 
  ArrowRight, 
  PlusCircle, 
  X, 
  Flame, 
  HeartHandshake, 
  Layers, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { ScannedProduct } from '@/types';
import { 
  fetchProductByBarcode, 
  searchProductsByName, 
  DEMO_PRODUCTS 
} from '@/lib/services/foodScanner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(DEMO_PRODUCTS[0]); // Default to Coca-Cola example
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ScannedProduct[]>([]);
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Community contribution form state
  const [contributeForm, setContributeForm] = useState({
    name: '',
    brand: '',
    barcode: '',
    ingredients: '',
    category: 'Beverage'
  });
  const [contributeSuccess, setContributeSuccess] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setNotFoundBarcode(null);
    setSearchResults([]);

    const cleanInput = query.trim();
    // Check if input looks like a numeric barcode (6 to 14 digits)
    const isBarcode = /^\d{6,14}$/.test(cleanInput);

    if (isBarcode) {
      const res = await fetchProductByBarcode(cleanInput);
      if (res) {
        setProduct(res);
      } else {
        setNotFoundBarcode(cleanInput);
        setContributeForm(prev => ({ ...prev, barcode: cleanInput }));
      }
    } else {
      // Search by product name / brand
      const results = await searchProductsByName(cleanInput);
      if (results.length === 1) {
        setProduct(results[0]);
      } else if (results.length > 1) {
        setSearchResults(results);
      } else {
        setNotFoundBarcode(cleanInput);
        setContributeForm(prev => ({ ...prev, name: cleanInput }));
      }
    }

    setLoading(false);
  };

  // Quick Select Sample Product
  const handleSelectSample = (sample: ScannedProduct) => {
    setProduct(sample);
    setQuery(sample.barcode);
    setNotFoundBarcode(null);
    setSearchResults([]);
  };

  // Initialize Camera Scanner (Html5Qrcode)
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isCameraActive) {
      setCameraError(null);
      import('html5-qrcode')
        .then(({ Html5Qrcode }) => {
          html5QrCode = new Html5Qrcode('camera-reader-viewport');
          scannerRef.current = html5QrCode;

          return html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 260, height: 160 }
            },
            async (decodedText: string) => {
              // Successfully read barcode!
              setIsCameraActive(false);
              setQuery(decodedText);
              setLoading(true);
              const found = await fetchProductByBarcode(decodedText);
              if (found) {
                setProduct(found);
                setNotFoundBarcode(null);
              } else {
                setNotFoundBarcode(decodedText);
                setContributeForm(prev => ({ ...prev, barcode: decodedText }));
              }
              setLoading(false);

              if (html5QrCode) {
                try {
                  await html5QrCode.stop();
                } catch {
                  // Ignore stop error
                }
              }
            },
            () => {
              // Frame scanning error (normal while scanning)
            }
          );
        })
        .catch((err) => {
          console.warn('Camera access issue:', err);
          setCameraError(
            'Camera could not be accessed. Please ensure camera permissions are enabled in your browser, or enter the barcode number below.'
          );
        });
    }

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {
          // Cleanup
        }
      }
    };
  }, [isCameraActive]);

  // Submit missing product to Supabase
  const handleContributeProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeForm.name) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('incident_reports').insert({
          food_product: contributeForm.name,
          brand_or_vendor: contributeForm.brand || 'Community Contributed',
          purchase_location: 'User Scan Submission',
          incident_date: new Date().toISOString().slice(0, 10),
          symptoms_or_observations: `Product Barcode: ${contributeForm.barcode || 'N/A'}. Ingredients: ${contributeForm.ingredients || 'Unspecified'}`,
          suspected_contaminant_type: 'Other / Product Record Update',
          status: 'under_review'
        });
      } catch (err) {
        console.warn('Contribution save notice:', err);
      }
    }

    setContributeSuccess(true);
    setTimeout(() => {
      setContributeSuccess(false);
      setShowContributeModal(false);
      setNotFoundBarcode(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Consumer Food Intelligence Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Food Safety & Ingredient Scanner
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Scan any barcode or search a food brand to uncover chemical additives, hidden sugar loads, nutritional trade-offs, and check for active contamination alerts.
        </p>
      </div>

      {/* Primary Scanner Control Hub */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
        {/* Input Bar & Camera Launcher */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Enter barcode (e.g. 5449000000996) or food brand..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Analyze Product
          </button>

          <button
            type="button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`px-4 py-3 rounded-2xl border font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
              isCameraActive 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
            }`}
          >
            {isCameraActive ? (
              <>
                <CameraOff className="w-4 h-4" /> Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" /> Live Camera
              </>
            )}
          </button>
        </form>

        {/* Live Camera Viewport (When camera active) */}
        {isCameraActive && (
          <div className="space-y-3 pt-2">
            <div className="bg-gray-950 rounded-2xl p-4 overflow-hidden relative border-2 border-brand-500">
              <div 
                id="camera-reader-viewport" 
                className="w-full max-w-sm mx-auto overflow-hidden rounded-xl"
              />
              <p className="text-center text-xs text-gray-300 mt-2 font-medium">
                Hold product barcode steady inside the viewfinder
              </p>
            </div>
            {cameraError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* 1-Click Interactive Test Chips */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Instant Demo Examples:</span>
          {DEMO_PRODUCTS.map((demo) => (
            <button
              key={demo.barcode}
              type="button"
              onClick={() => handleSelectSample(demo)}
              className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-700 font-medium border border-gray-200 transition-colors"
            >
              {demo.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Multiple Search Results Selector (If multiple returned) */}
      {searchResults.length > 0 && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Matching Products Found ({searchResults.length})</h3>
          <p className="text-xs text-gray-500">Select the exact product you want to inspect:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {searchResults.map((res) => (
              <button
                key={res.barcode}
                onClick={() => {
                  setProduct(res);
                  setSearchResults([]);
                }}
                className="p-3 text-left rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{res.name}</h4>
                  <p className="text-[11px] text-gray-500">{res.brand || 'Packaged brand'} • Barcode: {res.barcode}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Not Found Banner & Community Contribution Callout */}
      {notFoundBarcode && (
        <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4 text-amber-950">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                Product Not Yet In Global Registry ({notFoundBarcode})
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                This item is not yet indexed in the Open Food Facts worldwide catalogue. You can contribute its label information to help build our verified food database!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowContributeModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Contribute Product Details
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT INTELLIGENCE DOSSIER REPORT                                       */}
      {/* ========================================================================= */}
      {product && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs space-y-6 pb-8">
          {/* Official Safety Alert Warning Banner (If matched recall) */}
          {product.matchedRecall && (
            <div className="bg-red-600 text-white p-5 sm:p-6 flex items-start gap-4 animate-in fade-in">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Active Safety Warning Detected
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  {product.matchedRecall.title}
                </h3>
                <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                  <strong>Identified Hazard:</strong> {product.matchedRecall.contaminant} •{' '}
                  <strong>Recommended Action:</strong> {product.matchedRecall.recommendedAction}
                </p>
                <div className="pt-2">
                  <Link
                    href="/alerts"
                    className="inline-flex items-center gap-1 text-xs font-bold underline hover:text-red-200"
                  >
                    View official regulatory notice details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Clean Safety Status (When no recall) */}
          {!product.matchedRecall && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3.5 flex items-center gap-2.5 text-xs text-emerald-950 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Official Surveillance Check: No active recall or contamination orders indexed for this product.</span>
            </div>
          )}

          {/* Product Header Profile */}
          <div className="px-6 sm:px-8 pt-4 flex flex-col md:flex-row items-start gap-6">
            {product.imageUrl ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 relative flex items-center justify-center p-2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
                <Scan className="w-10 h-10" />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand && (
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
                {product.novaGroup && (
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                    product.novaGroup === 4 
                      ? 'bg-red-50 text-red-800 border-red-200' 
                      : product.novaGroup === 3 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    NOVA {product.novaGroup}: {product.novaGroup === 4 ? 'Ultra-Processed' : 'Standard Food'}
                  </span>
                )}
                <span className="text-[11px] text-gray-400">Barcode: {product.barcode}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {product.name}
              </h2>

              <p className="text-xs sm:text-sm text-gray-600">
                Category: <strong>{product.category || 'Packaged Grocery'}</strong>
                {product.servingSize && ` • Standard Serving: ${product.servingSize}`}
              </p>
            </div>
          </div>

          {/* Sugar Shock & Metabolic Load Visualizer */}
          <div className="mx-6 sm:mx-8 bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">Sugar Content & Metabolic Impact</h3>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                {product.nutriments.sugarsPer100g !== undefined 
                  ? `${product.nutriments.sugarsPer100g}g Sugar per 100g` 
                  : 'Sugar not disclosed'}
              </span>
            </div>

            {/* Visual Sugar Cubes */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: Math.min(product.sugarCubesCount, 16) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-lg bg-white border border-amber-300 shadow-2xs flex items-center justify-center text-xs font-bold text-amber-700"
                    title="1 Sugar Cube (~4g)"
                  >
                    4g
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Equivalent to approximately <strong>{product.sugarCubesCount} sugar cubes</strong> per typical package/serving. 
                {product.sugarCubesCount >= 7 
                  ? ' ⚠️ This single portion exceeds the WHO adult daily recommended free sugar threshold (25g).' 
                  : ' Moderate sugar concentration.'}
              </p>
            </div>
          </div>

          {/* Core Nutritional Metrics Grid */}
          <div className="px-6 sm:px-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs">
              Macro-Nutritional Profile (Per 100g)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 block">Energy</span>
                <strong className="text-lg font-black text-gray-900">
                  {product.nutriments.caloriesPer100g !== undefined ? `${product.nutriments.caloriesPer100g} kcal` : '—'}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 block">Saturated Fat</span>
                <strong className="text-lg font-black text-gray-900">
                  {product.nutriments.saturatedFatPer100g !== undefined ? `${product.nutriments.saturatedFatPer100g}g` : '0g'}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 block">Sodium / Salt</span>
                <strong className="text-lg font-black text-gray-900">
                  {product.nutriments.saltPer100g !== undefined ? `${product.nutriments.saltPer100g}g` : '0g'}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 block">Protein</span>
                <strong className="text-lg font-black text-gray-900">
                  {product.nutriments.proteinsPer100g !== undefined ? `${product.nutriments.proteinsPer100g}g` : '0g'}
                </strong>
              </div>
            </div>
          </div>

          {/* Chemical Additives & E-Numbers Breakdown */}
          <div className="px-6 sm:px-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Decoded Additives & E-Numbers ({product.additives.length})
              </h3>
              <span className="text-[11px] text-gray-500">Codex Standard Mapped</span>
            </div>

            {product.additives.length > 0 ? (
              <div className="space-y-2.5">
                {product.additives.map((add, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-gray-900 text-sm">{add.name}</strong>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                          {add.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          add.riskLevel === 'high_concern'
                            ? 'bg-red-100 text-red-800'
                            : add.riskLevel === 'caution'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {add.riskLevel.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{add.description}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200 whitespace-nowrap">
                      {add.purpose}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>No high-concern synthetic chemical additives or artificial dyes indexed in this product label.</span>
              </div>
            )}
          </div>

          {/* Health Insights (Strengths vs Concerns) */}
          <div className="px-6 sm:px-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-brand-600" />
              Nutritional Strengths & Trade-Offs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {product.healthImpacts.map((impact, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    impact.type === 'concern'
                      ? 'bg-red-50/50 border-red-200 text-red-950'
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {impact.type === 'concern' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <strong className="font-bold text-gray-900">{impact.title}</strong>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{impact.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Healthier Realistic Alternatives */}
          <div className="mx-6 sm:mx-8 bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-800 uppercase tracking-wide">
                Evidence-Based Recommendations
              </span>
              <h3 className="text-lg font-black text-gray-900">
                Healthier Alternatives to Consider
              </h3>
              <p className="text-xs text-gray-600">
                Better choices that fulfill a similar taste or snacking desire without the metabolic sugar load or chemical dyes:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {product.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-brand-100 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
                      {alt.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                      {alt.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {alt.whyBetter}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 self-start mt-2">
                    {alt.sugarComparison}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Laboratory Diagnostic CTA */}
          <div className="px-6 sm:px-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700 block">Suspecting unlisted adulterants or pathogens?</span>
              Invisible contaminants require laboratory analytical testing.
            </div>
            <Link
              href="/laboratories"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              <FlaskConical className="w-4 h-4" />
              Request Laboratory Test Quote
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MISSING PRODUCT CONTRIBUTION MODAL                                        */}
      {/* ========================================================================= */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowContributeModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Community Catalog Engine
              </span>
              <h3 className="text-xl font-black text-gray-900">
                Contribute Food Product Record
              </h3>
              <p className="text-xs text-gray-600">
                Help build transparent food product data for items sold in your local stores.
              </p>
            </div>

            {contributeSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Product Submitted for Moderation!</h4>
                <p className="text-xs text-emerald-800">
                  Thank you! Your product contribution has been securely recorded in our database.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContributeProduct} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tropical Passion Fruit Nectar"
                    value={contributeForm.name}
                    onChange={(e) => setContributeForm({ ...contributeForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Splash, Britania"
                      value={contributeForm.brand}
                      onChange={(e) => setContributeForm({ ...contributeForm, brand: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Barcode (If known)</label>
                    <input
                      type="text"
                      placeholder="e.g. 616400..."
                      value={contributeForm.barcode}
                      onChange={(e) => setContributeForm({ ...contributeForm, barcode: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Ingredients (As printed on package)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Water, Passion Fruit Juice (15%), Sugar, Citric Acid, Preservative E211..."
                    value={contributeForm.ingredients}
                    onChange={(e) => setContributeForm({ ...contributeForm, ingredients: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors shadow-xs"
                >
                  Submit Product Record
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
