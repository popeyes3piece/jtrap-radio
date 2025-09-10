// Supabase Configuration for JTrap Radio BBS
// Project: supajtrap

const SUPABASE_CONFIG = {
  // Your Supabase Project URL
  url: 'https://pysojjrbzykihouptfnp.supabase.co',
  
  // Your Supabase Anon Key
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5c29qanJienlraWhvdXB0Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDcyMDIsImV4cCI6MjA3MjcyMzIwMn0.ZflpIeGllRtzPPIIwzk0jYT2WWp094l0nys4aD4qx2w'
};

// Initialize Supabase client
let supabase = null;

// Function to initialize Supabase
function initSupabase() {
  if (typeof window.supabase !== 'undefined') {
    try {
      supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('✅ Supabase: Connected');
      return true;
    } catch (error) {
      console.error('❌ Supabase: Connection failed', error);
      return false;
    }
  }
  return false;
}

// Try to initialize immediately
if (!initSupabase()) {
  // If that fails, try again with multiple attempts
  let attempts = 0;
  const maxAttempts = 5;
  const retryInterval = setInterval(() => {
    attempts++;
    if (initSupabase()) {
      clearInterval(retryInterval);
    } else if (attempts >= maxAttempts) {
      clearInterval(retryInterval);
      console.error('❌ Supabase: Failed to load after multiple retries');
    }
  }, 500);
}

// Export for use in other scripts
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabase = () => supabase;
