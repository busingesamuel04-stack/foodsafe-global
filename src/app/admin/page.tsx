'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FlaskConical, 
  FileText, 
  Check, 
  X, 
  Plus, 
  Eye, 
  Trash2, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { mockAlerts } from '@/lib/data/mockAlerts';
import { mockFoods } from '@/lib/data/mockFoods';
import { mockLabs } from '@/lib/data/mockLabs';
import { FoodAlert, FoodProfile, LaboratoryProfile } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'foods' | 'labs' | 'submissions'>('alerts');

  // Local admin states for live management
  const [alerts, setAlerts] = useState<FoodAlert[]>(mockAlerts);
  const [foods, setFoods] = useState<FoodProfile[]>(mockFoods);
  const [labs, setLabs] = useState<LaboratoryProfile[]>(mockLabs);

  // New Alert Form state
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertProduct, setNewAlertProduct] = useState('');
  const [newAlertContaminant, setNewAlertContaminant] = useState('');
  const [newAlertAuthority, setNewAlertAuthority] = useState('UNBS Surveillance Unit');
  const [newAlertAction, setNewAlertAction] = useState('');

  // Sample pending submissions queue
  const [pendingSubmissions, setPendingSubmissions] = useState([
    {
      id: 'sub-1',
      productName: 'Commercial Sachet Waragi (Gin)',
      vendor: 'Informal roadside kiosk',
      location: 'Kalerwe Market',
      concern: 'Pungent industrial solvent odor; suspected hazardous methanol contamination.',
      submittedAt: 'Today, 09:30 AM',
      reporterName: 'Moses K.',
      status: 'pending_review'
    },
    {
      id: 'sub-2',
      productName: 'Pre-packaged Smoked Tilapia',
      vendor: 'Lake Shore Fish Stall',
      location: 'Ggaba Landing Site',
      concern: 'Severe chemical preservative odor, abnormal chalky white flesh residue.',
      submittedAt: 'Yesterday, 16:45 PM',
      reporterName: 'Anonymous Citizen',
      status: 'pending_review'
    }
  ]);

  const handlePublishAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle || !newAlertProduct) return;

    const alert: FoodAlert = {
      id: `alert-${Date.now()}`,
      title: newAlertTitle,
      productName: newAlertProduct,
      contaminant: newAlertContaminant || 'Suspected Unsafe Contaminant',
      status: 'verified_official',
      severity: 'high',
      issuingAuthorityOrSource: newAlertAuthority,
      publishedAt: new Date().toISOString().slice(0, 10),
      affectedRegions: ['National Distribution'],
      recommendedAction: newAlertAction || 'Quarantine stock immediately pending formal batch verification.'
    };

    setAlerts([alert, ...alerts]);
    setNewAlertTitle('');
    setNewAlertProduct('');
    setNewAlertContaminant('');
    setNewAlertAction('');
  };

  const handleApproveSubmission = (id: string) => {
    const sub = pendingSubmissions.find(s => s.id === id);
    if (sub) {
      const convertedAlert: FoodAlert = {
        id: `alert-sub-${Date.now()}`,
        title: `Community Hazard Alert: ${sub.productName}`,
        productName: sub.productName,
        contaminant: sub.concern,
        status: 'under_review',
        severity: 'medium',
        issuingAuthorityOrSource: `Community Field Report (${sub.location})`,
        publishedAt: new Date().toISOString().slice(0, 10),
        affectedRegions: [sub.location],
        recommendedAction: 'Public advised caution while municipal health inspectors collect laboratory samples.'
      };
      setAlerts([convertedAlert, ...alerts]);
      setPendingSubmissions(pendingSubmissions.filter(s => s.id !== id));
    }
  };

  const handleDismissSubmission = (id: string) => {
    setPendingSubmissions(pendingSubmissions.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
            Administrative Operations
          </span>
          <span className="text-xs text-gray-500 font-medium">Full Content & Review Controls</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Admin Dashboard & Content Manager
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          Publish sourced safety alerts, moderate citizen incident submissions, and manage laboratory directory listings without needing code changes.
        </p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-medium text-gray-500 block">Active Alerts</span>
          <span className="text-2xl font-black text-red-600">{alerts.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-medium text-gray-500 block">Food Profiles</span>
          <span className="text-2xl font-black text-gray-900">{foods.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-medium text-gray-500 block">Certified Labs</span>
          <span className="text-2xl font-black text-indigo-600">{labs.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-medium text-gray-500 block">Review Queue</span>
          <span className="text-2xl font-black text-amber-600">{pendingSubmissions.length}</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-6 text-sm font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'alerts' ? 'border-red-600 text-red-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Safety Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'submissions' ? 'border-amber-600 text-amber-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          Community Moderation Queue ({pendingSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'foods' ? 'border-brand-600 text-brand-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Food Profiles & Guides ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'labs' ? 'border-indigo-600 text-indigo-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Laboratories Directory ({labs.length})
        </button>
      </div>

      {/* Tab: Safety Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Publish New Alert Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-600" />
              Publish Sourced Public Safety Notice
            </h3>
            <form onSubmit={handlePublishAlert} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Alert Title (e.g. Sourced Notice: Heavy Metals in Rice Batch)"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Food Product Name"
                  value={newAlertProduct}
                  onChange={(e) => setNewAlertProduct(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Identified Hazard / Contaminant"
                  value={newAlertContaminant}
                  onChange={(e) => setNewAlertContaminant(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Issuing Authority (e.g. UNBS, FDA, WHO)"
                  value={newAlertAuthority}
                  onChange={(e) => setNewAlertAuthority(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Recommended Consumer and Retailer Action Steps"
                value={newAlertAction}
                onChange={(e) => setNewAlertAction(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
              >
                Publish Live Alert
              </button>
            </form>
          </div>

          {/* Current Alerts List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{alert.title}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Product: {alert.productName} • Hazard: {alert.contaminant} • Source: {alert.issuingAuthorityOrSource}
                  </p>
                  <p className="text-xs text-gray-500">Published: {alert.publishedAt}</p>
                </div>
                <button
                  onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Submissions Queue */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Incoming Community Incident Submissions</h3>
            <span className="text-xs text-gray-500">Requires review before publication</span>
          </div>

          <div className="space-y-4">
            {pendingSubmissions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{sub.productName}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      <strong>Location:</strong> {sub.location} ({sub.vendor}) • <strong>Reporter:</strong> {sub.reporterName} • {sub.submittedAt}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Pending Review
                  </span>
                </div>
                <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-amber-100">
                  &quot;{sub.concern}&quot;
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleApproveSubmission(sub.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Publish as &quot;Under Review&quot;
                  </button>
                  <button
                    onClick={() => handleDismissSubmission(sub.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs"
                  >
                    <X className="w-3.5 h-3.5" /> Dismiss / Spam
                  </button>
                </div>
              </div>
            ))}

            {pendingSubmissions.length === 0 && (
              <p className="text-xs text-gray-500 py-8 text-center">
                All submitted community incidents have been reviewed. Queue is clear!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Food Profiles */}
      {activeTab === 'foods' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Food Safety Intelligence Profiles</h3>
            <span className="text-xs text-gray-500">{foods.length} Published Articles</span>
          </div>
          {foods.map((food) => (
            <div key={food.id} className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{food.name}</h4>
                <p className="text-xs text-gray-500">{food.category} • {food.commonContaminants.length} contaminants cataloged</p>
              </div>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                Risk: {food.riskLevel}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Laboratories */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Accredited Laboratory Directory Entries</h3>
            <span className="text-xs text-gray-500">{labs.length} Verified Facilities</span>
          </div>
          {labs.map((lab) => (
            <div key={lab.id} className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{lab.name}</h4>
                <p className="text-xs text-gray-500">{lab.city}, {lab.country} • {lab.contactEmail}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {lab.isAccredited ? 'ISO 17025 Accredited' : 'Standard Facility'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
