-- SafeFood Global Migration 004: Fix Organizations & Org Members RLS Mutual Recursion
-- Breaks circular RLS dependency using SECURITY DEFINER helper functions.

-- 1. Helper Functions (SECURITY DEFINER bypasses RLS internally, preventing infinite loops)
CREATE OR REPLACE FUNCTION public.is_org_member(lookup_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.org_members
        WHERE organization_id = lookup_org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_org_owner(lookup_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = lookup_org_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Clean Organizations Policies
DROP POLICY IF EXISTS "Org members can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Org members or admins can view their organization" ON public.organizations;
CREATE POLICY "Org members or admins can view their organization"
    ON public.organizations FOR SELECT
    USING (
        owner_id = auth.uid() OR
        public.is_org_member(id) OR
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

-- 3. Clean Org Members Policies
DROP POLICY IF EXISTS "Org members can view members of their organization" ON public.org_members;
CREATE POLICY "Org members can view members of their organization"
    ON public.org_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        public.is_org_member(organization_id) OR
        public.is_org_owner(organization_id) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Org owners or admins can manage members" ON public.org_members;
CREATE POLICY "Org owners or admins can manage members"
    ON public.org_members FOR ALL
    USING (
        public.is_org_owner(organization_id) OR
        public.is_admin()
    )
    WITH CHECK (
        public.is_org_owner(organization_id) OR
        public.is_admin()
    );

-- 4. Clean Business Compliance Tools Policies
DROP POLICY IF EXISTS "Org members can view hygiene checklists" ON public.hygiene_checklists;
DROP POLICY IF EXISTS "Org members or admins can view hygiene checklists" ON public.hygiene_checklists;
DROP POLICY IF EXISTS "Org members or admins can manage hygiene checklists" ON public.hygiene_checklists;
CREATE POLICY "Org members or admins can manage hygiene checklists"
    ON public.hygiene_checklists FOR ALL
    USING (
        public.is_org_owner(organization_id) OR
        public.is_org_member(organization_id) OR
        public.is_admin()
    )
    WITH CHECK (
        public.is_org_owner(organization_id) OR
        public.is_org_member(organization_id) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Org members can view and manage temperature logs" ON public.temperature_logs;
DROP POLICY IF EXISTS "Org members or admins can manage temperature logs" ON public.temperature_logs;
CREATE POLICY "Org members or admins can manage temperature logs"
    ON public.temperature_logs FOR ALL
    USING (
        public.is_org_owner(organization_id) OR
        public.is_org_member(organization_id) OR
        public.is_admin()
    )
    WITH CHECK (
        public.is_org_owner(organization_id) OR
        public.is_org_member(organization_id) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Org members can view and manage batch records" ON public.batch_records;
DROP POLICY IF EXISTS "Org members or admins can manage batch records" ON public.batch_records;
CREATE POLICY "Org members or admins can manage batch records"
    ON public.batch_records FOR ALL
    USING (
        public.is_org_owner(organization_id) OR
        public.is_org_member(organization_id) OR
        public.is_admin()
    )
    WITH CHECK (
        public.is_org_owner(organization_id) OR
        public.is_org_member(organization_id) OR
        public.is_admin()
    );
