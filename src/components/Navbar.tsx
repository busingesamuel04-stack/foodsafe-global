'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Search, AlertCircle, Building2, FlaskConical, Menu, X, PlusCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900 group-hover:text-brand-700 transition-colors">
                FoodSafe<span className="text-brand-600">Global</span>
              </span>
              <span className="block text-[10px] text-gray-500 font-medium -mt-1 tracking-wider uppercase">
                Safety & Detection Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium text-gray-600">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Search className="w-4 h-4 text-brand-600" />
              Explore Foods
            </Link>
            <Link
              href="/alerts"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              Safety Alerts
            </Link>
            <Link
              href="/laboratories"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <FlaskConical className="w-4 h-4 text-indigo-500" />
              Find a Lab
            </Link>
            <Link
              href="/business"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              Business Hub
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/report-concern"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50/50 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-red-500" />
              Report Concern
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all hover:shadow"
            >
              Business Login
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <Search className="w-4 h-4 text-brand-600" />
            Explore Foods & Contaminants
          </Link>
          <Link
            href="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            Safety Alerts & Recalls
          </Link>
          <Link
            href="/laboratories"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <FlaskConical className="w-4 h-4 text-indigo-500" />
            Find Certified Laboratories
          </Link>
          <Link
            href="/business"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            Business Management Hub
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            Pricing & Plans
          </Link>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/report-concern"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-700 bg-red-50 border border-red-200"
            >
              <PlusCircle className="w-4 h-4" />
              Report a Concern
            </Link>
            <Link
              href="/business"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600"
            >
              Business Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
