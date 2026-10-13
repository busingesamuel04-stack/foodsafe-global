-- SafeFood Global Database Schema (Supabase / PostgreSQL)
-- Multi-Tenant & Free-Tier Optimized Architecture with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PUBLIC KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.food_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('dairy', 'meat', 'fish', 'grains', 'produce', 'processed', 'water')),
    description TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    proper_storage TEXT,
    ideal_temperature_range TEXT,
    regional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contaminants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_profile_id UUID REFERENCES public.food_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('biological', 'chemical', 'physical', 'allergen')),
    description TEXT,
    common_sources TEXT[],
    health_risks TEXT[],
    safe_thresholds TEXT,
    prevention_tips TEXT[],
    recommended_testing TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VERIFIED SAFETY ALERTS & PUBLIC NOTICES
CREATE TABLE IF NOT EXISTS public.food_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    product_name TEXT NOT NULL,
    batch_or_lot_number TEXT,
    contaminant TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('under_review', 'verified_official', 'lab_confirmed', 'resolved')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    issuing_authority_or_source TEXT NOT NULL,
    source_url TEXT,
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    affected_regions TEXT[],
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LABORATORY TESTING DIRECTORY & MARKETPLACE
CREATE TABLE IF NOT EXISTS public.laboratories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    is_accredited BOOLEAN DEFAULT FALSE,
    accreditation_scope TEXT[],
    supported_food_types TEXT[],
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    enquiry_rate_response_time TEXT DEFAULT '24-48 hours',
    is_verified_partner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    food_sample_type TEXT NOT NULL,
    suspected_concern TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'in_progress', 'completed', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. B2B FOOD BUSINESS MANAGEMENT (SaaS)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    industry_type TEXT NOT NULL, -- 'restaurant', 'supermarket', 'processor', 'caterer'
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'auditor')),
    UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.hygiene_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    check_date DATE DEFAULT CURRENT_DATE,
    area TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('passed', 'failed', 'pending')),
    checked_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.temperature_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    unit_name TEXT NOT NULL,
    recorded_temp_c NUMERIC(5,2) NOT NULL,
    target_min_temp_c NUMERIC(5,2) NOT NULL,
    target_max_temp_c NUMERIC(5,2) NOT NULL,
    is_within_safe_range BOOLEAN GENERATED ALWAYS AS (recorded_temp_c >= target_min_temp_c AND recorded_temp_c <= target_max_temp_c) STORED,
    recorded_by TEXT NOT NULL,
    corrective_action TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batch_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    received_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT DEFAULT 'fresh' CHECK (status IN ('fresh', 'approaching_expiry', 'expired', 'quarantined')),
    storage_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PUBLIC INCIDENT REPORTING (Community Submissions)
CREATE TABLE IF NOT EXISTS public.incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_name TEXT,
    contact_email TEXT,
    food_product TEXT NOT NULL,
    brand_or_vendor TEXT,
    purchase_location TEXT NOT NULL,
    incident_date DATE NOT NULL,
    concern_description TEXT NOT NULL,
    evidence_photo_url TEXT,
    moderation_status TEXT DEFAULT 'under_review' CHECK (moderation_status IN ('under_review', 'investigating', 'verified', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.food_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contaminants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hygiene_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- POLICIES: Public Read for Educational Content
CREATE POLICY "Public profiles are readable by everyone" ON public.food_profiles FOR SELECT USING (true);
CREATE POLICY "Public contaminants are readable by everyone" ON public.contaminants FOR SELECT USING (true);
CREATE POLICY "Public alerts are readable by everyone" ON public.food_alerts FOR SELECT USING (true);
CREATE POLICY "Laboratories are readable by everyone" ON public.laboratories FOR SELECT USING (true);

-- POLICIES: Enquiry Submission
CREATE POLICY "Anyone can submit a test enquiry" ON public.test_enquiries FOR INSERT WITH CHECK (true);

-- POLICIES: Incident Submission
CREATE POLICY "Anyone can report an incident concern" ON public.incident_reports FOR INSERT WITH CHECK (true);

-- POLICIES: B2B Multi-Tenant Isolation
CREATE POLICY "Org members can view their organization" ON public.organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
);
CREATE POLICY "Org members can view hygiene checklists" ON public.hygiene_checklists FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
);
CREATE POLICY "Org members can view and manage temperature logs" ON public.temperature_logs FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
);
CREATE POLICY "Org members can view and manage batch records" ON public.batch_records FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
);
