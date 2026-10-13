'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Upload, 
  MapPin, 
  Calendar, 
  Building,
  Info
} from 'lucide-react';

export default function ReportConcernPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    reporterName: '',
    contactEmail: '',
    productName: '',
    vendorOrBrand: '',
    location: '',
    purchaseDate: '',
    incidentDescription: '',
    hadIllness: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
          Community Surveillance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Report a Suspected Food Safety Concern
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Encountered spoiled food, chemical odors, foreign matter, or illness linked to a food purchase? Submit details confidentially for verification review.
        </p>
      </div>

      {/* Mandatory Legal & Safety Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs sm:text-sm text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">Strict Legal & Health Safeguard:</strong>
          <p className="text-amber-900 text-xs leading-relaxed">
            Food products are never publicly labeled as contaminated based solely on community submissions. All submissions are held in <strong>&quot;Under Review&quot;</strong> status and routed to health inspectors and certified laboratories to prevent unsubstantiated business harm or misinformation.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Report Received</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Your report regarding <strong>{formData.productName}</strong> has been logged into the review queue with incident ID <strong>#INC-{Math.floor(100000 + Math.random() * 900000)}</strong>. Our moderation team and affiliated health surveillance unit will assess the submission.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  reporterName: '',
                  contactEmail: '',
                  productName: '',
                  vendorOrBrand: '',
                  location: '',
                  purchaseDate: '',
                  incidentDescription: '',
                  hadIllness: false
                });
              }}
              className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Incident Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Food Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sachet Maize Flour, Fresh Milk, Roasted Pork"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Brand or Vendor Name (If known)
              </label>
              <input
                type="text"
                placeholder="e.g. Local Market Stall, Brand X"
                value={formData.vendorOrBrand}
                onChange={(e) => setFormData({ ...formData, vendorOrBrand: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Purchase / Encounter Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nakasero Market Stall 14, Kampala"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Purchase or Incident *
              </label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Describe the Concern in Detail *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe sensory anomalies (pungent odor, unnatural discoloration, metallic taste), foreign matter (glass, insect fragments), or circumstances."
              value={formData.incidentDescription}
              onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hadIllness}
                onChange={(e) => setFormData({ ...formData, hadIllness: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <span className="text-xs font-medium text-gray-800">
                Did consumption result in acute illness, vomiting, diarrhea, or hospitalization?
              </span>
            </label>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Optional Contact Details for Follow-up
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Can be left blank for anonymity"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email / Phone</label>
                <input
                  type="text"
                  placeholder="contact@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
            >
              Submit Report for Administrative & Lab Review
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
