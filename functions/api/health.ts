// Cloudflare Pages Function: /api/health
// Demonstrates server-side request execution in Cloudflare Pages.
// Environment secrets (like SUPABASE_SERVICE_ROLE_KEY) are accessible via context.env
// and NEVER leak to the browser bundle.

interface Env {
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
}

export const onRequestGet = async (context: { env: Env }) => {
  const isServiceRoleConfigured = Boolean(context.env.SUPABASE_SERVICE_ROLE_KEY);
  
  return new Response(
    JSON.stringify({
      status: 'healthy',
      platform: 'Food Safety Platform',
      environment: 'Cloudflare Pages Functions',
      timestamp: new Date().toISOString(),
      serviceRoleAvailableOnServer: isServiceRoleConfigured,
      note: 'Server-side worker active. No secrets exposed to client.'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
};
