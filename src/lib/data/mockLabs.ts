import { LaboratoryProfile } from '@/types';

export const mockLabs: LaboratoryProfile[] = [
  {
    id: 'lab-eurofins-global',
    name: 'Eurofins Scientific Food & Agro Testing',
    country: 'International (Europe, North America, Asia-Pacific)',
    city: 'Brussels / Des Moines / Singapore',
    address: 'Global network of 1,000+ accredited laboratories in 62 countries',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited Worldwide',
      'High-Resolution Mass Spectrometry (LC-MS/MS, GC-MS)',
      'Mycotoxins (Aflatoxins B/G, Ochratoxin A, Patulin)',
      'PFAS & Environmental Contaminants',
      'Pathogen PCR & Whole Genome Sequencing (WGS)'
    ],
    supportedFoodTypes: ['Grains & Cereals', 'Dairy & Infant Formula', 'Meat & Poultry', 'Seafood', 'Produce & Organic Goods'],
    contactEmail: 'foodtesting@eurofins.com',
    contactPhone: '+32 2 766 1620',
    websiteUrl: 'https://www.eurofins.com/food-and-feed-testing',
    enquiryRateResponseTime: 'Within 24 hours',
    isVerifiedPartner: false,
    listingType: 'accredited_commercial',
    credibilityDisclaimer: 'Global Testing Network Directory Listing. Sourced for international referral.',
    region: 'Global'
  },
  {
    id: 'lab-sgs-global',
    name: 'SGS Food Testing & Inspection Network',
    country: 'Worldwide (140+ Countries)',
    city: 'Geneva / New York / Shanghai / London',
    address: 'Global network across 2,650 offices and laboratories',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Worldwide Network',
      'HACCP & ISO 22000 Auditing & Certification',
      'Pesticide Multi-Residue Screening (>500 compounds)',
      'Heavy Metals (Lead, Cadmium, Arsenic, Mercury by ICP-MS)',
      'Allergen Screening & Nutritional Verification'
    ],
    supportedFoodTypes: ['All agricultural commodities', 'Packaged Consumer Goods', 'Beverages', 'Spices & Condiments', 'Oils & Fats'],
    contactEmail: 'food.safety@sgs.com',
    contactPhone: '+41 22 739 91 11',
    websiteUrl: 'https://www.sgs.com/en/service-groups/food-testing',
    enquiryRateResponseTime: 'Within 24 hours',
    isVerifiedPartner: false,
    listingType: 'accredited_commercial',
    credibilityDisclaimer: 'Global Testing & Certification Directory Listing. Sourced for international referral.',
    region: 'Global'
  },
  {
    id: 'lab-intertek-global',
    name: 'Intertek Food Safety & Analytical Services',
    country: 'Worldwide (100+ Countries)',
    city: 'London / Chicago / Frankfurt / Tokyo',
    address: 'International assurance, testing, inspection, and certification network',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited',
      'Microbiological Culture & Rapid Pathogen Screening',
      'Veterinary Drug & Antibiotic Residue Testing',
      'Shelf-Life Evaluation & Challenge Studies',
      'Food Contact Materials & Packaging Migration Testing'
    ],
    supportedFoodTypes: ['Meat & Seafood', 'Dairy Products', 'Bakery & Confectionery', 'Ready-to-Eat Prepared Meals'],
    contactEmail: 'food.services@intertek.com',
    contactPhone: '+44 20 7396 3400',
    websiteUrl: 'https://www.intertek.com/food',
    enquiryRateResponseTime: 'Same day to 24h',
    isVerifiedPartner: false,
    listingType: 'accredited_commercial',
    credibilityDisclaimer: 'International Testing Directory Listing. Sourced for global supplier referral.',
    region: 'Global'
  },
  {
    id: 'lab-merieux-global',
    name: 'Mérieux NutriSciences Food Safety Solutions',
    country: 'North America, Europe, Latin America, Asia',
    city: 'Chicago / Lyon / São Paulo / Shanghai',
    address: 'Dedicated food science & nutrition network operating in 27 countries',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited (A2LA, COFRAC, DAkkS)',
      'Salmonella, Listeria & STEC E. coli Digital Droplet PCR',
      'Environmental Monitoring Program (EMP) Diagnostics',
      'Nutritional Proximate & Authenticity Testing',
      'Sensory Analysis & Consumer Research'
    ],
    supportedFoodTypes: ['Dairy & Plant-Based Alternatives', 'Poultry & Beef', 'Produce & Fresh-Cut Salads', 'Pet Food'],
    contactEmail: 'info@merieuxnutrisciences.com',
    contactPhone: '+1 312 938 5151',
    websiteUrl: 'https://www.merieuxnutrisciences.com',
    enquiryRateResponseTime: 'Within 24 hours',
    isVerifiedPartner: false,
    listingType: 'accredited_commercial',
    credibilityDisclaimer: 'Specialist Food Safety & Nutrition Laboratory Listing.',
    region: 'North America'
  },
  {
    id: 'lab-bureau-veritas',
    name: 'Bureau Veritas Agri-Food Testing',
    country: 'Worldwide (140+ Countries)',
    city: 'Paris / Houston / Rotterdam / Singapore',
    address: 'Global testing, inspection, and certification network founded in 1828',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 Accredited Testing Network',
      'Export & Import Phytosanitary Compliance Testing',
      'GMO Detection & Genetic Identity Preservation',
      'Marine Biotoxins & Histamine in Pelagic Fish',
      'Grain Grading & Moisture/Mycotoxin Port Analysis'
    ],
    supportedFoodTypes: ['Export Grains & Oilseeds', 'Fish & Aquaculture', 'Coffee, Cocoa & Tea', 'Fruits & Vegetables'],
    contactEmail: 'agrifood@bureauveritas.com',
    contactPhone: '+33 1 55 24 70 00',
    websiteUrl: 'https://www.bureauveritas.com',
    enquiryRateResponseTime: '24-48 hours',
    isVerifiedPartner: false,
    listingType: 'accredited_commercial',
    credibilityDisclaimer: 'International Inspection & Port Assurance Directory Listing.',
    region: 'Europe'
  },
  {
    id: 'lab-tuv-sud',
    name: 'TÜV SÜD Food Safety & Chemical Analysis',
    country: 'Europe, Asia-Pacific, North America',
    city: 'Munich / Singapore / Boston',
    address: 'Over 1,000 global locations providing technical safety and testing',
    isAccredited: true,
    accreditationScope: [
      'ISO/IEC 17025 & DAkkS Accredited',
      'Chemical Food Contact Material Screening (BPA, Phthalates)',
      'Trace Mineral & Heavy Metal Quantitation',
      'Microbiological Spoilage Organism Enumeration',
      'Global Food Safety Initiative (GFSI) Benchmarking'
    ],
    supportedFoodTypes: ['Packaged Consumer Goods', 'Beverages & Drinking Water', 'Infant Nutrition', 'Dietary Supplements'],
    contactEmail: 'food.safety@tuvsud.com',
    contactPhone: '+49 89 5791 0',
    websiteUrl: 'https://www.tuvsud.com/en/industries/consumer-products-and-retail/food',
    enquiryRateResponseTime: 'Within 24 hours',
    isVerifiedPartner: false,
    listingType: 'accredited_commercial',
    credibilityDisclaimer: 'European Technical Safety & Compliance Directory Listing.',
    region: 'Europe'
  }
];
