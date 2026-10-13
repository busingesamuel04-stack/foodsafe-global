export type ContaminantCategory = 'biological' | 'chemical' | 'physical' | 'allergen';

export interface ContaminantInfo {
  id: string;
  name: string;
  category: ContaminantCategory;
  description: string;
  commonSources: string[];
  healthRisks: string[];
  safeThresholds?: string;
  preventionTips: string[];
  recommendedTesting: string[];
}

export interface FoodProfile {
  id: string;
  name: string;
  category: 'dairy' | 'meat' | 'fish' | 'grains' | 'produce' | 'processed' | 'water';
  description: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  commonContaminants: ContaminantInfo[];
  safeHandlingTips: string[];
  properStorage: string;
  idealTemperatureRange?: string;
  regionalNotes?: string;
}

export type AlertVerificationStatus = 'under_review' | 'verified_official' | 'lab_confirmed' | 'resolved';

export interface FoodAlert {
  id: string;
  title: string;
  productName: string;
  batchOrLotNumber?: string;
  contaminant: string;
  status: AlertVerificationStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issuingAuthorityOrSource: string;
  sourceUrl?: string;
  publishedAt: string;
  affectedRegions: string[];
  recommendedAction: string;
  isReferenceOrHistorical?: boolean;
  region?: 'Global' | 'North America' | 'Europe' | 'Asia-Pacific' | 'Latin America' | 'Middle East & Africa';
}

export interface LaboratoryProfile {
  id: string;
  name: string;
  country: string;
  city: string;
  address?: string;
  isAccredited: boolean;
  accreditationScope: string[]; // e.g. ["ISO/IEC 17025", "FDA Registered", "Microbiology", "Heavy Metals"]
  supportedFoodTypes: string[];
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  enquiryRateResponseTime?: string;
  isVerifiedPartner: boolean;
  listingType?: 'standards_authority' | 'accredited_commercial' | 'verified_partner';
  credibilityDisclaimer?: string;
  region?: 'Global' | 'North America' | 'Europe' | 'Asia-Pacific' | 'Latin America' | 'Middle East & Africa';
}

export interface HygieneCheckItem {
  id: string;
  area: string;
  task: string;
  status: 'passed' | 'failed' | 'pending';
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
}

export interface TemperatureRecord {
  id: string;
  unitName: string; // e.g. "Walk-in Cooler 1", "Meat Freezer"
  targetMinTempC: number;
  targetMaxTempC: number;
  recordedTempC: number;
  isWithinSafeRange: boolean;
  recordedBy: string;
  timestamp: string;
  correctiveActionTaken?: string;
}

export interface BatchRecord {
  id: string;
  productName: string;
  batchNumber: string;
  receivedDate: string;
  expiryDate: string;
  supplierName: string;
  status: 'fresh' | 'approaching_expiry' | 'expired' | 'quarantined';
  storageLocation: string;
}

export type UserRole = 'consumer' | 'business_member' | 'lab_provider' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  industryType: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  createdAt?: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'manager' | 'staff' | 'auditor';
}
