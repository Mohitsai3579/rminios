/**
 * Plan definitions and usage checking for RMinios
 */

export const PLANS = {
  free: {
    name: 'Free', slug: 'free', price: { monthly: 0, yearly: 0 },
    limits: { workspaces: 5, files_per_workspace: 20, ai_requests_daily: 50, storage_mb: 100 },
    features: ['5 workspaces', '20 files per workspace', '50 AI requests/day', '100MB storage', 'Basic brainstorming', 'Paper editor', 'RAG chat'],
    cta: 'Get Started Free', popular: false,
  },
  pro: {
    name: 'Pro', slug: 'pro', price: { monthly: 9.99, yearly: 99.99 },
    limits: { workspaces: -1, files_per_workspace: 100, ai_requests_daily: 500, storage_mb: 5120 },
    features: ['Unlimited workspaces', '100 files per workspace', '500 AI requests/day', '5GB storage', 'Advanced brainstorming', 'Research integrity', 'Project builder', 'Knowledge graph', 'Priority support'],
    cta: 'Upgrade to Pro', popular: true,
  },
  researcher: {
    name: 'Researcher', slug: 'researcher', price: { monthly: 19.99, yearly: 199.99 },
    limits: { workspaces: -1, files_per_workspace: -1, ai_requests_daily: -1, storage_mb: 25600 },
    features: ['Everything in Pro', 'Unlimited AI requests', '25GB storage', 'Experiment management', 'Publication assistant', 'Collaboration tools', 'Patent analysis', 'Version control'],
    cta: 'Go Researcher', popular: false,
  },
  university: {
    name: 'University', slug: 'university', price: { monthly: 49.99, yearly: 499.99 },
    limits: { workspaces: -1, files_per_workspace: -1, ai_requests_daily: -1, storage_mb: 102400 },
    features: ['Everything in Researcher', '100GB storage', 'Team management', 'Admin dashboard', 'Student management', 'Custom branding', 'API access'],
    cta: 'Contact Sales', popular: false,
  },
  enterprise: {
    name: 'Enterprise', slug: 'enterprise', price: { monthly: 99.99, yearly: 999.99 },
    limits: { workspaces: -1, files_per_workspace: -1, ai_requests_daily: -1, storage_mb: -1 },
    features: ['Everything in University', 'Unlimited storage', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales', popular: false,
  },
};

export const PLAN_ORDER = ['free', 'pro', 'researcher', 'university', 'enterprise'];

/**
 * Check if a user has exceeded their plan limit for a specific resource
 * Returns { allowed: boolean, current: number, limit: number }
 */
export async function checkUsageLimit(supabase, userId, limitType) {
  // Get user profile with plan
  const { data: profile } = await supabase.from('profiles').select('plan, usage_limits').eq('id', userId).single();
  if (!profile) return { allowed: false, current: 0, limit: 0 };

  const plan = PLANS[profile.plan] || PLANS.free;
  const limit = plan.limits[limitType];

  // -1 means unlimited
  if (limit === -1) return { allowed: true, current: 0, limit: -1 };

  let current = 0;

  switch (limitType) {
    case 'workspaces':
      const { count: wsCount } = await supabase.from('workspaces').select('id', { count: 'exact', head: true }).eq('user_id', userId);
      current = wsCount || 0;
      break;
    case 'files_per_workspace':
      // This should be checked per workspace, not globally
      current = 0; // Caller should provide workspace context
      break;
    case 'ai_requests_daily':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: aiCount } = await supabase.from('usage_tracking').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).gte('created_at', today.toISOString());
      current = aiCount || 0;
      break;
    case 'storage_mb':
      const { data: storageData } = await supabase.from('files').select('size_bytes').eq('user_id', userId);
      current = Math.round((storageData || []).reduce((sum, f) => sum + (f.size_bytes || 0), 0) / (1024 * 1024));
      break;
  }

  return { allowed: current < limit, current, limit };
}

export function getPlanFeatures(planSlug) {
  return PLANS[planSlug]?.features || PLANS.free.features;
}

export function formatPrice(price, period = 'monthly') {
  if (price === 0) return 'Free';
  return `$${price}/${period === 'monthly' ? 'mo' : 'yr'}`;
}
