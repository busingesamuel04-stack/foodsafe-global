import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 text-sm border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                FoodSafe<span className="text-brand-500">Global</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering consumers with contamination guidance, connecting businesses with certified laboratory networks, and streamlining food compliance with smart digital hygiene checklists.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs text-brand-400 bg-brand-950/70 border border-brand-800/60 px-3 py-1.5 rounded-full">
                Zero-capital startup blueprint • Global & East African scope
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Public Intelligence</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Food Contaminant Library
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="hover:text-white transition-colors">
                  Official Safety Recalls
                </Link>
              </li>
              <li>
                <Link href="/report-concern" className="hover:text-white transition-colors">
                  Report Suspected Issue
                </Link>
              </li>
              <li>
                <Link href="/laboratories" className="hover:text-white transition-colors">
                  Accredited Lab Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* B2B Software */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Food Businesses</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/business" className="hover:text-white transition-colors">
                  Business Management Hub
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-white transition-colors">
                  Daily Hygiene Logs
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-white transition-colors">
                  Temperature Monitoring
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Subscription Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Testing Partners & Authorities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Testing & Standards</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a
                  href="https://www.unbs.go.ug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  UNBS Standards <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/foodsafety"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  WHO Food Safety <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.fao.org/fao-who-codexalimentarius"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Codex Alimentarius <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-gray-500 hover:text-gray-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Disclaimer and Legal */}
        <div className="mt-12 pt-8 border-t border-gray-800/80 text-xs text-gray-500 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/60 border border-gray-800">
            <p className="leading-relaxed">
              <strong>Mandatory Legal & Health Disclaimer:</strong> Information published on SafeFood Global is compiled from accredited standards (UNBS, CODEX, WHO, EFSA) for educational and preventive guidance. Invisible bacterial, chemical, or mycotoxin presence cannot be verified through visual assessment or software algorithms alone. Confirmed diagnostic testing must be conducted by accredited laboratories utilizing validated analytical standards.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} FoodSafe Global Platform. Developed with Antigravity.</p>
            <div className="flex items-center space-x-6">
              <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-gray-300 cursor-pointer">Laboratory Accreditation Policy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
