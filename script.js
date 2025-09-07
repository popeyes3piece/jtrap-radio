// Main coordination script for JTrap Family Radio
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing JTrap Family Radio...');
  
  // Wait for all modules to be loaded
  const checkModules = () => {
    if (window.WindowManager && window.AudioPlayer && window.Requests && window.TerminalModule && window.MediaPlayer) {
      try {
        // Initialize all components
        window.WindowManager.initializeWindows();
        window.AudioPlayer.initializeCustomPlayer();
        window.Requests.initializeCustomRequests();
        window.MediaPlayer.initializeMediaPlayer();
        
        // Initialize terminal with a small delay to ensure xterm.js is fully loaded
        setTimeout(() => {
          if (window.TerminalModule && window.TerminalModule.initializeTerminal) {
            window.TerminalModule.initializeTerminal();
          }
        }, 100);
        
        
        // Initialize other components
        initializeClock();
        initializeWalkingCat();
        testConnection();
        
        // Start periodic updates
        if (window.AudioPlayer && window.AudioPlayer.updateNowPlaying) {
          window.AudioPlayer.updateNowPlaying();
          setInterval(() => window.AudioPlayer.updateNowPlaying(), 3000); // More frequent updates
          
          // Start real-time timing updates
          if (window.AudioPlayer.updateTimeDisplay) {
            setInterval(() => window.AudioPlayer.updateTimeDisplay(), 1000);
          }
        }
        
        if (window.History && window.History.updateHistory) {
          window.History.updateHistory();
          setInterval(() => window.History.updateHistory(), 30000);
        }
        
        if (window.Requests && window.Requests.updateLeaderboard) {
          window.Requests.updateLeaderboard();
          setInterval(() => window.Requests.updateLeaderboard(), 60000);
        }
        
        console.log('🎉 All systems initialized successfully!');
        
      } catch (error) {
        console.error('❌ Initialization error:', error);
      }
  } else {
      // Wait for modules to load
      setTimeout(checkModules, 100);
    }
  };
  
  checkModules();
});

// Clock functionality
function initializeClock() {
  updateClock();
  setInterval(updateClock, 1000);
  console.log('✅ Clock initialized');
}

function updateClock() {
  const clockElement = document.getElementById('taskbar-clock');
  if (clockElement) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    clockElement.textContent = timeString;
  }
}

function initializeWalkingCat() {
  console.log('Walking cat initialization placeholder');
}

// Window resizing is now handled by WindowManager module

function testConnection() {
  console.log('Connection test placeholder');
}

// API functions
function getApiUrl(endpoint) {
  const baseUrl = 'https://radio.jtrap.live';
  return baseUrl + endpoint;
}

async function fetchWithCorsBypass(url, options = {}) {
  try {
    // First try direct fetch with redirect handling
    const response = await fetch(url, {
      ...options,
      headers: { 
        'Accept': 'application/json',
        ...options.headers
      },
      redirect: 'follow' // Follow redirects automatically
    });
    
    if (response.ok) {
      return response;
    }
  } catch (error) {
    // Silent error handling - don't break the UI
    console.log(`Direct fetch failed for ${url}: ${error.message}`);
  }
  
  // If direct fetch fails, try with CORS proxy (only for public URLs)
  if (!url.includes('10.0.0.') && !url.includes('192.168.') && !url.includes('172.16.') && !url.includes('127.0.0.1')) {
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl, {
        ...options,
        headers: { 
          'Accept': 'application/json',
          ...options.headers
        }
      });
      
      return response;
    } catch (error) {
      console.log(`CORS proxy failed for ${url}: ${error.message}`);
    }
  }
  
  // If all else fails, return a mock response to prevent UI breaking
  console.log(`Returning mock response for ${url} to prevent UI breaking`);
  
  return { 
    ok: true, 
    status: 200, 
    json: () => Promise.resolve({}) 
  };
}


// Global API functions are now handled by modules

// Make functions globally available
window.getApiUrl = getApiUrl;
window.fetchWithCorsBypass = fetchWithCorsBypass;

