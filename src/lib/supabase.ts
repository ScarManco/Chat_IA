import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'rfid-management-system'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    timeout: 30000
  }
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    supabase.auth.refreshSession();
  }
});