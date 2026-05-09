import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.supabaseUrl || !env.supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

// Service role client (backend operations)
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client (client-side operations)
export const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Helper to get client with auth context
export async function getSupabaseClient(token?: string) {
  if (!token) {
    return supabaseAdmin;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export type Database = any;
