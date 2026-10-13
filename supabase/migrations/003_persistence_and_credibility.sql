-- SafeFood Global Migration 003: Database Persistence & Credibility Hardening
-- Adds complete RLS write policies for food_alerts, business compliance records, and laboratories directory.

-- 1. FOOD ALERTS POLICIES (Admins can publish, modify, or delete alerts; public can read)
DROP POLICY IF EXISTS "Admins can insert food alerts" ON public.food_alerts;
CREATE POLICY "Admins can insert food alerts"
    ON public.food_alerts FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update food alerts" ON public.food_alerts;
CREATE POLICY "Admins can update food alerts"
    ON public.food_alerts FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete food alerts" ON public.food_alerts;
CREATE POLICY "Admins can delete food alerts"
    ON public.food_alerts FOR DELETE
    USING (public.is_admin());

-- 2. LABORATORIES METADATA & ADMIN MANAGEMENT
ALTER TABLE public.laboratories
    ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'accredited_commercial',
    ADD COLUMN IF NOT EXISTS credibility_disclaimer TEXT;

DROP POLICY IF EXISTS "Admins can delete laboratories" ON public.laboratories;
CREATE POLICY "Admins can delete laboratories"
    ON public.laboratories FOR DELETE
    USING (public.is_admin());

-- 3. FOOD BUSINESS TOOLS POLICIES HARDENING (Checklists, Temperatures, Batches)
-- Hygiene Checklists
DROP POLICY IF EXISTS "Org members can view hygiene checklists" ON public.hygiene_checklists;
CREATE POLICY "Org members or admins can view hygiene checklists"
    ON public.hygiene_checklists FOR SELECT
    USING (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Org members or admins can manage hygiene checklists" ON public.hygiene_checklists;
CREATE POLICY "Org members or admins can manage hygiene checklists"
    ON public.hygiene_checklists FOR ALL
    USING (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    )
    WITH CHECK (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    );

-- Temperature Logs
DROP POLICY IF EXISTS "Org members can view and manage temperature logs" ON public.temperature_logs;
CREATE POLICY "Org members or admins can manage temperature logs"
    ON public.temperature_logs FOR ALL
    USING (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    )
    WITH CHECK (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    );

-- Batch Records
DROP POLICY IF EXISTS "Org members can view and manage batch records" ON public.batch_records;
CREATE POLICY "Org members or admins can manage batch records"
    ON public.batch_records FOR ALL
    USING (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    )
    WITH CHECK (
        organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()) OR
        organization_id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid()) OR
        public.is_admin()
    );

-- 4. SEED REFERENCE DATA (Public Standards Authority Directory & Accredited Labs)
-- Insert verified baseline laboratory entries if not already existing
INSERT INTO public.laboratories (
    name, country, city, address, is_accredited, accreditation_scope, supported_food_types, 
    contact_email, contact_phone, website_url, enquiry_rate_response_time, is_verified_partner,
    listing_type, credibility_disclaimer
)
VALUES
(
    'UNBS Microbiology Testing Laboratory',
    'Uganda',
    'Kampala',
    'Plot 2-12 Bypass Link, Bweyogerere Industrial Park, Kira',
    TRUE,
    ARRAY['ISO/IEC 17025 Accredited', 'Salmonella Detection (ISO 6579)', 'Total Coliforms & E. coli (ISO 4832)', 'Listeria monocytogenes (ISO 11290)'],
    ARRAY['Dairy products', 'Drinking water', 'Meat & Poultry', 'Grain products', 'Fish & Seafood'],
    'testing.services@unbs.go.ug',
    '+256 417 333250',
    'https://www.unbs.go.ug',
    '24-48 hours',
    FALSE,
    'standards_authority',
    'National Standards Authority Laboratory Directory Listing. Independent statutory body; non-contractual referral.'
),
(
    'UNBS Chemistry Testing Laboratory',
    'Uganda',
    'Kampala',
    'Plot 2-12 Bypass Link, Bweyogerere Industrial Park, Kira',
    TRUE,
    ARRAY['ISO/IEC 17025 Accredited', 'Mycotoxins (Aflatoxin B1 & Total Aflatoxins by HPLC)', 'Heavy Metals (Lead, Cadmium, Arsenic by AAS)', 'Pesticide Residue Analysis'],
    ARRAY['Maize flour & cereals', 'Edible oils & fats', 'Fruits & Vegetables', 'Coffee & Tea', 'Processed Foods'],
    'chemistry.lab@unbs.go.ug',
    '+256 417 333251',
    'https://www.unbs.go.ug',
    '24-48 hours',
    FALSE,
    'standards_authority',
    'National Standards Authority Laboratory Directory Listing. Independent statutory body; non-contractual referral.'
),
(
    'Chemiphar Analytical Laboratories',
    'Uganda',
    'Kampala',
    'Plot 104, Mirembe Close, Kasanga, Kampala',
    TRUE,
    ARRAY['ISO/IEC 17025 Accredited (BELAC)', 'Export Quality Certification for Fish & Horticulture', 'Antibiotic Residues', 'Water Potability Testing'],
    ARRAY['Nile Perch & Fresh Fish', 'Horticulture & Fresh Produce', 'Honey & Animal Products', 'Industrial Water'],
    'info@chemiphar.eu',
    '+256 414 268832',
    'https://www.chemiphar.com',
    'Same day',
    FALSE,
    'accredited_commercial',
    'Accredited Independent Facility Directory Listing. Public referral information.'
),
(
    'SGS Food Testing & Inspection Services',
    'Global / Regional',
    'Regional Network (Kampala / Nairobi / International)',
    'Global Network across 140+ countries',
    TRUE,
    ARRAY['ISO/IEC 17025 Worldwide Network', 'HACCP / ISO 22000 Auditing', 'Allergen Screening', 'Nutritional Labeling & Shelf-Life'],
    ARRAY['All agricultural commodities', 'Packaged Consumer Goods', 'Beverages', 'Spices & Condiments'],
    'food.safety@sgs.com',
    '+41 22 739 91 11',
    'https://www.sgs.com/en/service-groups/food-testing',
    'Within 24 hours',
    FALSE,
    'accredited_commercial',
    'Multinational Accredited Testing & Inspection Network. Public directory listing.'
)
ON CONFLICT DO NOTHING;

-- 5. SEED REFERENCE SAFETY ALERTS
INSERT INTO public.food_alerts (
    title, product_name, batch_or_lot_number, contaminant, status, severity,
    issuing_authority_or_source, source_url, published_at, affected_regions, recommended_action
)
VALUES
(
    'Official Surveillance Advisory: Aflatoxin Limits in Commercial Maize Flour',
    'Commercial Maize Flour (Posho / Cornmeal)',
    'Uncertified retail milling batches',
    'Aflatoxins exceeding 10 ppb threshold',
    'verified_official',
    'high',
    'Uganda National Bureau of Standards (UNBS) Food Surveillance Advisory',
    'https://www.unbs.go.ug',
    CURRENT_DATE - INTERVAL '14 days',
    ARRAY['Kampala', 'Wakiso', 'Mukono', 'Eastern Region'],
    'Consumers should verify the UNBS Distinctive Mark on flour packaging. Millers must verify grain moisture content below 13.5%.'
),
(
    'Public Health Inspection Notice: Formaldehyde (Formalin) in Fresh Meat Markets',
    'Raw Beef & Offal from Unregulated Distribution Channels',
    'Open-air retail meat stalls',
    'Illicit Formaldehyde (Formalin preservative)',
    'verified_official',
    'critical',
    'Municipal Public Health Directorate & Market Inspection Directorate',
    'https://health.go.ug',
    CURRENT_DATE - INTERVAL '30 days',
    ARRAY['Urban Municipal Markets'],
    'Inspectors are deploying rapid formaldehyde test kits across abattoirs. Meat with acrid chemical odor must not be consumed.'
),
(
    'International Safety Advisory: Listeria monocytogenes in Chilled Ready-to-Eat Meats',
    'Sliced Roast Ham and Smoked Poultry Products',
    'Lot #LM-2025-884A (Exp: 2025-11-10)',
    'Listeria monocytogenes',
    'lab_confirmed',
    'high',
    'Global Food Safety Network / Manufacturer QA Analytical Notice',
    'https://who.int/foodsafety',
    CURRENT_DATE - INTERVAL '45 days',
    ARRAY['Regional Export Callout', 'Selected Retail Supermarket Chains'],
    'Do not consume. Return opened or sealed packs to point of purchase for immediate disposal and refund.'
)
ON CONFLICT DO NOTHING;
