import { FoodProfile } from '@/types';

export const mockFoods: FoodProfile[] = [
  {
    id: 'food-milk',
    name: 'Fresh Cow Milk & Dairy Products',
    category: 'dairy',
    description: 'Raw and pasteurized dairy products consumed widely. Highly vulnerable to microbial proliferation and adulteration.',
    riskLevel: 'high',
    properStorage: 'Refrigerate at or below 4°C (39°F) immediately. Do not leave raw milk at ambient temperatures.',
    idealTemperatureRange: '1°C to 4°C',
    regionalNotes: 'In East Africa and developing markets, informal raw milk sales often lack cold chain maintenance, increasing bacterial load.',
    safeHandlingTips: [
      'Always boil raw milk vigorously before consumption or consume certified pasteurized milk.',
      'Check packaging integrity for bulging or leakage.',
      'Discard immediately if sour smell, curdling, or unusual coloration develops.'
    ],
    commonContaminants: [
      {
        id: 'contam-bact-brucella',
        name: 'Brucella abortus & Brucella melitensis',
        category: 'biological',
        description: 'Zoonotic bacterium transmitted via unpasteurized dairy causing Brucellosis (undulant fever).',
        commonSources: ['Infected cattle and goats udder milk', 'Unpasteurized cheese'],
        healthRisks: ['Chronic joint pain', 'Recurring high fevers', 'Fatigue', 'Organ inflammation'],
        preventionTips: ['Ensure proper pasteurization (72°C for 15 seconds) or thorough boiling.'],
        recommendedTesting: ['Rose Bengal plate test', 'Milk ring test (MRT)', 'PCR detection']
      },
      {
        id: 'contam-chem-aflatoxin-m1',
        name: 'Aflatoxin M1',
        category: 'chemical',
        description: 'Toxic fungal metabolite excreted in milk when cows consume moldy feed contaminated with Aflatoxin B1.',
        commonSources: ['Dairy cattle feed with moldy maize or cottonseed cake'],
        healthRisks: ['Carcinogenic (liver damage)', 'Growth stunting in infants and children'],
        safeThresholds: 'CODEX Standard: max 0.5 µg/kg (0.05 µg/kg in EU for infant formula)',
        preventionTips: ['Feed dairy cows only dry, certified aflatoxin-free grain feed.'],
        recommendedTesting: ['ELISA screening', 'HPLC-FLD', 'LC-MS/MS analytical assay']
      },
      {
        id: 'contam-chem-antibiotics',
        name: 'Veterinary Antibiotic Residues',
        category: 'chemical',
        description: 'Residues of oxytetracycline, penicillin, or sulfonamides when withholding periods are violated post-treatment.',
        commonSources: ['Treated mastitis cows milked before clearance window'],
        healthRisks: ['Antimicrobial resistance (AMR)', 'Severe allergic reactions in sensitive individuals'],
        preventionTips: ['Strict enforcement of farm withdrawal periods following veterinary medication.'],
        recommendedTesting: ['Rapid lateral flow strip test', 'Microbial receptor assay']
      }
    ]
  },
  {
    id: 'food-maize-flour',
    name: 'Maize Flour & Cornmeal',
    category: 'grains',
    description: 'Staple grain consumed daily as posho/ugali across Africa and global grain derivatives. Vulnerable to post-harvest toxigenic fungal mold.',
    riskLevel: 'critical',
    properStorage: 'Store in airtight containers raised off concrete floors in cool, well-ventilated rooms with low humidity (<13% moisture).',
    idealTemperatureRange: '15°C to 22°C (Dry environment)',
    regionalNotes: 'High prevalence of Aspergillus flavus fungal infestation during humid harvest seasons in Uganda, Kenya, and Sub-Saharan Africa.',
    safeHandlingTips: [
      'Inspect bags for dampness, discoloration, or musty damp odors.',
      'Ensure grain was dried to below 13.5% moisture content prior to milling.',
      'Purchase verified certified brands adhering to national standards (e.g. UNBS Quality Mark).'
    ],
    commonContaminants: [
      {
        id: 'contam-chem-aflatoxins-total',
        name: 'Total Aflatoxins (B1, B2, G1, G2)',
        category: 'chemical',
        description: 'Mycotoxins produced by Aspergillus fungi. Heat-stable and not destroyed by boiling or cooking posho/ugali.',
        commonSources: ['Poorly dried maize grains', 'Humid grain storage', 'Insect-damaged cobs'],
        healthRisks: ['Hepatocellular carcinoma (liver cancer)', 'Immunosuppression', 'Severe acute aflatoxicosis'],
        safeThresholds: 'EAC/UNBS standard: max 10 ppb (µg/kg) total aflatoxins, max 5 ppb B1',
        preventionTips: ['Use hermetic storage bags (PICS bags)', 'Solar drying before bagging', 'Aflasafe biocontrol'],
        recommendedTesting: ['Fluorometric assay', 'Quantitative ELISA', 'HPLC']
      },
      {
        id: 'contam-phys-weevils-stones',
        name: 'Inorganic Matter & Foreign Particles',
        category: 'physical',
        description: 'Grit, small stones, metal shavings from millers, and insect frass due to inadequate cleaning screens.',
        commonSources: ['Sun-drying on bare soil', 'Worn mill hammer blades'],
        healthRisks: ['Dental damage', 'Choking hazard', 'Gastrointestinal irritation'],
        preventionTips: ['Use magnetic separators on milling equipment and destoner tables.'],
        recommendedTesting: ['Visual physical purity inspection according to ISO 658']
      }
    ]
  },
  {
    id: 'food-fresh-meat',
    name: 'Fresh Beef, Pork & Poultry',
    category: 'meat',
    description: 'High-protein perishable food. Prime vector for bacterial pathogens, improper slaughterhouse hygiene, and chemical preservatives.',
    riskLevel: 'high',
    properStorage: 'Keep chilled below 4°C for short term (1-2 days) or deep frozen at -18°C. Prevent raw drip onto ready-to-eat foods.',
    idealTemperatureRange: '-18°C (Frozen) or 0°C to 3°C (Chilled)',
    regionalNotes: 'Informal butcheries often lack refrigeration, hanging meat in ambient air exposed to dust and flies.',
    safeHandlingTips: [
      'Cook poultry to internal temperature of 74°C (165°F) and beef to 63°C (145°F).',
      'Use separate cutting boards for raw meats and fresh vegetables.',
      'Wash hands thoroughly with soap after handling raw meat.'
    ],
    commonContaminants: [
      {
        id: 'contam-bact-salmonella',
        name: 'Salmonella enterica',
        category: 'biological',
        description: 'Pathogenic bacterium living in animal intestinal tracts; cross-contaminates during evisceration.',
        commonSources: ['Poultry carcasses', 'Ground beef', 'Contaminated processing surfaces'],
        healthRisks: ['Salmonellosis: severe cramps, diarrhea, fever, dehydration'],
        preventionTips: ['Thorough cooking, hygienic slaughter protocols, cold chain maintenance.'],
        recommendedTesting: ['Microbiological culture (ISO 6579)', 'Real-time PCR']
      },
      {
        id: 'contam-chem-formalin',
        name: 'Formaldehyde / Formalin Preservatives (Illicit)',
        category: 'chemical',
        description: 'Industrial chemical illegally applied by unscrupulous vendors to prevent flies and delay decomposition.',
        commonSources: ['Unregulated open-air butcher stalls and fish stalls'],
        healthRisks: ['Toxic corrosive agent', 'Known human carcinogen', 'Kidney & stomach ulceration'],
        safeThresholds: 'Zero tolerance (Illegal additive in food)',
        preventionTips: ['Buy only from inspected, licensed butchers with active refrigeration.'],
        recommendedTesting: ['Chromotropic acid test', 'Spectrophotometry']
      }
    ]
  },
  {
    id: 'food-leafy-produce',
    name: 'Leafy Vegetables (Spinach, Cabbage, Nakati)',
    category: 'produce',
    description: 'Fresh vegetables often eaten raw or lightly cooked. At risk from contaminated irrigation water and pesticide over-spraying.',
    riskLevel: 'moderate',
    properStorage: 'Wash in clean potable water, dry gently, and store refrigerated in breathable containers at 3°C to 7°C.',
    idealTemperatureRange: '3°C to 7°C',
    regionalNotes: 'Urban farming near industrial discharge channels or wastewater canals introduces heavy metals and parasitic ova.',
    safeHandlingTips: [
      'Wash thoroughly under running clean drinking water; soak in light saline or food-grade vinegar solution.',
      'Peel outer leaves before preparation.',
      'Ensure irrigation source is documented and free from untreated municipal runoff.'
    ],
    commonContaminants: [
      {
        id: 'contam-chem-pesticides',
        name: 'Organophosphate & Carbamate Pesticide Residues',
        category: 'chemical',
        description: 'Synthetic pest control chemicals applied without respecting pre-harvest intervals (PHI).',
        commonSources: ['Excessive spray schedules before harvest'],
        healthRisks: ['Neurotoxicity', 'Endocrine disruption', 'Chronic organ stress'],
        safeThresholds: 'Maximum Residue Limits (MRL) defined by Codex Alimentarius',
        preventionTips: ['Strict farmer training on pre-harvest intervals and integrated pest management.'],
        recommendedTesting: ['Multi-residue GC-MS / LC-MS/MS testing']
      },
      {
        id: 'contam-chem-heavy-metals',
        name: 'Heavy Metals (Lead, Cadmium, Arsenic)',
        category: 'chemical',
        description: 'Toxic inorganic elements bioaccumulated through contaminated soil and contaminated wastewater irrigation.',
        commonSources: ['Industrial runoff', 'Untreated city wastewater irrigation'],
        healthRisks: ['Kidney damage', 'Neurological impairment', 'Cardiovascular diseases'],
        safeThresholds: 'Lead: max 0.1-0.3 mg/kg, Cadmium: max 0.05-0.2 mg/kg',
        preventionTips: ['Soil testing prior to cultivation; avoid planting adjacent to industrial discharge.'],
        recommendedTesting: ['Atomic Absorption Spectroscopy (AAS)', 'ICP-MS']
      }
    ]
  },
  {
    id: 'food-drinking-water',
    name: 'Drinking Water & Packaged Water',
    category: 'water',
    description: 'Essential municipal, borehole, and sachet/bottled water. Vector for waterborne epidemics.',
    riskLevel: 'high',
    properStorage: 'Store in covered food-grade containers away from direct sunlight; clean storage tanks every 6 months.',
    idealTemperatureRange: 'Ambient or chilled',
    safeHandlingTips: [
      'Boil municipal or well water for at least 3 minutes rolling boil if potability is unverified.',
      'Inspect sachet/bottled water for tamper-evident seals and UNBS/national certification seals.'
    ],
    commonContaminants: [
      {
        id: 'contam-bact-ecoli-coliforms',
        name: 'Escherichia coli & Faecal Coliforms',
        category: 'biological',
        description: 'Indicators of direct faecal contamination from sewage or animal waste infiltration.',
        commonSources: ['Pit latrine seepage into shallow wells', 'Broken municipal pipes'],
        healthRisks: ['Waterborne diarrhea, Cholera, Dysentery, Typhoid'],
        safeThresholds: 'Zero (0 CFU / 100 mL for potable water)',
        preventionTips: ['Chlorination, UV disinfection, or ceramic filtration.'],
        recommendedTesting: ['Membrane filtration coliform count', 'Most Probable Number (MPN)']
      }
    ]
  }
];
