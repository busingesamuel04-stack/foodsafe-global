'use client';

import React, { useState } from 'react';
import { mockFoods } from '@/lib/data/mockFoods';
import { FoodProfile, ContaminantCategory } from '@/types';
import { 
  Search, 
  ShieldAlert, 
  Thermometer, 
  CheckCircle, 
  FlaskConical, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Tag
} from 'lucide-react';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(mockFoods[0]?.id || null);

  const categories = [
    { id: 'all', label: 'All Foods' },
    { id: 'dairy', label: 'Milk & Dairy' },
    { id: 'grains', label: 'Grains & Flour' },
    { id: 'meat', label: 'Meat & Poultry' },
    { id: 'produce', label: 'Produce & Veg' },
    { id: 'water', label: 'Water' }
  ];

  const filteredFoods = mockFoods.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.commonContaminants.some(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getRiskBadge = (level: FoodProfile['riskLevel']) => {
    switch (level) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 uppercase">Critical Risk</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 uppercase">High Risk</span>;
      case 'moderate':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">Moderate</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">Low</span>;
    }
  };

  const getContaminantBadge = (cat: ContaminantCategory) => {
    switch (cat) {
      case 'biological':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Biological Hazard</span>;
      case 'chemical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Chemical / Toxin</span>;
      case 'physical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Physical Foreign Body</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">Allergen</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Knowledge Base & Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Food Contaminant Intelligence Directory
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Search common foods to understand biological pathogens, industrial chemicals, heavy metals, and physical debris. Learn safe domestic and commercial handling protocols backed by official standards.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by food name, pathogen (e.g. Aflatoxin, Salmonella), or chemical..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food Profiles Accordion / List */}
      <div className="space-y-4">
        {filteredFoods.map((food) => {
          const isExpanded = expandedFoodId === food.id;
          return (
            <div
              key={food.id}
              id={food.id}
              className={`bg-white rounded-2xl border transition-all ${
                isExpanded ? 'border-brand-500/50 shadow-md ring-1 ring-brand-500/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedFoodId(isExpanded ? null : food.id)}
                className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{food.name}</h3>
                    {getRiskBadge(food.riskLevel)}
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                      {food.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">{food.description}</p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-brand-600 hidden sm:inline">
                    {food.commonContaminants.length} Contaminants identified
                  </span>
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Accordion Expanded Details */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-6">
                  {/* Handling & Storage Guidance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase">
                        <Thermometer className="w-4 h-4 text-blue-600" />
                        Storage & Temperature Guidelines
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{food.properStorage}</p>
                      {food.idealTemperatureRange && (
                        <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-block">
                          Recommended Range: {food.idealTemperatureRange}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Safe Handling Steps
                      </div>
                      <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                        {food.safeHandlingTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Regional & Market Observations */}
                  {food.regionalNotes && (
                    <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                      <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Regional Market Context: </strong>
                        {food.regionalNotes}
                      </div>
                    </div>
                  )}

                  {/* Documented Contaminants */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Specific Contaminants & Recommended Lab Testing Methods
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {food.commonContaminants.map((contam) => (
                        <div key={contam.id} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-900 text-sm">{contam.name}</h5>
                              {getContaminantBadge(contam.category)}
                            </div>
                            {contam.safeThresholds && (
                              <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                Limit: {contam.safeThresholds}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed">{contam.description}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
                            <div>
                              <span className="font-semibold text-gray-900 block">Health Risks:</span>
                              <span className="text-red-700">{contam.healthRisks.join(' • ')}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 block flex items-center gap-1">
                                <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                                Validated Laboratory Tests:
                              </span>
                              <span className="text-indigo-800 font-medium">{contam.recommendedTesting.join(' • ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredFoods.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No Food Profiles Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We could not find any food profiles matching your search query. Try another keyword or reset the filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
