// Supabase Configuration for JTrap Radio BBS
// Replace these with your actual Supabase project details

const SUPABASE_CONFIG = {
  // Your Supabase Project URL (get this from Settings > API in your Supabase dashboard)
  url: 'https://pysojjrbzykihouptfnp.supabase.co',
  
  // Your Supabase Anon Key (the one you provided)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5c29qanJienlraWhvdXB0Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDcyMDIsImV4cCI6MjA3MjcyMzIwMn0.ZflpIeGllRtzPPIIwzk0jYT2WWp094l0nys4aD4qx2w'
};

// Initialize Supabase client
let supabase = null;

// Initialize Supabase when the page loads
document.addEventListener('DOMContentLoaded', function() {
  if (typeof supabase !== 'undefined') {
    supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('Supabase initialized successfully!');
  } else {
    console.error('Supabase library not loaded. Make sure to include the Supabase script in your HTML.');
  }
});

// Export for use in other scripts
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabase = () => supabase;
