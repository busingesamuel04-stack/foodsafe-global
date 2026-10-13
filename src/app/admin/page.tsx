'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
  BookOpen,
  ShieldAlert,
  Lock,
  Database,
  Mail,
  User,
  Clock,
  RefreshCw
} from 'lucide-react';
import { mockAlerts } from '@/lib/data/mockAlerts';
import { mockFoods } from '@/lib/data/mockFoods';
import { mockLabs } from '@/lib/data/mockLabs';
import { FoodAlert, FoodProfile, LaboratoryProfile, AlertVerificationStatus } from '@/types';

interface PendingIncident {
  id: string;
  productName: string;
  vendor: string;
  location: string;
  concern: string;
  submittedAt: string;
  reporterName: string;
  contactEmail?: string;
  status: string;
  rawId?: string;
}

interface TestEnquiryRecord {
  id: string;
  senderName: string;
  senderEmail: string;
  foodSampleType: string;
  suspectedConcern: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'alerts' | 'foods' | 'labs' | 'submissions' | 'enquiries'>('alerts');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Admin Data States
  const [alerts, setAlerts] = useState<FoodAlert[]>(mockAlerts);
  const [foods, setFoods] = useState<FoodProfile[]>(mockFoods);
  const [labs, setLabs] = useState<LaboratoryProfile[]>(mockLabs);
  const [enquiries, setEnquiries] = useState<TestEnquiryRecord[]>([]);

  // Submissions Queue State
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingIncident[]>([
    {
      id: 'sub-1',
      productName: 'Commercial Sachet Waragi (Gin)',
      vendor: 'Informal roadside kiosk',
      location: 'Kalerwe Market',
      concern: 'Pungent industrial solvent odor; suspected hazardous methanol contamination.',
      submittedAt: 'Today, 09:30 AM',
      reporterName: 'Moses K.',
      status: 'under_review'
    },
    {
      id: 'sub-2',
      productName: 'Pre-packaged Smoked Tilapia',
      vendor: 'Lake Shore Fish Stall',
      location: 'Ggaba Landing Site',
      concern: 'Severe chemical preservative odor, abnormal chalky white flesh residue.',
      submittedAt: 'Yesterday, 16:45 PM',
      reporterName: 'Anonymous Citizen',
      status: 'under_review'
    }
  ]);

  // New Alert Form state
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertProduct, setNewAlertProduct] = useState('');
  const [newAlertContaminant, setNewAlertContaminant] = useState('');
  const [newAlertAuthority, setNewAlertAuthority] = useState('WHO / FDA Global Food Surveillance');
  const [newAlertAction, setNewAlertAction] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Load live data from Supabase
  const loadAdminData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setRefreshing(true);

    try {
      // 1. Fetch incident reports
      const { data: incidentData } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (incidentData && incidentData.length > 0) {
        setPendingSubmissions(incidentData.map((inc) => ({
          id: inc.id,
          rawId: inc.id,
          productName: inc.food_product,
          vendor: inc.brand_or_vendor || 'Unspecified vendor',
          location: inc.purchase_location,
          concern: inc.concern_description,
          submittedAt: new Date(inc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          reporterName: inc.reporter_name || 'Anonymous Citizen',
          contactEmail: inc.contact_email || undefined,
          status: inc.moderation_status
        })));
        setIsLiveConnected(true);
      }

      // 2. Fetch food alerts
      const { data: alertData } = await supabase
        .from('food_alerts')
        .select('*')
        .order('published_at', { ascending: false });

      if (alertData && alertData.length > 0) {
        setAlerts(alertData.map((item) => ({
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
          recommendedAction: item.recommended_action
        })));
        setIsLiveConnected(true);
      }

      // 3. Fetch laboratories
      const { data: labData } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');

      if (labData && labData.length > 0) {
        setLabs(labData.map((item) => ({
          id: item.id,
          name: item.name,
          country: item.country,
          city: item.city,
          address: item.address || undefined,
          isAccredited: item.is_accredited,
          accreditationScope: item.accreditation_scope || [],
          supportedFoodTypes: item.supported_food_types || [],
          contactEmail: item.contact_email,
          contactPhone: item.contact_phone || undefined,
          websiteUrl: item.website_url || undefined,
          enquiryRateResponseTime: item.enquiry_rate_response_time || '24-48 hours',
          isVerifiedPartner: item.is_verified_partner || false,
          listingType: (item.listing_type as LaboratoryProfile['listingType']) || 'accredited_commercial',
          credibilityDisclaimer: item.credibility_disclaimer || undefined
        })));
      }

      // 4. Fetch test enquiries
      const { data: enquiryData } = await supabase
        .from('test_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (enquiryData && enquiryData.length > 0) {
        setEnquiries(enquiryData.map((enq) => ({
          id: enq.id,
          senderName: enq.sender_name,
          senderEmail: enq.sender_email,
          foodSampleType: enq.food_sample_type,
          suspectedConcern: enq.suspected_concern,
          status: enq.status,
          createdAt: new Date(enq.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (err) {
      console.warn('Error loading live admin data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle || !newAlertProduct) return;
    setPublishing(true);

    const alertItem: FoodAlert = {
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

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('food_alerts')
          .insert({
            title: alertItem.title,
            product_name: alertItem.productName,
            contaminant: alertItem.contaminant,
            status: alertItem.status,
            severity: alertItem.severity,
            issuing_authority_or_source: alertItem.issuingAuthorityOrSource,
            published_at: alertItem.publishedAt,
            affected_regions: alertItem.affectedRegions,
            recommended_action: alertItem.recommendedAction
          })
          .select('id')
          .single();

        if (!error && data) {
          alertItem.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to insert alert into Supabase:', err);
      }
    }

    setAlerts([alertItem, ...alerts]);
    setNewAlertTitle('');
    setNewAlertProduct('');
    setNewAlertContaminant('');
    setNewAlertAction('');
    setPublishing(false);
  };

  const handleApproveSubmission = async (id: string) => {
    const sub = pendingSubmissions.find(s => s.id === id);
    if (!sub) return;

    // 1. Convert to public alert
    const convertedAlert: FoodAlert = {
      id: `alert-sub-${Date.now()}`,
      title: `Field Hazard Notice: ${sub.productName}`,
      productName: sub.productName,
      contaminant: sub.concern,
      status: 'under_review',
      severity: 'medium',
      issuingAuthorityOrSource: `Community Field Report (${sub.location})`,
      publishedAt: new Date().toISOString().slice(0, 10),
      affectedRegions: [sub.location],
      recommendedAction: 'Public advised caution while municipal health inspectors collect laboratory samples.'
    };

    // 2. Persist update in Supabase
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (supabase && isUuid) {
      try {
        await supabase
          .from('incident_reports')
          .update({ moderation_status: 'verified' })
          .eq('id', id);

        await supabase
          .from('food_alerts')
          .insert({
            title: convertedAlert.title,
            product_name: convertedAlert.productName,
            contaminant: convertedAlert.contaminant,
            status: convertedAlert.status,
            severity: convertedAlert.severity,
            issuing_authority_or_source: convertedAlert.issuingAuthorityOrSource,
            published_at: convertedAlert.publishedAt,
            affected_regions: convertedAlert.affectedRegions,
            recommended_action: convertedAlert.recommendedAction
          });
      } catch (err) {
        console.warn('Failed to persist approval in Supabase:', err);
      }
    }

    setAlerts([convertedAlert, ...alerts]);
    setPendingSubmissions(prev => prev.filter(s => s.id !== id));
  };

  const handleDismissSubmission = async (id: string) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (supabase && isUuid) {
      try {
        await supabase
          .from('incident_reports')
          .update({ moderation_status: 'dismissed' })
          .eq('id', id);
      } catch (err) {
        console.warn('Failed to dismiss in Supabase:', err);
      }
    }
    setPendingSubmissions(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteAlert = async (id: string) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (supabase && isUuid) {
      try {
        await supabase
          .from('food_alerts')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Failed to delete alert in Supabase:', err);
      }
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // AUTHORIZATION GUARDS
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // Guard 1: Must be authenticated
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-red-200 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Administrator Access Restricted</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            The FoodSafe Global administration console requires verified administrator authorization. Public and unauthenticated access is strictly disabled.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login?redirect=/admin"
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs"
            >
              Sign In with Administrator Credentials
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard 2: Must possess 'admin' role in profile
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-amber-200 shadow-sm">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Insufficient Privileges</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            You are signed in as <strong>{user.email}</strong> with role <span className="font-bold uppercase text-amber-800">{profile?.role || 'consumer'}</span>. Only platform administrators can view or moderate safety notices and incoming incident reports.
          </p>
          <div className="pt-2">
            <Link
              href="/business"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs"
            >
              Go to Business Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeReviewQueue = pendingSubmissions.filter(s => s.status === 'under_review' || s.status === 'pending_review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
              Administrative Operations
            </span>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" /> Live Supabase Connected
              </span>
            ) : (
              <span className="text-xs text-gray-500 font-medium">Session Evaluation Mode</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Admin Dashboard & Content Manager
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
            Publish sourced safety alerts, moderate citizen incident submissions, and manage laboratory directory listings with direct database persistence.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-700 shadow-2xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Records'}
        </button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
          <span className="text-2xl font-black text-amber-600">{activeReviewQueue.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-medium text-gray-500 block">Lab Enquiries</span>
          <span className="text-2xl font-black text-blue-600">{enquiries.length}</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-6 text-sm font-semibold text-gray-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'alerts' ? 'border-red-600 text-red-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Safety Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'submissions' ? 'border-amber-600 text-amber-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          Community Moderation Queue ({activeReviewQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'enquiries' ? 'border-blue-600 text-blue-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Testing Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'foods' ? 'border-brand-600 text-brand-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Food Profiles ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
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
              Publish Sourced Public Safety Notice (Database Persisted)
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
                  placeholder="Issuing Authority (e.g. US FDA, European EFSA, WHO, Codex, UK FSA)"
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
                disabled={publishing}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors disabled:opacity-60"
              >
                {publishing ? 'Publishing to Database...' : 'Publish Live Alert'}
              </button>
            </form>
          </div>

          {/* Current Alerts List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-900">{alert.title}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                      {alert.status}
                    </span>
                    {alert.isReferenceOrHistorical && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Historical Baseline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    Product: {alert.productName} • Hazard: {alert.contaminant} • Source: {alert.issuingAuthorityOrSource}
                  </p>
                  <p className="text-xs text-gray-500">Published: {alert.publishedAt}</p>
                </div>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
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
            {activeReviewQueue.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{sub.productName}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      <strong>Location:</strong> {sub.location} ({sub.vendor}) • <strong>Reporter:</strong> {sub.reporterName} {sub.contactEmail && `(${sub.contactEmail})`} • {sub.submittedAt}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Under Review
                  </span>
                </div>
                <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-amber-100">
                  &quot;{sub.concern}&quot;
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleApproveSubmission(sub.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Publish as &quot;Under Review&quot;
                  </button>
                  <button
                    onClick={() => handleDismissSubmission(sub.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Dismiss / Spam
                  </button>
                </div>
              </div>
            ))}

            {activeReviewQueue.length === 0 && (
              <p className="text-xs text-gray-500 py-8 text-center">
                All submitted community incidents have been reviewed. Queue is clear!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Testing Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Laboratory Testing Quotation Requests</h3>
              <p className="text-xs text-gray-500">Transmitted from consumer and food business sample requests</p>
            </div>
            <span className="text-xs text-gray-500 font-semibold">{enquiries.length} Enquiries Logged</span>
          </div>
          {enquiries.map((enq) => (
            <div key={enq.id} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {enq.foodSampleType} — {enq.senderName} ({enq.senderEmail})
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {enq.status}
                </span>
              </div>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                &quot;{enq.suspectedConcern}&quot;
              </p>
              <p className="text-[11px] text-gray-400">Received: {enq.createdAt}</p>
            </div>
          ))}
          {enquiries.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-500">
              No laboratory quotation requests recorded yet.
            </div>
          )}
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
            <span className="text-xs text-gray-500">{labs.length} Listed Facilities</span>
          </div>
          {labs.map((lab) => (
            <div key={lab.id} className="p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">{lab.name}</h4>
                  {lab.listingType === 'standards_authority' && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Standards Body
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{lab.city}, {lab.country} • {lab.contactEmail}</p>
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
