import { LaboratoryProfile } from '@/types';

export const mockLabs: LaboratoryProfile[] = [
  {
    id: 'lab-unbs-micro',
    name: 'UNBS Microbiology Testing Laboratory',
    country: 'Uganda',
    city: 'Kampala',
    address: 'Plot 2-12 Bypass Link, Bweyogerere Industrial and Business Park, Kyaliwajjala, Kira',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited',
      'Salmonella Detection (ISO 6579)',
      'Total Coliforms & E. coli (ISO 4832)',
      'Listeria monocytogenes (ISO 11290)',
      'Yeasts & Molds Enumeration'
    ],
    supportedFoodTypes: ['Dairy products', 'Drinking water', 'Meat & Poultry', 'Grain products', 'Fish & Seafood'],
    contactEmail: 'testing.services@unbs.go.ug',
    contactPhone: '+256 417 333250',
    websiteUrl: 'https://www.unbs.go.ug/content.php?pg=content&src=microbiology-laboratory',
    enquiryRateResponseTime: '24-48 hours',
    isVerifiedPartner: true
  },
  {
    id: 'lab-unbs-chem',
    name: 'UNBS Chemistry Testing Laboratory',
    country: 'Uganda',
    city: 'Kampala',
    address: 'Bweyogerere Industrial Park, Kampala',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited',
      'Mycotoxins (Aflatoxin B1 & Total Aflatoxins by HPLC)',
      'Heavy Metals (Lead, Cadmium, Arsenic by AAS/ICP-OES)',
      'Pesticide Residue Analysis (GC-MS / LC-MS)',
      'Nutritional Proximate Analysis'
    ],
    supportedFoodTypes: ['Maize flour & cereals', 'Edible oils & fats', 'Fruits & Vegetables', 'Coffee & Tea', 'Processed Foods'],
    contactEmail: 'chemistry.lab@unbs.go.ug',
    contactPhone: '+256 417 333251',
    websiteUrl: 'https://www.unbs.go.ug/content.php?content=&src=chemistry-laboratory',
    enquiryRateResponseTime: '24-48 hours',
    isVerifiedPartner: true
  },
  {
    id: 'lab-chemiphar',
    name: 'Chemiphar Analytical Laboratories',
    country: 'Uganda',
    city: 'Kampala',
    address: 'Plot 104, Mirembe Close, Kasanga, Kampala',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited (BELAC)',
      'Export Quality Certification for Fish & Horticulture',
      'Antibiotic & Veterinary Drug Residues',
      'Comprehensive Water Quality Potability Analysis'
    ],
    supportedFoodTypes: ['Nile Perch & Fresh Fish', 'Horticulture & Fresh Produce', 'Honey & Animal Products', 'Industrial Water'],
    contactEmail: 'info@chemiphar.eu',
    contactPhone: '+256 414 268832',
    websiteUrl: 'https://www.chemiphar.com',
    enquiryRateResponseTime: 'Same day',
    isVerifiedPartner: true
  },
  {
    id: 'lab-sgs-global',
    name: 'SGS Food Testing & Inspection Services',
    country: 'Global / Regional',
    city: 'Regional Hubs (Nairobi / Kampala / International)',
    address: 'Global Network in 140+ Countries',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Worldwide Network',
      'HACCP / ISO 22000 Auditing',
      'Allergen Screening & PCR DNA Barcoding',
      'Nutritional Labeling & Shelf-Life Studies'
    ],
    supportedFoodTypes: ['All agricultural commodities', 'Packaged Consumer Goods', 'Beverages', 'Spices & Condiments'],
    contactEmail: 'food.safety@sgs.com',
    contactPhone: '+41 22 739 91 11',
    websiteUrl: 'https://www.sgs.com/en/service-groups/food-testing',
    enquiryRateResponseTime: 'Within 24 hours',
    isVerifiedPartner: true
  }
];
