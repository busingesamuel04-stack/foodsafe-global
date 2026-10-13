'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, Building2, FlaskConical, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200">
          Sustainable Business Model
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Transparent, Zero-Barrier Pricing
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Free public intelligence for consumers. Affordable operational software for food businesses. High-intent verified leads for testing laboratories.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: Consumer & Public */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
              General Public & Consumers
            </div>
            <h3 className="text-2xl font-black text-gray-900">Consumer Free</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Open food contamination education, public recall notices, and testing directory access.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-black text-gray-900">$0</span>
              <span className="text-xs text-gray-500 font-medium ml-1">/ forever free</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-600 pt-4 border-t border-gray-100">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Search full food contamination database
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Real-time official recall & safety alerts
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Submit suspected contamination concern
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Browse certified testing laboratory profiles
              </li>
            </ul>
          </div>

          <Link
            href="/explore"
            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs text-center transition-colors"
          >
            Start Exploring Foods
          </Link>
        </div>

        {/* Tier 2: Food Business Pro (Highlight) */}
        <div className="bg-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-emerald-600 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Primary Revenue Engine
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" /> Restaurants & Food Processors
            </div>
            <h3 className="text-2xl font-black text-gray-900">Business Pro SaaS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Complete digital compliance, hygiene checklists, refrigeration logs, and audit export tools.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-black text-gray-900">$10</span>
              <span className="text-xs text-gray-500 font-medium ml-1">/ month (~UGX 38,000)</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-700 pt-4 border-t border-gray-100">
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Unlimited daily staff hygiene checklists
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Walk-in cooler & freezer temperature logs
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Automated temperature breach alarms
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Batch expiration & supplier traceability
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                1-Click CSV/PDF report for health inspectors
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                Up to 10 staff member accounts
              </li>
            </ul>
          </div>

          <Link
            href="/business"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            Launch Free Business Pilot <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tier 3: Laboratory Partner */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <FlaskConical className="w-3.5 h-3.5" /> Testing Laboratories
            </div>
            <h3 className="text-2xl font-black text-gray-900">Lab Partner</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Connect directly with restaurants, exporters, and manufacturers seeking commercial test validation.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-black text-gray-900">$25</span>
              <span className="text-xs text-gray-500 font-medium ml-1">/ month (~UGX 95,000)</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-600 pt-4 border-t border-gray-100">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                Verified ISO/IEC 17025 partner badge
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                Direct test quotation request inbox
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                Publish accredited testing scope parameters
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                Sample tracking status integration
              </li>
            </ul>
          </div>

          <Link
            href="/laboratories"
            className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs text-center transition-colors"
          >
            List Your Laboratory
          </Link>
        </div>
      </div>

      {/* Zero Capital Strategy Explanation */}
      <div className="bg-gradient-to-r from-brand-900 to-gray-900 rounded-3xl p-8 sm:p-10 text-white space-y-4">
        <div className="flex items-center gap-2 text-brand-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          The $0 Launch Unit Economics
        </div>
        <h3 className="text-xl sm:text-2xl font-bold">How This Generates Revenue from Day One</h3>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
          By deploying on Cloudflare Pages ($0) and Supabase Free Tier ($0), your operational infrastructure cost is $0. Demonstrating this working hygiene tool to just <strong>25 local restaurants or food processors at $10/month</strong> achieves <strong>$250/month (~UGX 950,000/month) recurring net revenue</strong> before any hosting upgrade is ever needed.
        </p>
      </div>
    </div>
  );
}
