import { FoodAlert } from '@/types';

export const mockAlerts: FoodAlert[] = [
  {
    id: 'alert-001',
    title: 'Surveillance Advisory: Aflatoxin Maximum Limits in Commercial Maize Flour',
    productName: 'Commercial Maize Flour (Posho / Cornmeal)',
    batchOrLotNumber: 'Uncertified retail milling batches',
    contaminant: 'Aflatoxins exceeding 10 ppb threshold',
    status: 'verified_official',
    severity: 'high',
    issuingAuthorityOrSource: 'Uganda National Bureau of Standards (UNBS) Food Surveillance Advisory',
    sourceUrl: 'https://www.unbs.go.ug',
    publishedAt: '2025-09-28',
    affectedRegions: ['Kampala', 'Wakiso', 'Mukono', 'Eastern Region'],
    recommendedAction: 'Consumers should verify the UNBS Quality Mark on flour packaging. Retailers must quarantine unverified flour bags.',
    isReferenceOrHistorical: true
  },
  {
    id: 'alert-002',
    title: 'Public Health Enforcement Notice: Formaldehyde Preservatives in Meat Markets',
    productName: 'Raw Beef and Offals from Unregulated Abattoirs',
    batchOrLotNumber: 'Open-air display stalls',
    contaminant: 'Illicit Formaldehyde (Formalin preservative)',
    status: 'verified_official',
    severity: 'critical',
    issuingAuthorityOrSource: 'Municipal Public Health Directorate & Market Inspection Directorate',
    sourceUrl: 'https://health.go.ug',
    publishedAt: '2025-08-15',
    affectedRegions: ['Urban Municipal Markets'],
    recommendedAction: 'Inspectors are carrying out spot chemical verification tests. Consumers advised to report meat emitting acrid chemical fumes.',
    isReferenceOrHistorical: true
  },
  {
    id: 'alert-003',
    title: 'Laboratory Analytical Notice: Listeria Monocytogenes in Chilled Ready-to-Eat Meats',
    productName: 'Sliced Roast Ham and Smoked Turkey Breasts',
    batchOrLotNumber: 'Lot #LM-2025-884A (Exp: 2025-11-10)',
    contaminant: 'Listeria monocytogenes',
    status: 'lab_confirmed',
    severity: 'high',
    issuingAuthorityOrSource: 'Global Food Safety Network / Manufacturer QA Analytical Laboratory',
    sourceUrl: 'https://who.int/foodsafety',
    publishedAt: '2025-09-12',
    affectedRegions: ['International Export Callout / Select Supermarket Chains'],
    recommendedAction: 'Do not consume. Return unopened or opened packs to retail vendor for immediate disposal and full refund.',
    isReferenceOrHistorical: true
  },
  {
    id: 'alert-004',
    title: 'Community Field Report Under Review: Turbid Drinking Water Odor',
    productName: 'Community Borehole Well #4',
    batchOrLotNumber: 'Community Well Tap',
    contaminant: 'Suspected microbiological contamination following seasonal flooding',
    status: 'under_review',
    severity: 'medium',
    issuingAuthorityOrSource: 'Local Community Health Worker Intake Submission',
    publishedAt: '2025-10-02',
    affectedRegions: ['Bwaise Lowland Zone'],
    recommendedAction: 'Boil water thoroughly before drinking pending microbiological laboratory culture results.',
    isReferenceOrHistorical: false
  }
];
