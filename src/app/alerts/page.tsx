'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockAlerts } from '@/lib/data/mockAlerts';
import { FoodAlert, AlertVerificationStatus } from '@/types';
import { SafetyBadge } from '@/components/SafetyBadge';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  ShieldCheck,
  Building,
  Info,
  Database,
  FlaskConical,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<FoodAlert[]>(mockAlerts);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      if (!isSupabaseConfigured || !supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('food_alerts')
          .select('*')
          .order('published_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: FoodAlert[] = data.map((item) => ({
            id: item.id,
            title: item.title,
            productName: item.product_name,
            batchOrLotNumber: item.batch_or_lot_number || undefined,
            contaminant: item.contaminant,
            status: item.status as AlertVerificationStatus,
            severity: item.severity,
            issuingAuthorityOrSource: item.issuing_authority_or_source,
            sourceUrl: item.source_url || undefined,
            publishedAt: item.published_at,
            affectedRegions: item.affected_regions || ['Global / Regional'],
            recommendedAction: item.recommended_action,
            isReferenceOrHistorical: false
          }));
          setAlerts(mapped);
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.warn('Failed to fetch alerts from Supabase, using reference data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Surveillance & Incident Registry
            </span>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" /> Live Database Sync
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                Reference Standards Mode
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Food Safety Alerts & Recalls
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
            Sourced and verified alerts from national standards bodies, municipal health surveillance, and certified testing laboratories.
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

      {/* Safety & Credibility Hierarchy Protocol Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-blue-950">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">Information Integrity & Verification Protocol:</strong>
          <p className="text-blue-900 text-xs leading-relaxed">
            FoodSafe Global strictly categorizes notifications into <strong>Official Regulatory Advisories</strong> (government statutory gazettes), <strong>Lab-Confirmed Findings</strong> (certified analytical test reports), and <strong>Community Reports Under Review</strong> (field reports pending investigation). Community submissions are never presented as verified contaminants without formal analytical evidence.
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
                <div className="flex items-center gap-2 flex-wrap">
                  <SafetyBadge status={alert.status} />
                  {alert.isReferenceOrHistorical && (
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      Historical Surveillance Reference
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 whitespace-nowrap">
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
              <span className="text-gray-500 flex items-center gap-1 truncate max-w-[65%]">
                <Building className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{alert.issuingAuthorityOrSource}</span>
              </span>
              {alert.sourceUrl ? (
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 whitespace-nowrap"
                >
                  Official Source <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-gray-400 whitespace-nowrap">Internal Registry</span>
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
