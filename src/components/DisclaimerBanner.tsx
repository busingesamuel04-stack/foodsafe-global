import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs sm:text-sm text-amber-900">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
        <p className="flex-1">
          <strong className="font-semibold text-amber-950">Scientific Food Safety Notice:</strong> This platform provides risk guidance, educational intelligence, and laboratory directories. Visual inspection or AI cannot scientifically detect invisible bacteria or toxins. Suspected incidents require certified laboratory verification.
        </p>
      </div>
    </div>
  );
};
