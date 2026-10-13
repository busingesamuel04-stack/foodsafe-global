'use client';

import React, { useState } from 'react';
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
  X
} from 'lucide-react';

export default function LaboratoriesPage() {
  const [search, setSearch] = useState('');
  const [selectedLabForEnquiry, setSelectedLabForEnquiry] = useState<LaboratoryProfile | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(false);
  
  // Enquiry form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    foodType: 'Grain / Maize Flour',
    concern: '',
    urgency: 'standard'
  });

  const filteredLabs = mockLabs.filter((lab) =>
    lab.name.toLowerCase().includes(search.toLowerCase()) ||
    lab.city.toLowerCase().includes(search.toLowerCase()) ||
    lab.accreditationScope.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    lab.supportedFoodTypes.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        urgency: 'standard'
      });
    }, 2800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Testing Services Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Accredited Food Testing Laboratories
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Browse recognized analytical laboratories for microbiological culture, mycotoxins (aflatoxin), pesticide residue screening, and chemical heavy metal testing. Submit enquiries directly to qualified testing providers.
        </p>
      </div>

      {/* Info notice */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-indigo-950">
        <FlaskConical className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Accredited Testing Referral Network:</strong>
          <p className="text-indigo-900 text-xs mt-0.5 leading-relaxed">
            Our platform organizes verified testing scopes from national bureaus (such as UNBS) and ISO/IEC 17025 accredited private facilities. Select a testing provider below to route your sample request.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search laboratory name, test type (e.g., Aflatoxin, Salmonella, Lead), or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{lab.name}</h3>
                    {lab.isVerifiedPartner && (
                      <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Verified Scope Partner">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {lab.city}, {lab.country} {lab.address && `• ${lab.address}`}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                  ISO 17025 Scope
                </span>
              </div>

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
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedLabForEnquiry(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedEnquiry ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Enquiry Transmitted</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Your testing quotation request for <strong>{selectedLabForEnquiry.name}</strong> has been registered. You will receive notification on sample delivery instructions shortly.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Official Quotation Request
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    Book Testing with {selectedLabForEnquiry.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Fill in your sample parameters to receive pricing, sample volume requirements, and submission instructions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Mukasa"
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@business.com"
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+256 700 000 000"
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Food Sample Matrix</label>
                      <select
                        value={formData.foodType}
                        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option>Maize Flour / Grain</option>
                        <option>Fresh Milk / Dairy</option>
                        <option>Beef / Poultry Meat</option>
                        <option>Potable Drinking Water</option>
                        <option>Horticulture / Leafy Greens</option>
                        <option>Fish / Nile Perch</option>
                        <option>Other Processed Product</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Suspected Hazard / Required Test
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.concern}
                      onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                      placeholder="e.g. Need total aflatoxins quantitative HPLC test for 200 bags of maize flour before distribution."
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Transmit Quotation Enquiry
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
