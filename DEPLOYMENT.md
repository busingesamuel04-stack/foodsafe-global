# Deployment & Architectural Compatibility Guide

> **Platform**: Food Safety Platform  
> **Target Production Environment**: Cloudflare Pages (Free Tier) + Cloudflare Pages Functions + Supabase Free Tier  
> **Commercial Constraint**: $0 Starting Budget, Zero Vercel Hobby Commercial Violation

---

## 1. Cloudflare Pages Free-Tier Compatibility Analysis

### Architecture Overview
The platform uses **Next.js 15 (App Router) + TypeScript + Tailwind CSS** built with static export optimization, paired with **Supabase PostgreSQL & Auth**.

```
┌────────────────────────────────────────────────────────┐
│             CLOUDFLARE PAGES (Free Tier)               │
│                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │  Static Edge CDN      │  │  Pages Functions      │  │
│  │  (HTML/CSS/JS Assets) │  │  (/functions/api/*)   │  │
│  │  • Unlimited requests │  │  • 100,000 req/day    │  │
│  │  • Global caching     │  │  • Server secrets     │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               │                          │
       Public Anon Key            Service Role Key
       (Browser Client)           (Server-Side Only)
               │                          │
               ▼                          ▼
┌────────────────────────────────────────────────────────┐
│                   SUPABASE (PostgreSQL)                │
│                                                        │
│  • Row Level Security (RLS) policies enforce tenant    │
│    isolation on all browser queries.                   │
│  • Service role key is NEVER sent to the client.       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Identified Deployment Compatibility Risks & Mitigations

| Risk | Description | Impact | Production Mitigation |
| :--- | :--- | :--- | :--- |
| **Risk 1: Node.js Runtime vs. Cloudflare Workers Isolates** | Next.js dynamic SSR (`cookies()`, `headers()`) uses Node.js APIs unsupported in standard Cloudflare Workers isolates without complex adapters. | Edge build failure or runtime exceptions. | **Mitigated**: All public and dashboard pages prerender statically (`○ (Static)`). Dynamic authenticated queries execute directly against Supabase via `@supabase/supabase-js` using standard browser Fetch APIs. |
| **Risk 2: Service-Role Secret Leakage** | Accidentally exposing `SUPABASE_SERVICE_ROLE_KEY` in frontend bundles. | Total database takeover, bypassing RLS. | **Mitigated**: Only `NEXT_PUBLIC_` prefixed variables are exposed to client bundles. Service-role operations are restricted to Cloudflare Pages Functions (`/functions/`) or Workers. |
| **Risk 3: Single Page Application (SPA) Routing on CDN** | Deep links (e.g. `/business`, `/alerts`) returning 404 when directly refreshed on static hosting. | Broken page refreshes on subroutes. | **Mitigated**: Cloudflare Pages automatically serves `200.html` / `index.html` for client-side routing when configured as Next.js export or SPA. |
| **Risk 4: Supabase Free Tier Inactivity Pause** | Supabase free projects pause after 7 days without database API requests. | Service downtime for users until manually resumed. | **Mitigated**: Set up a free Cloudflare Worker cron trigger (or UptimeRobot ping) to query a lightweight public health check endpoint once every 48 hours. |
| **Risk 5: Vercel Hobby Terms Violation** | Deploying a commercial B2B SaaS on Vercel Hobby violates Vercel Terms of Service (section 1.3). | Sudden project suspension or forced paid upgrade. | **Mitigated**: Explicitly avoided Vercel Hobby; targeting Cloudflare Pages whose free tier permits commercial use. |

---

## 3. Step-by-Step Cloudflare Pages Deployment

### Prerequisites
1. Free Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com)).
2. Free Supabase account ([supabase.com](https://supabase.com)).
3. Git repository connected to GitHub or GitLab.

### Step 1: Push Code to Git
```bash
git add .
git commit -m "feat: production foundation"
git push origin main
```

### Step 2: Configure Cloudflare Pages
1. Go to **Cloudflare Dashboard > Workers & Pages > Create application > Pages > Connect to Git**.
2. Select your repository.
3. Set the build configuration:
   - **Framework preset**: `Next.js (Static HTML Export)` or `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next` (or `out` if `output: 'export'` is specified)
4. Add Environment Variables under **Settings > Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-anon-public-key`
   - `NEXT_PUBLIC_APP_NAME`: `Food Safety Platform`
5. Click **Save and Deploy**.

---

## 4. Supabase Database Migration Setup

1. Open your Supabase Dashboard > **SQL Editor**.
2. Click **New Query**.
3. Copy and run the entire SQL migration file:
   `supabase/migrations/001_initial_schema.sql`
4. Confirm tables are created with **RLS enabled**:
   - `food_profiles`
   - `contaminants`
   - `food_alerts`
   - `laboratories`
   - `test_enquiries`
   - `organizations`
   - `org_members`
   - `hygiene_checklists`
   - `temperature_logs`
   - `batch_records`
   - `incident_reports`

---

## 5. Security Checklist

- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is restricted to RLS policies.
- [x] No service-role key or database password exists in any file under `src/`.
- [x] `.env.local` is ignored by `.gitignore`.
- [x] All customer-reported contamination incidents require admin verification before publication.
- [x] Scientific disclaimer is permanently rendered on all views.
