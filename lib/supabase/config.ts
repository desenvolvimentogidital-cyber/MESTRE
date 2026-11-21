/**
 * Public configuration for the ConectaServ marketplace.
 *
 * The publishable key below is intentionally safe for browser clients. Supabase
 * Row Level Security remains responsible for restricting access to user data.
 * Vercel environment variables take precedence when provided.
 *
 * Never put sb_secret_ or service_role keys here.
 */
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://iswfypzcjwrjnnuavans.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "sb_publishable_uwfAopPkjtM4l5mfqrpMxw_lxOPPp_4";
