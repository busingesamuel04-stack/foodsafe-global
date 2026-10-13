import React from 'react';
import { AlertVerificationStatus } from '@/types';
import { CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react';

interface SafetyBadgeProps {
  status: AlertVerificationStatus;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ status }) => {
  switch (status) {
    case 'verified_official':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          Official Verified Alert
        </span>
      );
    case 'lab_confirmed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Laboratory Confirmed
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Community Report: Under Review
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Resolved & Cleared
        </span>
      );
    default:
      return null;
  }
};
