const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabaseUrl = process.env.SUPABASE_URL;
let supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// In test environment, allow placeholder values to avoid hard failure when importing app
if ((!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV === 'test') {
  supabaseUrl = 'http://localhost';
  supabaseAnonKey = 'test';
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
