
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key are required and must be set in environment variables.");
}

// Explicitly configure the client for robust session management.
// This ensures that the session is persisted across page loads and tokens are refreshed automatically.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
});
