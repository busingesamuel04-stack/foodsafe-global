import { FoodAlert } from '@/types';

export const mockAlerts: FoodAlert[] = [
  {
    id: 'alert-001',
    title: 'Aflatoxin Alert: Surveillance on Uncertified Maize Flour Brands',
    productName: 'Commercial Maize Flour (Posho / Cornmeal)',
    batchOrLotNumber: 'Multiple uncertified retail milling batches',
    contaminant: 'Aflatoxins exceeding 10 ppb threshold',
    status: 'verified_official',
    severity: 'high',
    issuingAuthorityOrSource: 'Uganda National Bureau of Standards (UNBS) Food Surveillance',
    sourceUrl: 'https://www.unbs.go.ug',
    publishedAt: '2025-09-28',
    affectedRegions: ['Kampala', 'Wakiso', 'Mukono', 'Eastern Region'],
    recommendedAction: 'Consumers should verify the UNBS Quality Mark on flour packaging. Retailers must quarantine unverified flour bags.'
  },
  {
    id: 'alert-002',
    title: 'Public Health Notice: Formaldehyde Preservatives in Meat Stalls',
    productName: 'Raw Beef and Offals from Unlicensed Abattoirs',
    batchOrLotNumber: 'Open-air display stalls',
    contaminant: 'Illicit Formaldehyde (Formalin)',
    status: 'verified_official',
    severity: 'critical',
    issuingAuthorityOrSource: 'City Public Health Directorate & Market Inspection Unit',
    sourceUrl: 'https://health.go.ug',
    publishedAt: '2025-08-15',
    affectedRegions: ['Urban Municipal Markets'],
    recommendedAction: 'Inspectors are carrying out spot chemical verification tests. Vendors caught face immediate license revocation.'
  },
  {
    id: 'alert-003',
    title: 'Voluntary Recall Notice: Potential Listeria Monocytogenes in Ready-to-Eat Deli Meats',
    productName: 'Sliced Roast Ham and Smoked Turkey Breasts',
    batchOrLotNumber: 'Lot #LM-2025-884A (Exp: 2025-11-10)',
    contaminant: 'Listeria monocytogenes',
    status: 'lab_confirmed',
    severity: 'high',
    issuingAuthorityOrSource: 'Global Food Safety Network / Manufacturer QA Lab',
    sourceUrl: 'https://who.int/foodsafety',
    publishedAt: '2025-09-12',
    affectedRegions: ['International Export Callout / Select Supermarket Chains'],
    recommendedAction: 'Do not consume. Return unopened or opened packs to retail vendor for a full refund.'
  },
  {
    id: 'alert-004',
    title: 'Community Incident Under Review: Turbid Odorous Borehole Drinking Water',
    productName: 'Community Borehole Well #4',
    batchOrLotNumber: 'Community Well Tap',
    contaminant: 'Suspected bacterial contamination following heavy seasonal flooding',
    status: 'under_review',
    severity: 'medium',
    issuingAuthorityOrSource: 'Local Community Health Worker Submission',
    publishedAt: '2025-10-02',
    affectedRegions: ['Bwaise Lowland Zone'],
    recommendedAction: 'Boil water thoroughly before drinking pending laboratory microbiological water sample results.'
  }
];
