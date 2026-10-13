'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  Building2, 
  FlaskConical, 
  FileCheck, 
  ChevronRight, 
  Thermometer, 
  Microscope, 
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Scan,
  Sparkles
} from 'lucide-react';
import { mockFoods } from '@/lib/data/mockFoods';
import { mockAlerts } from '@/lib/data/mockAlerts';
import { SafetyBadge } from '@/components/SafetyBadge';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoods = mockFoods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.commonContaminants.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 text-brand-900 border border-brand-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              All-in-One Global Food Safety & Management Ecosystem
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
              Know What’s in Your Food. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600">
                Protect Your Customers.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Empowering consumers to identify food hazards, connecting producers to accredited laboratories, and providing food businesses with inspection-ready digital hygiene management.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2 max-w-xl mx-auto">
              <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all p-1.5">
                <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search food item (e.g., Milk, Maize Flour, Beef, Spinach)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <Link
                  href={searchQuery ? `/explore?q=${encodeURIComponent(searchQuery)}` : '/explore'}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  Explore <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {searchQuery && (
                <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-xl p-2 text-left space-y-1">
                  {filteredFoods.slice(0, 3).map((food) => (
                    <Link
                      key={food.id}
                      href={`/explore#${food.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{food.name}</span>
                        <p className="text-xs text-gray-500 truncate max-w-md">{food.description}</p>
                      </div>
                      <span className="text-xs text-brand-600 font-medium flex items-center">
                        View profile <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                  {filteredFoods.length === 0 && (
                    <p className="text-xs text-gray-500 p-3 text-center">No exact matches found. Check our complete directory.</p>
                  )}
                </div>
              )}
            </div>

            {/* Flagship Feature Hub CTA */}
            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02]"
              >
                <Scan className="w-5 h-5 text-white" />
                Launch Product Barcode Scanner
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 shadow-2xs transition-all"
              >
                <Search className="w-4 h-4 text-gray-500" />
                Browse Hazard Knowledge Base
              </Link>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto text-left border-t border-gray-200/80">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">100% Free</p>
                <p className="text-xs text-gray-500 font-medium">For Consumers</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-brand-700">ISO 17025</p>
                <p className="text-xs text-gray-500 font-medium">Lab Network Directory</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700">Instant</p>
                <p className="text-xs text-gray-500 font-medium">Business Checklists</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Unified Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
            One Platform. Three Vital Audiences.
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Seamlessly bridging public safety knowledge, scientific lab diagnostics, and restaurant hygiene operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Consumer Discovery */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-brand-300 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase">Pillar 1 • Free</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Food Safety Discovery</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Search common foods (milk, maize, beef, produce), understand biological, chemical & physical hazards, and access actionable handling guides.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  Sourced contaminant profiles & safe thresholds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  Verified public recalls and alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  Community concern submission portal
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/explore"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-50 text-gray-900 hover:text-brand-700 font-semibold text-xs transition-colors border border-gray-200"
              >
                Browse Food Profiles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Testing Directory */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase">Pillar 2 • Marketplace</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Testing Directory & Leads</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect directly with certified testing laboratories (Eurofins, SGS, Intertek, Bureau Veritas) for microbiological, chemical pesticide, and heavy metal analysis.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  Accreditation scopes (ISO/IEC 17025, GFSI, FDA, EFSA)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  Request sample quotation online
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  No lab equipment needed to launch
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/laboratories"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-900 hover:text-indigo-700 font-semibold text-xs transition-colors border border-gray-200"
              >
                Find Testing Laboratories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: B2B Management SaaS */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-500/40 ring-2 ring-brand-500/10 hover:shadow-xl transition-all flex flex-col justify-between group relative">
            <span className="absolute -top-3 right-6 bg-brand-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Primary Revenue
            </span>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">Pillar 3 • B2B SaaS</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Food Business Management</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Replace paper logs with digital hygiene checklists, fridge temperature logs, batch expiration tracking, and one-click audit exports.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Daily cleaning checklists & staff accountability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Temperature threshold breach warnings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Export inspection reports for health officers
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/business"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Launch Business Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Safety Alerts Preview */}
      <section className="bg-gray-50 py-12 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Live Food Safety Notices
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Verified Alerts & Official Recalls</h2>
            </div>
            <Link
              href="/alerts"
              className="text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1.5"
            >
              View all active alerts ({mockAlerts.length}) <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <SafetyBadge status={alert.status} />
                  <span className="text-[11px] text-gray-500 font-medium">{alert.publishedAt}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 leading-snug">{alert.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>Product:</strong> {alert.productName} • <strong>Hazard:</strong> {alert.contaminant}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Source: {alert.issuingAuthorityOrSource}</span>
                  <Link href="/alerts" className="font-semibold text-brand-600 hover:underline">
                    Action steps →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Business SaaS Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <Building2 className="w-3.5 h-3.5" />
              For Restaurants, Supermarkets & Food Processors
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Ditch the clipboard. Pass health inspections with confidence.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Maintain regulatory compliance effortlessly. Log fridge temperatures in 5 seconds, delegate daily station sanitization checklists to staff, and produce clean compliance PDF/CSV audit reports on demand.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/business"
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2"
              >
                Try Interactive Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm transition-colors border border-gray-700"
              >
                View Transparent Pricing ($0 to $10/mo)
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
