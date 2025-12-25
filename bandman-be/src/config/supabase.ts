import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Key in environment variables');
}

// Using untyped clients for flexibility - types are enforced at the service layer
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Default server-side DB client (prefer service role when available)
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey ?? supabaseAnonKey,
);

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export const requireSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY - required for server-side profile creation',
    );
  }
  return supabaseAdmin;
};

// Helper to get authenticated supabase client for a user
export const getAuthenticatedClient = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};
