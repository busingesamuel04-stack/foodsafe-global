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

export interface ProductNutriments {
  caloriesPer100g?: number;
  sugarsPer100g?: number;
  fatPer100g?: number;
  saturatedFatPer100g?: number;
  saltPer100g?: number;
  sodiumPer100g?: number;
  proteinsPer100g?: number;
  fiberPer100g?: number;
}

export interface ProductAdditiveInfo {
  code: string;
  name: string;
  riskLevel: 'safe' | 'caution' | 'high_concern';
  description: string;
  purpose: string;
}

export interface HealthImpact {
  type: 'positive' | 'concern' | 'neutral';
  title: string;
  description: string;
  iconName?: string;
}

export interface ProductAlternative {
  name: string;
  category: string;
  whyBetter: string;
  sugarComparison?: string;
  priceEstimate?: string;
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  ingredientsText?: string;
  ingredientsList?: string[];
  nutriments: ProductNutriments;
  nutriscoreGrade?: 'a' | 'b' | 'c' | 'd' | 'e';
  novaGroup?: 1 | 2 | 3 | 4;
  servingSize?: string;
  additives: ProductAdditiveInfo[];
  allergens: string[];
  healthImpacts: HealthImpact[];
  sugarCubesCount: number;
  alternatives: ProductAlternative[];
  source: 'open_food_facts' | 'crowdsourced' | 'reference_database';
  matchedRecall?: FoodAlert;
}
