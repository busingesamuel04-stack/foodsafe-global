'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Building2, 
  CheckSquare, 
  Thermometer, 
  Layers, 
  FileDown, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Clock, 
  Download,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Database,
  Building,
  RefreshCw,
  PlusCircle,
  X
} from 'lucide-react';
import { HygieneCheckItem, TemperatureRecord, BatchRecord, Organization } from '@/types';

export default function BusinessPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'checklists' | 'temperature' | 'batches'>('checklists');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Checklists State
  const [checklists, setChecklists] = useState<HygieneCheckItem[]>([
    { id: 'chk-1', area: 'Prep Kitchen', task: 'Sanitize stainless steel food contact workbenches (Sodium Hypochlorite 200ppm)', status: 'passed', checkedBy: 'Chef Sarah', checkedAt: '08:15 AM' },
    { id: 'chk-2', area: 'Butchery Area', task: 'Wash and sterilize raw meat slicer and knives (82°C hot water rinse)', status: 'passed', checkedBy: 'Sam Butcher', checkedAt: '08:30 AM' },
    { id: 'chk-3', area: 'Storage & Cold Room', task: 'Verify walk-in cooler seals and ensure raw meats stored below cooked foods', status: 'pending' },
    { id: 'chk-4', area: 'Staff Hygiene', task: 'Check all food handlers wearing hair restraints and clean aprons; inspect handwash sink soap', status: 'pending' },
    { id: 'chk-5', area: 'Dry Grain Storage', task: 'Inspect maize flour pallet stacks for moisture ingress or rodent droppings', status: 'passed', checkedBy: 'Grace QA', checkedAt: '09:00 AM' }
  ]);

  // Temperature Logs State
  const [temperatureLogs, setTemperatureLogs] = useState<TemperatureRecord[]>([
    { id: 'temp-1', unitName: 'Main Walk-In Cooler', targetMinTempC: 1, targetMaxTempC: 4, recordedTempC: 3.2, isWithinSafeRange: true, recordedBy: 'David K.', timestamp: 'Today, 07:30 AM' },
    { id: 'temp-2', unitName: 'Deep Meat Freezer #1', targetMinTempC: -22, targetMaxTempC: -18, recordedTempC: -19.4, isWithinSafeRange: true, recordedBy: 'David K.', timestamp: 'Today, 07:30 AM' },
    { id: 'temp-3', unitName: 'Dairy Display Refrigerator', targetMinTempC: 1, targetMaxTempC: 4, recordedTempC: 6.8, isWithinSafeRange: false, recordedBy: 'Sam Butcher', timestamp: 'Today, 10:15 AM', correctiveActionTaken: 'Condenser fan reset; moved milk crates to back-up cooler.' },
    { id: 'temp-4', unitName: 'Hot Hold Bain-Marie', targetMinTempC: 63, targetMaxTempC: 85, recordedTempC: 68.5, isWithinSafeRange: true, recordedBy: 'Chef Sarah', timestamp: 'Today, 11:45 AM' }
  ]);

  // Batch Records State
  const [batchRecords, setBatchRecords] = useState<BatchRecord[]>([
    { id: 'bat-1', productName: 'Grade 1 Hard Wheat Flour (50kg)', batchNumber: 'WF-2026-09-44', receivedDate: '2026-09-20', expiryDate: '2027-03-20', supplierName: 'Continental Grain Milling Corp', status: 'fresh', storageLocation: 'Pallet B4' },
    { id: 'bat-2', productName: 'Pasteurized Whole Milk (100L)', batchNumber: 'DAIRY-LOT-881', receivedDate: '2026-10-10', expiryDate: '2026-10-18', supplierName: 'Alpine Dairy Network', status: 'approaching_expiry', storageLocation: 'Cold Room Shelf 2' },
    { id: 'bat-3', productName: 'Raw Beef Quarters (250kg)', batchNumber: 'BEEF-ABAT-129', receivedDate: '2026-10-12', expiryDate: '2026-10-16', supplierName: 'Certified Regional Meat Provisions', status: 'fresh', storageLocation: 'Meat Chiller' },
    { id: 'bat-4', productName: 'Bulk High-Oleic Cooking Oil', batchNumber: 'OIL-TEST-004', receivedDate: '2026-09-01', expiryDate: '2026-09-30', supplierName: 'International Edible Oils Ltd', status: 'quarantined', storageLocation: 'Quarantine Bay A' }
  ]);

  // Form Inputs
  const [newTempUnit, setNewTempUnit] = useState('Main Walk-In Cooler');
  const [newTempReading, setNewTempReading] = useState('');
  
  // Modals
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    productName: '',
    batchNumber: '',
    supplierName: '',
    receivedDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    storageLocation: 'Main Storage Shelf 1',
    status: 'fresh' as BatchRecord['status']
  });

  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [newChecklist, setNewChecklist] = useState({
    area: 'Kitchen Area',
    task: ''
  });

  // Load Organization & Business Records from Supabase
  useEffect(() => {
    async function initBusinessWorkspace() {
      if (!isSupabaseConfigured || !supabase || !user) return;
      setLoadingData(true);

      try {
        // 1. Fetch user's organization
        let currentOrg: Organization | null = null;
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .limit(1);

        if (!orgError && orgData && orgData.length > 0) {
          const raw = orgData[0];
          currentOrg = {
            id: raw.id,
            name: raw.name,
            ownerId: raw.owner_id,
            industryType: raw.industry_type,
            subscriptionTier: raw.subscription_tier,
            createdAt: raw.created_at
          };
          setOrganization(currentOrg);
          setIsLiveConnected(true);
        } else if (user) {
          // Auto-provision initial organization for business owner if none exists
          const orgName = profile?.fullName ? `${profile.fullName}'s Food Enterprise` : 'My Food Enterprise';
          const { data: newOrgData, error: createOrgErr } = await supabase
            .from('organizations')
            .insert({
              name: orgName,
              owner_id: user.id,
              industry_type: 'restaurant',
              subscription_tier: 'free'
            })
            .select('*')
            .single();

          if (!createOrgErr && newOrgData) {
            currentOrg = {
              id: newOrgData.id,
              name: newOrgData.name,
              ownerId: newOrgData.owner_id,
              industryType: newOrgData.industry_type,
              subscriptionTier: newOrgData.subscription_tier,
              createdAt: newOrgData.created_at
            };
            setOrganization(currentOrg);
            setIsLiveConnected(true);
          }
        }

        // 2. If organization resolved, load its records
        if (currentOrg) {
          const orgId = currentOrg.id;

          // Fetch checklists
          const { data: chkData } = await supabase
            .from('hygiene_checklists')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: true });

          if (chkData && chkData.length > 0) {
            setChecklists(chkData.map(c => ({
              id: c.id,
              area: c.area,
              task: c.task,
              status: c.status as 'passed' | 'failed' | 'pending',
              checkedBy: c.checked_by || undefined,
              checkedAt: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
              notes: c.notes || undefined
            })));
          }

          // Fetch temperature logs
          const { data: tempData } = await supabase
            .from('temperature_logs')
            .select('*')
            .eq('organization_id', orgId)
            .order('logged_at', { ascending: false });

          if (tempData && tempData.length > 0) {
            setTemperatureLogs(tempData.map(t => ({
              id: t.id,
              unitName: t.unit_name,
              recordedTempC: Number(t.recorded_temp_c),
              targetMinTempC: Number(t.target_min_temp_c),
              targetMaxTempC: Number(t.target_max_temp_c),
              isWithinSafeRange: Boolean(t.is_within_safe_range),
              recordedBy: t.recorded_by,
              timestamp: new Date(t.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              correctiveActionTaken: t.corrective_action || undefined
            })));
          }

          // Fetch batch records
          const { data: batData } = await supabase
            .from('batch_records')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

          if (batData && batData.length > 0) {
            setBatchRecords(batData.map(b => ({
              id: b.id,
              productName: b.product_name,
              batchNumber: b.batch_number,
              receivedDate: b.received_date,
              expiryDate: b.expiry_date,
              supplierName: b.supplier_name,
              status: b.status as BatchRecord['status'],
              storageLocation: b.storage_location || 'Storage Bay'
            })));
          }
        }
      } catch (err) {
        console.warn('Error connecting to Supabase business records:', err);
      } finally {
        setLoadingData(false);
      }
    }

    initBusinessWorkspace();
  }, [user, profile]);

  // Toggle checklist status and persist to Supabase
  const toggleChecklistStatus = async (id: string) => {
    const item = checklists.find(c => c.id === id);
    if (!item) return;

    const nextStatus = item.status === 'passed' ? 'failed' : item.status === 'failed' ? 'pending' : 'passed';
    const checker = nextStatus !== 'pending' ? (profile?.fullName || 'Duty Supervisor') : undefined;
    const timeStr = nextStatus !== 'pending' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

    setChecklists(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: nextStatus,
          checkedBy: checker,
          checkedAt: timeStr
        };
      }
      return c;
    }));

    // Persist to Supabase if UUID and connected
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (supabase && organization && isUuid) {
      try {
        await supabase
          .from('hygiene_checklists')
          .update({
            status: nextStatus,
            checked_by: checker || null
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Could not update checklist item in Supabase:', err);
      }
    }
  };

  // Add new checklist task
  const handleAddChecklistTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklist.task.trim()) return;

    const newItem: HygieneCheckItem = {
      id: `chk-${Date.now()}`,
      area: newChecklist.area,
      task: newChecklist.task.trim(),
      status: 'pending'
    };

    if (supabase && organization) {
      try {
        const { data, error } = await supabase
          .from('hygiene_checklists')
          .insert({
            organization_id: organization.id,
            area: newChecklist.area,
            task: newChecklist.task.trim(),
            status: 'pending'
          })
          .select('id')
          .single();

        if (!error && data) {
          newItem.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to insert checklist to Supabase:', err);
      }
    }

    setChecklists([...checklists, newItem]);
    setNewChecklist({ area: 'Kitchen Area', task: '' });
    setShowAddChecklistModal(false);
  };

  // Add Temperature reading and persist to Supabase
  const handleAddTemp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTempReading) return;
    const tempNum = parseFloat(newTempReading);
    const isCooler = newTempUnit.includes('Cooler') || newTempUnit.includes('Display');
    const isFreezer = newTempUnit.includes('Freezer');
    const min = isFreezer ? -22 : isCooler ? 1 : 60;
    const max = isFreezer ? -18 : isCooler ? 4 : 85;
    const isSafe = tempNum >= min && tempNum <= max;
    const recordedBy = profile?.fullName || 'Duty Supervisor';
    const correctiveAction = isSafe ? undefined : 'Flagged for inspection by technical maintenance';

    const newEntry: TemperatureRecord = {
      id: `temp-${Date.now()}`,
      unitName: newTempUnit,
      targetMinTempC: min,
      targetMaxTempC: max,
      recordedTempC: tempNum,
      isWithinSafeRange: isSafe,
      recordedBy,
      timestamp: 'Just now',
      correctiveActionTaken: correctiveAction
    };

    if (supabase && organization) {
      try {
        const { data, error } = await supabase
          .from('temperature_logs')
          .insert({
            organization_id: organization.id,
            unit_name: newTempUnit,
            recorded_temp_c: tempNum,
            target_min_temp_c: min,
            target_max_temp_c: max,
            recorded_by: recordedBy,
            corrective_action: correctiveAction || null
          })
          .select('id')
          .single();

        if (!error && data) {
          newEntry.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to insert temperature log to Supabase:', err);
      }
    }

    setTemperatureLogs([newEntry, ...temperatureLogs]);
    setNewTempReading('');
  };

  // Add new Batch Record and persist to Supabase
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.productName || !newBatch.batchNumber || !newBatch.expiryDate) return;

    const newRecord: BatchRecord = {
      id: `bat-${Date.now()}`,
      productName: newBatch.productName.trim(),
      batchNumber: newBatch.batchNumber.trim(),
      supplierName: newBatch.supplierName.trim() || 'Direct Producer',
      receivedDate: newBatch.receivedDate,
      expiryDate: newBatch.expiryDate,
      status: newBatch.status,
      storageLocation: newBatch.storageLocation.trim()
    };

    if (supabase && organization) {
      try {
        const { data, error } = await supabase
          .from('batch_records')
          .insert({
            organization_id: organization.id,
            product_name: newBatch.productName.trim(),
            batch_number: newBatch.batchNumber.trim(),
            supplier_name: newBatch.supplierName.trim() || 'Direct Producer',
            received_date: newBatch.receivedDate,
            expiry_date: newBatch.expiryDate,
            status: newBatch.status,
            storage_location: newBatch.storageLocation.trim()
          })
          .select('id')
          .single();

        if (!error && data) {
          newRecord.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to insert batch record to Supabase:', err);
      }
    }

    setBatchRecords([newRecord, ...batchRecords]);
    setNewBatch({
      productName: '',
      batchNumber: '',
      supplierName: '',
      receivedDate: new Date().toISOString().slice(0, 10),
      expiryDate: '',
      storageLocation: 'Main Storage Shelf 1',
      status: 'fresh'
    });
    setShowAddBatchModal(false);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Area,Task,Status,CheckedBy,CheckedAt\n" +
      checklists.map(c => `"${c.area}","${c.task}","${c.status}","${c.checkedBy || ''}","${c.checkedAt || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `food_safety_hygiene_audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              B2B HACCP Workspace
            </span>
            {isLiveConnected && organization ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Live Organization: {organization.name}
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                Demo Organization: Metropolitan Grand Culinary Group (Global Evaluation)
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Food Business Safety & Compliance Suite
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
            Digitize your HACCP procedures, temperature monitoring, and batch recalls. Replace lost clipboards with tamper-evident digital records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-emerald-500 hover:text-emerald-700 text-gray-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Audit CSV
          </button>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade Plan ($10/mo)
          </Link>
        </div>
      </div>

      {/* Compliance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
            Today&apos;s Checklist Progress
            <CheckSquare className="w-4 h-4 text-brand-600" />
          </span>
          <p className="text-2xl font-black text-gray-900">
            {checklists.filter(c => c.status === 'passed').length} / {checklists.length}
          </p>
          <p className="text-xs text-brand-700 font-medium">
            {checklists.length > 0 ? Math.round((checklists.filter(c => c.status === 'passed').length / checklists.length) * 100) : 0}% Sanitation Completed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
            Cold-Chain Integrity
            <Thermometer className="w-4 h-4 text-blue-600" />
          </span>
          <p className="text-2xl font-black text-gray-900">
            {temperatureLogs.filter(t => t.isWithinSafeRange).length} / {temperatureLogs.length} Units Safe
          </p>
          <p className="text-xs text-amber-600 font-medium">
            {temperatureLogs.filter(t => !t.isWithinSafeRange).length} breach(es) logged & monitored
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-gray-500 flex items-center justify-between">
            Tracked Batch Lots
            <Layers className="w-4 h-4 text-purple-600" />
          </span>
          <p className="text-2xl font-black text-gray-900">{batchRecords.length} Active Lots</p>
          <p className="text-xs text-gray-500 font-medium">
            {batchRecords.filter(b => b.status === 'quarantined').length} quarantined lot(s)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-6 text-sm font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('checklists')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'checklists' ? 'border-brand-600 text-brand-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Daily Hygiene Checklists ({checklists.length})
        </button>
        <button
          onClick={() => setActiveTab('temperature')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'temperature' ? 'border-brand-600 text-brand-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          Refrigeration Temperature Logs ({temperatureLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'batches' ? 'border-brand-600 text-brand-700' : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Batch & Expiration Tracking ({batchRecords.length})
        </button>
      </div>

      {/* Tab 1: Hygiene Checklists */}
      {activeTab === 'checklists' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Operational Sanitation Checklist</h3>
              <p className="text-xs text-gray-500">Tap status button to toggle between Passed, Failed, or Pending.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddChecklistModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                Shift: Current Rotation
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {checklists.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.area}</span>
                  <p className="text-sm font-semibold text-gray-900">{item.task}</p>
                  {item.checkedBy && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      Verified by {item.checkedBy} {item.checkedAt && `at ${item.checkedAt}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => toggleChecklistStatus(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      item.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : item.status === 'failed'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {item.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                    {item.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                    <span className="capitalize">{item.status}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Temperature Logs */}
      {activeTab === 'temperature' && (
        <div className="space-y-6">
          {/* Quick Temperature Input Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Record Instant Temperature Check</h3>
            <form onSubmit={handleAddTemp} className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={newTempUnit}
                onChange={(e) => setNewTempUnit(e.target.value)}
                className="w-full sm:w-1/3 text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option>Main Walk-In Cooler (Target 1-4°C)</option>
                <option>Deep Meat Freezer #1 (Target -22 to -18°C)</option>
                <option>Dairy Display Refrigerator (Target 1-4°C)</option>
                <option>Hot Hold Bain-Marie (Target 63-85°C)</option>
              </select>

              <div className="relative w-full sm:w-1/3">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 3.4"
                  value={newTempReading}
                  onChange={(e) => setNewTempReading(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">°C</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Log Reading
              </button>
            </form>
          </div>

          {/* Temperature Records Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Refrigeration & Heat Logs</h3>
              <span className="text-xs text-gray-500">Auto-validates against WHO/HACCP ranges</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold">Cooling/Heating Unit</th>
                    <th className="p-4 font-semibold">Recorded Temp</th>
                    <th className="p-4 font-semibold">Safe Target Range</th>
                    <th className="p-4 font-semibold">Compliance Status</th>
                    <th className="p-4 font-semibold">Auditor / Time</th>
                    <th className="p-4 font-semibold">Corrective Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {temperatureLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">{entry.unitName}</td>
                      <td className="p-4 font-black text-gray-900 text-sm">
                        {entry.recordedTempC}°C
                      </td>
                      <td className="p-4 text-gray-500">
                        {entry.targetMinTempC}°C to {entry.targetMaxTempC}°C
                      </td>
                      <td className="p-4">
                        {entry.isWithinSafeRange ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Temperature Breach
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {entry.recordedBy} • <span className="text-gray-400">{entry.timestamp}</span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {entry.correctiveActionTaken || <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Batch Tracker */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Food Inventory & Batch Records</h3>
              <p className="text-xs text-gray-500">Track delivery lot numbers, suppliers, and expiration windows.</p>
            </div>
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Register Food Batch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3 font-semibold">Food Product</th>
                  <th className="p-3 font-semibold">Lot / Batch #</th>
                  <th className="p-3 font-semibold">Supplier</th>
                  <th className="p-3 font-semibold">Received</th>
                  <th className="p-3 font-semibold">Expiry Date</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Bay / Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batchRecords.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{batch.productName}</td>
                    <td className="p-3 font-mono text-gray-600">{batch.batchNumber}</td>
                    <td className="p-3 text-gray-600">{batch.supplierName}</td>
                    <td className="p-3 text-gray-500">{batch.receivedDate}</td>
                    <td className="p-3 text-gray-900 font-semibold">{batch.expiryDate}</td>
                    <td className="p-3">
                      {batch.status === 'fresh' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Fresh</span>
                      )}
                      {batch.status === 'approaching_expiry' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Expiring Soon</span>
                      )}
                      {batch.status === 'quarantined' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">Quarantined</span>
                      )}
                      {batch.status === 'expired' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-900">Expired</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">{batch.storageLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Batch */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddBatchModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">Register Food Batch / Lot</h3>

            <form onSubmit={handleAddBatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasteurized Milk 500ml"
                  value={newBatch.productName}
                  onChange={(e) => setNewBatch({ ...newBatch, productName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Batch / Lot # *</label>
                  <input
                    type="text"
                    required
                    placeholder="LOT-2025-01"
                    value={newBatch.batchNumber}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    placeholder="Supplier Co."
                    value={newBatch.supplierName}
                    onChange={(e) => setNewBatch({ ...newBatch, supplierName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Received Date *</label>
                  <input
                    type="date"
                    required
                    value={newBatch.receivedDate}
                    onChange={(e) => setNewBatch({ ...newBatch, receivedDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={newBatch.status}
                    onChange={(e) => setNewBatch({ ...newBatch, status: e.target.value as BatchRecord['status'] })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                  >
                    <option value="fresh">Fresh</option>
                    <option value="approaching_expiry">Approaching Expiry</option>
                    <option value="quarantined">Quarantined</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    placeholder="Bay / Shelf"
                    value={newBatch.storageLocation}
                    onChange={(e) => setNewBatch({ ...newBatch, storageLocation: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs mt-2"
              >
                Save Batch Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Checklist Task */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddChecklistModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">Add Sanitation Checklist Task</h3>

            <form onSubmit={handleAddChecklistTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Station / Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prep Kitchen, Walk-in Cooler, Cold Storage"
                  value={newChecklist.area}
                  onChange={(e) => setNewChecklist({ ...newChecklist, area: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sanitation Task Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Disinfect cutting surfaces with chlorine sanitizing solution..."
                  value={newChecklist.task}
                  onChange={(e) => setNewChecklist({ ...newChecklist, task: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs mt-2"
              >
                Add Checklist Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
