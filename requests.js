// Requests - Handles song requests and leaderboard functionality
// Based on the original working script_old.js

let availableSongs = [];

// Initialize custom requests
function initializeCustomRequests() {
  const refreshSongsBtn = document.getElementById('refresh-songs');
  
  if (refreshSongsBtn) {
    refreshSongsBtn.addEventListener('click', loadAvailableSongs);
  }
  
  // Load initial data
  loadAvailableSongs();
}


// Load available songs for requests
async function loadAvailableSongs() {
  try {
    // Try multiple possible endpoints like the old script
    const endpoints = [
      '/api/station/1/requests',
      '/api/station/jtrap_radio/requests',
      '/api/requests'
    ];
    
    let data = null;
    for (const endpoint of endpoints) {
      try {
        const apiUrl = window.getApiUrl(endpoint);
        const res = await window.fetchWithCorsBypass(apiUrl);
        
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!data) {
      throw new Error('No working requests endpoint found');
    }
    
    availableSongs = data || [];
    updateSongsList();
    
  } catch (e) {
    console.error("Error loading available songs:", e);
    availableSongs = [];
    updateSongsList();
  }
}

// Update the songs list in the UI
function updateSongsList() {
  const songsList = document.getElementById('songs-list');
  if (!songsList) {
    console.log('❌ songs-list element not found');
    return;
  }
  
  console.log('🎵 Updating songs list, available songs:', availableSongs.length);
  
  if (availableSongs.length === 0) {
    songsList.innerHTML = '<div class="no-songs">No songs available for request</div>';
    return;
  }
  
  // Shuffle the songs array for random display
  const shuffledSongs = [...availableSongs].sort(() => Math.random() - 0.5);
  
  // Limit to first 15 songs to prevent window overflow
  const maxSongs = 15;
  const songsToShow = shuffledSongs.slice(0, maxSongs);
  const hasMore = availableSongs.length > maxSongs;
  
  console.log('🎵 Songs to show:', songsToShow.length, 'Has more:', hasMore);
  
  songsList.innerHTML = songsToShow.map(song => {
    // Access nested song data - the API returns { request_id, request_url, song: { title, artist, ... } }
    const songData = song.song || song;
    const title = songData.title || songData.name || songData.song_title || songData.track_title || 'Unknown Title';
    const artist = songData.artist || songData.artist_name || songData.artist_title || songData.performer || 'Unknown Artist';
    const requestId = song.request_id || song.id || song.song_id || song.track_id;
    const songId = songData.id || songData.song_id || songData.track_id;
    
    const artUrl = songData.art || null;
    
    return `
      <div class="song-item" data-song-id="${requestId}">
        <div class="song-album-art">
          ${artUrl ? 
            `<img src="${artUrl}" alt="Album Art" class="song-art-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="song-no-art" style="display: none;">♪</div>` :
            `<div class="song-no-art">♪</div>`
          }
        </div>
        <div class="song-details">
          <div class="song-title">${title}</div>
          <div class="song-artist">${artist}</div>
        </div>
        <button class="song-request-btn" onclick="requestSong('${requestId}')">Request</button>
      </div>
    `;
  }).join('') + (hasMore ? `<div class="songs-more">... and ${availableSongs.length - maxSongs} more songs</div>` : '');
}

// Request a song
async function requestSong(songId) {
  const button = document.querySelector(`[data-song-id="${songId}"]`);
  
  if (!button) return;
  
  // Check if already requested
  if (button.classList.contains('requested')) {
    showStatus('This song has already been requested!', 'info');
    return;
  }
  
  // Check if this is a sample/mock song (only for local development)
  if (songId.startsWith('sample') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    showStatus('This is a sample song for demonstration. In the live version, this would submit a real request!', 'info');
    
    // Mark button as requested for demo purposes
    button.textContent = 'Requested ✓';
    button.classList.add('requested');
    button.disabled = true;
    return;
  }
  
  // For real songs, try to make the actual request
  try {
    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Requesting...';
    
    // Try the actual request
    const endpoints = [
      { url: `/api/station/jtrap_radio/request/${songId}`, method: 'POST' },
      { url: `/api/station/1/request/${songId}`, method: 'POST' }
    ];
    
    let success = false;
    for (const endpoint of endpoints) {
      try {
        const apiUrl = window.getApiUrl(endpoint.url);
        const response = await window.fetchWithCorsBypass(apiUrl, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          success = true;
          showStatus('Song request submitted successfully!', 'success');
          button.textContent = 'Requested ✓';
          button.classList.add('requested');
          return;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!success) {
      throw new Error('Request failed');
    }
    
  } catch (e) {
    // Show CORS warning for real requests that fail
    showStatus('Song requests are currently disabled due to CORS restrictions. This will work when deployed live!', 'info');
    
    // Re-enable button
    button.disabled = false;
    button.textContent = 'Request';
  }
}



// Show status message
function showStatus(message, type = 'info') {
  console.log('🎵 Showing status:', message, type);
  const statusDiv = document.getElementById('request-status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `request-status ${type}`;
    console.log('🎵 Status div updated:', statusDiv.textContent, statusDiv.className);
    
    // Auto-clear success/info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (statusDiv.textContent === message) {
          clearStatus();
        }
      }, 5000);
    }
  } else {
    console.error('🎵 Status div not found!');
  }
}

function clearStatus() {
  const statusDiv = document.getElementById('request-status');
  if (statusDiv) {
    statusDiv.textContent = '';
    statusDiv.className = 'request-status';
  }
}

// Export functions to global scope
window.Requests = {
  initializeCustomRequests,
  loadAvailableSongs,
  requestSong,
  showStatus,
  clearStatus
};