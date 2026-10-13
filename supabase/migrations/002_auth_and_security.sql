-- SafeFood Global Migration 002: Authentication, Authorization & Security Hardening
-- Version-controlled migration preserving existing tables while implementing strict RBAC and RLS policies.

-- 1. USER PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'business_member', 'lab_provider', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role TEXT;
BEGIN
    -- Extract requested role if provided in user metadata
    requested_role := NEW.raw_user_meta_data->>'role';

    -- PREVENT SELF-ELEVATION: Never allow a user to self-assign 'admin' role
    IF requested_role IS NULL OR requested_role NOT IN ('consumer', 'business_member', 'lab_provider') THEN
        requested_role := 'consumer';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        requested_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Protect role elevation on profile updates
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is being modified, verify the caller is an administrator
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Unauthorized: only platform administrators can modify user roles.';
        END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_check ON public.profiles;
CREATE TRIGGER on_profile_update_check
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view their own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- 2. LABORATORY OWNERSHIP & ACCESS
ALTER TABLE public.laboratories
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_laboratories_owner_id ON public.laboratories(owner_id);

-- Restrict laboratory management to verified owner or admin
DROP POLICY IF EXISTS "Laboratories are manageable by owner or admin" ON public.laboratories;
CREATE POLICY "Laboratories are manageable by owner or admin"
    ON public.laboratories FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_admin())
    WITH CHECK (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Laboratories insertable by authenticated providers or admin" ON public.laboratories;
CREATE POLICY "Laboratories insertable by authenticated providers or admin"
    ON public.laboratories FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR public.is_admin())
    );

-- 3. SECURE B2B ORGANISATION ONBOARDING & MEMBERSHIP
-- Automated trigger: When an organisation is created, register owner in org_members
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.org_members (organization_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- Organizations RLS Policies
DROP POLICY IF EXISTS "Org members can view their organization" ON public.organizations;
CREATE POLICY "Org members or admins can view their organization"
    ON public.organizations FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Authenticated users can create an organization" ON public.organizations;
CREATE POLICY "Authenticated users can create an organization"
    ON public.organizations FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND owner_id = auth.uid()
    );

DROP POLICY IF EXISTS "Org owners or admins can update organization" ON public.organizations;
CREATE POLICY "Org owners or admins can update organization"
    ON public.organizations FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_admin())
    WITH CHECK (owner_id = auth.uid() OR public.is_admin());

-- Org Members RLS Policies
DROP POLICY IF EXISTS "Org members can view members of their organization" ON public.org_members;
CREATE POLICY "Org members can view members of their organization"
    ON public.org_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Org owners or admins can manage members" ON public.org_members;
CREATE POLICY "Org owners or admins can manage members"
    ON public.org_members FOR ALL
    USING (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        public.is_admin()
    )
    WITH CHECK (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        public.is_admin()
    );

-- 4. PRIVATE SUBMISSION & ENQUIRY ACCESS CONTROLS
ALTER TABLE public.test_enquiries
    ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_test_enquiries_sender_id ON public.test_enquiries(sender_id);
CREATE INDEX IF NOT EXISTS idx_test_enquiries_lab_id ON public.test_enquiries(laboratory_id);

-- Replace unrestricted test enquiry insert with validation check
DROP POLICY IF EXISTS "Anyone can submit a test enquiry" ON public.test_enquiries;
CREATE POLICY "Anyone can submit a validated test enquiry"
    ON public.test_enquiries FOR INSERT
    WITH CHECK (
        char_length(sender_name) >= 2 AND
        char_length(sender_name) <= 120 AND
        char_length(sender_email) >= 5 AND
        char_length(sender_email) <= 254 AND
        char_length(food_sample_type) >= 2 AND
        char_length(food_sample_type) <= 120 AND
        char_length(suspected_concern) >= 5 AND
        char_length(suspected_concern) <= 3000
    );

-- Enquiries are ONLY viewable by the sender, the assigned laboratory owner, or platform admins
DROP POLICY IF EXISTS "Enquiries viewable by authorized parties only" ON public.test_enquiries;
CREATE POLICY "Enquiries viewable by authorized parties only"
    ON public.test_enquiries FOR SELECT
    USING (
        (sender_id IS NOT NULL AND sender_id = auth.uid()) OR
        laboratory_id IN (SELECT id FROM public.laboratories WHERE owner_id = auth.uid()) OR
        public.is_admin()
    );

-- 5. INCIDENT REPORTS SECURITY
ALTER TABLE public.incident_reports
    ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_incident_reports_reporter_id ON public.incident_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON public.incident_reports(moderation_status);

-- Replace unrestricted incident report insert with validation
DROP POLICY IF EXISTS "Anyone can report an incident concern" ON public.incident_reports;
CREATE POLICY "Anyone can submit a validated incident concern"
    ON public.incident_reports FOR INSERT
    WITH CHECK (
        char_length(food_product) >= 2 AND
        char_length(food_product) <= 200 AND
        char_length(purchase_location) >= 2 AND
        char_length(purchase_location) <= 300 AND
        char_length(concern_description) >= 10 AND
        char_length(concern_description) <= 4000
    );

-- Incident reports are ONLY viewable by the reporter or platform administrators (moderation)
DROP POLICY IF EXISTS "Incident reports viewable by reporter or admin only" ON public.incident_reports;
CREATE POLICY "Incident reports viewable by reporter or admin only"
    ON public.incident_reports FOR SELECT
    USING (
        (reporter_id IS NOT NULL AND reporter_id = auth.uid()) OR
        public.is_admin()
    );

-- Only admins can moderate, update or delete incident reports
DROP POLICY IF EXISTS "Only admins can moderate incident reports" ON public.incident_reports;
CREATE POLICY "Only admins can moderate incident reports"
    ON public.incident_reports FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. MISSING FOREIGN KEY INDEXES
CREATE INDEX IF NOT EXISTS idx_contaminants_food_id ON public.contaminants(food_profile_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hygiene_checklists_org_id ON public.hygiene_checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_hygiene_checklists_date ON public.hygiene_checklists(check_date);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_org_id ON public.temperature_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_batch_records_org_id ON public.batch_records(organization_id);
