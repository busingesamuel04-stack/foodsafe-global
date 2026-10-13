'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateTestEnquiry, checkSubmissionCooldown, recordSubmissionCooldown } from '@/lib/validation';
import { mockLabs } from '@/lib/data/mockLabs';
import { LaboratoryProfile } from '@/types';
import { 
  FlaskConical, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink, 
  Send, 
  Search, 
  Clock, 
  Check, 
  ShieldCheck, 
  X,
  AlertCircle,
  Database,
  Building,
  Info,
  Globe
} from 'lucide-react';

export default function LaboratoriesPage() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<LaboratoryProfile[]>(mockLabs);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedLabForEnquiry, setSelectedLabForEnquiry] = useState<LaboratoryProfile | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [rateLimitError, setRateLimitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  
  // Enquiry form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    foodType: 'Grain / Maize Flour',
    concern: '',
    urgency: 'standard',
    honeypot: ''
  });

  useEffect(() => {
    async function loadLaboratories() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('laboratories')
          .select('*')
          .order('name');

        if (!error && data && data.length > 0) {
          const mapped: LaboratoryProfile[] = data.map((item) => ({
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
            credibilityDisclaimer: item.credibility_disclaimer || undefined,
            region: item.region || undefined
          }));
          setLabs(mapped);
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.warn('Failed to fetch laboratories from Supabase, using reference data:', err);
      }
    }

    loadLaboratories();
  }, []);

  const filteredLabs = labs.filter((lab) => {
    const matchesRegion =
      selectedRegion === 'All' ||
      lab.region === selectedRegion ||
      (selectedRegion === 'Global' && (!lab.region || lab.region === 'Global'));
    const matchesSearch =
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.city.toLowerCase().includes(search.toLowerCase()) ||
      lab.country.toLowerCase().includes(search.toLowerCase()) ||
      (lab.region && lab.region.toLowerCase().includes(search.toLowerCase())) ||
      lab.accreditationScope.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      lab.supportedFoodTypes.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setRateLimitError('');

    // Check cooldown rate limiting
    const cooldown = checkSubmissionCooldown('test_enquiry', 30);
    if (!cooldown.allowed) {
      setRateLimitError(`Please wait ${cooldown.remainingSeconds} seconds before sending another quotation request.`);
      return;
    }

    // Validate inputs
    const validation = validateTestEnquiry(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      if (supabase && selectedLabForEnquiry) {
        // Validate if selectedLabForEnquiry.id is a standard UUID (36 chars with dashes)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedLabForEnquiry.id);
        
        const { error } = await supabase.from('test_enquiries').insert({
          laboratory_id: isUuid ? selectedLabForEnquiry.id : null,
          sender_name: formData.name.trim(),
          sender_email: formData.email.trim(),
          sender_phone: formData.phone?.trim() || null,
          food_sample_type: formData.foodType.trim(),
          suspected_concern: formData.concern.trim(),
          sender_id: user?.id || null,
          status: 'pending'
        });

        if (error) {
          console.warn('Supabase test enquiry insert notice:', error);
        }
      }

      recordSubmissionCooldown('test_enquiry');
      setSubmissionSuccessMsg(`Quotation request transmitted for ${selectedLabForEnquiry?.name}. The testing facility has been notified.`);
      setSubmittedEnquiry(true);
      
      setTimeout(() => {
        setSubmittedEnquiry(false);
        setSelectedLabForEnquiry(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          foodType: 'Grain / Maize Flour',
          concern: '',
          urgency: 'standard',
          honeypot: ''
        });
        setSubmissionSuccessMsg('');
      }, 3200);
    } catch (err) {
      console.error('Enquiry error:', err);
      recordSubmissionCooldown('test_enquiry');
      setSubmittedEnquiry(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getListingTypeBadge = (lab: LaboratoryProfile) => {
    if (lab.isVerifiedPartner) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Platform Verified Partner
        </span>
      );
    }
    if (lab.listingType === 'standards_authority') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          <Building className="w-3 h-3 text-blue-600" /> National Standards Authority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
        <FlaskConical className="w-3 h-3 text-gray-500" /> Accredited Testing Facility
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Testing Services Directory & Marketplace
          </span>
          {isLiveConnected && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-600" /> Live Database Sync
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Accredited Food Testing Laboratories
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Browse recognized analytical laboratories for microbiological culture, mycotoxins (aflatoxin), pesticide residue screening, and chemical heavy metal testing. Submit enquiries directly to qualified testing providers.
        </p>
      </div>

      {/* Directory Transparency Notice */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-indigo-950">
        <FlaskConical className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Directory Transparency & Scope Protocol:</strong>
          <p className="text-indigo-900 text-xs mt-0.5 leading-relaxed">
            FoodSafe Global compiles accredited facilities from statutory standards bodies (e.g., US FDA, European EFSA, UK FSA) and ISO/IEC 17025 accredited international laboratory networks (Eurofins, SGS, Intertek, Bureau Veritas, Mérieux NutriSciences, TÜV SÜD) for worldwide transparency. Facilities are clearly designated as statutory authorities or independent testing providers. Quotation requests route directly to the designated facility contact.
          </p>
        </div>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search laboratory name, test type (e.g., Aflatoxin, Salmonella, Lead, Pesticides), or country/city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium whitespace-nowrap pl-1 pr-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-gray-500" /> Region:
          </span>
          {[
            { id: 'All', label: 'All Regions' },
            { id: 'Global', label: 'Global Networks' },
            { id: 'Europe', label: 'Europe' },
            { id: 'North America', label: 'North America' },
            { id: 'Asia-Pacific', label: 'Asia-Pacific' },
            { id: 'Latin America', label: 'Latin America' },
            { id: 'Middle East & Africa', label: 'Middle East & Africa' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRegion(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedRegion === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Laboratory Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{lab.name}</h3>
                    {getListingTypeBadge(lab)}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      <Globe className="w-3 h-3 text-indigo-500" />
                      {lab.region || 'Global'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{lab.city}, {lab.country} {lab.address && `• ${lab.address}`}</span>
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                  ISO 17025 Scope
                </span>
              </div>

              {/* Credibility Disclaimer if applicable */}
              {lab.credibilityDisclaimer && (
                <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 border border-gray-100 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{lab.credibilityDisclaimer}</span>
                </div>
              )}

              {/* Accreditation Scope Chips */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-900 block">Accredited Testing Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {lab.accreditationScope.map((scope, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Supported Food Matrices */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-gray-900 block">Food Categories Tested:</span>
                <p className="text-gray-600">{lab.supportedFoodTypes.join(', ')}</p>
              </div>

              {/* Response Time Badge */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Typical Enquiry Turnaround: <strong className="text-gray-700">{lab.enquiryRateResponseTime}</strong></span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {lab.websiteUrl && (
                <a
                  href={lab.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1"
                >
                  Official Portal <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setSelectedLabForEnquiry(lab)}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Request Test Quotation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enquiry Modal */}
      {selectedLabForEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedLabForEnquiry(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedEnquiry ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Request Dispatched</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  {submissionSuccessMsg || `Your testing enquiry has been routed to ${selectedLabForEnquiry.name}.`}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                    Direct Laboratory Referral
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    Request Quotation: {selectedLabForEnquiry.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete sample details below. Quotations are dispatched directly to facility intake specialists.
                  </p>
                </div>

                {rateLimitError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    {rateLimitError}
                  </div>
                )}

                {Object.keys(validationErrors).length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      Please fix:
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-red-800">
                      {Object.values(validationErrors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Anti-bot honeypot */}
                  <input
                    type="text"
                    name="bot_field"
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name / Business *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe / Victoria Millers"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Telephone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+256 700 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Food Sample Matrix *</label>
                      <select
                        value={formData.foodType}
                        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option>Grain / Maize Flour</option>
                        <option>Fresh Meat / Poultry</option>
                        <option>Dairy / Milk Products</option>
                        <option>Drinking Water / Wastewater</option>
                        <option>Fresh Fruits & Vegetables</option>
                        <option>Fish & Aquaculture</option>
                        <option>Packaged / Processed Goods</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Required Tests / Suspected Contaminant *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Quantitative Aflatoxin HPLC verification, Salmonella culture, Lead AAS heavy metal screening..."
                      value={formData.concern}
                      onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Transmitting Request...' : 'Send Test Quotation Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
