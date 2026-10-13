'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockAlerts } from '@/lib/data/mockAlerts';
import { SafetyBadge } from '@/components/SafetyBadge';
import { 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';

export default function AlertsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesFilter = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.contaminant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.affectedRegions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Real-time Verification Feed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Food Safety Alerts & Recalls
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
            Sourced and verified alerts from national bureaus of standards, municipal public health inspectors, and certified testing laboratories.
          </p>
        </div>

        <Link
          href="/report-concern"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Submit a Suspected Hazard
        </Link>
      </div>

      {/* Safety Protocol Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-blue-950">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">Strict Verification Standard:</strong>
          <p className="text-blue-900 text-xs leading-relaxed">
            Unverified consumer submissions are strictly marked as <em>&quot;Under Review&quot;</em> until sample chain-of-custody and analytical lab confirmation or regulatory bureau notices are formally recorded.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by product, batch number, hazard, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'verified_official', label: 'Official Verified' },
            { id: 'lab_confirmed', label: 'Lab Confirmed' },
            { id: 'under_review', label: 'Under Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:border-gray-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <SafetyBadge status={alert.status} />
                <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {alert.publishedAt}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {alert.title}
                </h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <p>
                    <strong className="text-gray-900">Affected Food:</strong> {alert.productName}
                  </p>
                  {alert.batchOrLotNumber && (
                    <p>
                      <strong className="text-gray-900">Batch / Lot:</strong> {alert.batchOrLotNumber}
                    </p>
                  )}
                  <p>
                    <strong className="text-red-700">Contaminant:</strong> {alert.contaminant}
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-950 space-y-1">
                <strong className="font-bold flex items-center gap-1 text-red-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Recommended Public & Retailer Action:
                </strong>
                <p className="leading-relaxed">{alert.recommendedAction}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>Affected Regions: {alert.affectedRegions.join(', ')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> {alert.issuingAuthorityOrSource}
              </span>
              {alert.sourceUrl ? (
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Official Source <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-gray-400">Internal Registry</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Info className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Alerts Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            There are no alerts matching this filter criteria at this time.
          </p>
        </div>
      )}
    </div>
  );
}
