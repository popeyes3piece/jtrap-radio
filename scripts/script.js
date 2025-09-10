document.addEventListener('DOMContentLoaded', () => {
  // Only run this once DOM is ready
  // Audio player initialization moved to audio-player.js module
  initializeCustomHistory();
  initializeCustomRequests();
  initializeMediaPlayer();
  initializeTerminal();
  initializeClock();
  initializeWalkingCat();
  testConnection();
  updateHistory();
  setInterval(updateHistory, 30000); // Update history every 30 seconds
  
  // Now Playing functionality moved to audio-player.js module

  // Set default window visibility - only player window open by default
  const windows = document.querySelectorAll(".window");
  windows.forEach((win) => {
    const id = win.id;
    if (id === 'playerWindow') {
      win.style.display = 'block';
    } else {
      win.style.display = 'none';
    }
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  closeNowPlayingSSE();
});


function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Time display functionality removed as requested

function startMarquee(textElem) {
  const container = document.getElementById("marquee-container");
  const textWidth = textElem.scrollWidth;
  const containerWidth = container.clientWidth;

  if (textWidth <= containerWidth) {
    textElem.style.transform = "translateX(0)";
    textElem.style.animation = "none";
    return;
  }

  const distance = textWidth + containerWidth;
  const duration = distance / 50; // 50px per second

  textElem.style.animation = `marqueeAnim ${duration}s linear infinite`;
}

// Add marquee keyframes once
if (!document.getElementById("marquee-style")) {
  const style = document.createElement("style");
  style.id = "marquee-style";
  style.textContent = `@keyframes marqueeAnim {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }`;
  document.head.appendChild(style);
}

// Custom Player Functionality
// Audio state moved to audio-player.js module

// Wake Lock functionality moved to audio-player.js module

// Audio player functionality moved to audio-player.js module

// Now Playing functionality removed as requested

// Custom History Functionality
function initializeCustomHistory() {
  const refreshBtn = document.getElementById('refresh-history');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', updateHistory);
  }
}

async function updateHistory() {
  try {
    const apiUrl = getApiUrl('/api/nowplaying/jtrap_radio');
    
    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // The API returns an array, so we need to get the first element
    const stationData = Array.isArray(data) ? data[0] : data;
    const history = stationData?.song_history || [];
    const historyList = document.getElementById('history-list');
    
    if (!historyList) return;
    
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-loading">No history available</div>';
      return;
    }
    
    // Limit to first 15 history items for better performance
    const maxHistory = 15;
    const historyToShow = history.slice(0, maxHistory);
    const hasMoreHistory = history.length > maxHistory;
    
    historyList.innerHTML = historyToShow.map(track => {
      const playedAt = new Date(track.played_at * 1000);
      const timeStr = playedAt.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const artUrl = track.song.art || null;
      
      return `
        <div class="history-item">
          <div class="history-time">${timeStr}</div>
          <div class="history-album-art">
            ${artUrl ? 
              `<img src="${artUrl}" alt="Album Art" class="history-art-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="history-no-art" style="display: none;">♪</div>` :
              `<div class="history-no-art">♪</div>`
            }
          </div>
          <div class="history-track">
            <div class="history-track-title">${track.song.title || 'Unknown Title'}</div>
            <div class="history-track-artist">${track.song.artist || 'Unknown Artist'}</div>
          </div>
        </div>
      `;
    }).join('') + (hasMoreHistory ? `<div class="history-more">... and ${history.length - maxHistory} more tracks</div>` : '');
    
  } catch (e) {
    console.error("Error fetching history:", e);
    const historyList = document.getElementById('history-list');
    if (historyList) {
      historyList.innerHTML = '<div class="history-error">Failed to load history</div>';
    }
  }
}

// Custom Requests Functionality
let availableSongs = [];
let recentRequests = [];

function initializeCustomRequests() {
  const refreshSongsBtn = document.getElementById('refresh-songs');
  
  if (refreshSongsBtn) {
    refreshSongsBtn.addEventListener('click', loadAvailableSongs);
  }
  
  // Load initial data
  loadAvailableSongs();
}

// Mobile-friendly window resizing

// Shuffle the current songs list
function shuffleCurrentSongs() {
  if (!availableSongs || availableSongs.length === 0) {
    loadAvailableSongs(); // Reload if no songs
    return;
  }
  
  const songsList = document.getElementById('songs-list');
  if (!songsList) return;
  
  // Shuffle the songs array for random display
  const shuffledSongs = [...availableSongs].sort(() => Math.random() - 0.5);
  
  // Limit to first 20 songs for better performance
  const maxSongs = 20;
  const songsToShow = shuffledSongs.slice(0, maxSongs);
  const hasMore = availableSongs.length > maxSongs;
  
  // Create song list
  songsList.innerHTML = songsToShow.map(song => {
    // Access nested song data - the API returns { request_id, request_url, song: { title, artist, ... } }
    const songData = song.song || song;
    const title = songData.title || songData.name || songData.song_title || songData.track_title || 'Unknown Title';
    const artist = songData.artist || songData.artist_name || songData.artist_title || songData.performer || 'Unknown Artist';
    const requestId = song.request_id || song.id || song.song_id || song.track_id;
    const songId = songData.id || songData.song_id || songData.track_id;
    
    const artUrl = songData.art || null;
    
    return `
      <div class="song-item">
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
        <div class="song-actions">
          <button class="request-btn" data-song-id="${requestId}" onclick="requestSong('${requestId}')">
            Request
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  if (hasMore) {
    songsList.innerHTML += `<div class="songs-more">... and ${availableSongs.length - maxSongs} more songs available</div>`;
  }
}

async function loadAvailableSongs() {
  const songsList = document.getElementById('songs-list');
  if (!songsList) return;
  
  // Show loading state
  songsList.innerHTML = '<div class="songs-loading">Loading songs...</div>';
  
  try {
    // Try multiple possible endpoints
    const endpoints = [
      '/api/requests',
      '/api/station/random/requests',
      '/api/station/1/requests',
      '/api/station/jtrap_radio/requests'
    ];
    
    let data = null;
    let workingEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        const apiUrl = getApiUrl(endpoint);
        const res = await fetchWithCorsBypass(apiUrl);
        
        if (res.ok) {
          data = await res.json();
          workingEndpoint = endpoint;
          break;
        }
      } catch (e) {
        // Try next endpoint
        continue;
      }
    }
    
    if (!data) {
      throw new Error('No working requests endpoint found');
    }
    
    availableSongs = data || [];
    
    if (availableSongs.length === 0) {
      songsList.innerHTML = '<div class="songs-loading">No songs available for request</div>';
      return;
    }
    
    // Shuffle the songs array for random display
    const shuffledSongs = [...availableSongs].sort(() => Math.random() - 0.5);
    
    // Limit to first 20 songs for better performance
    const maxSongs = 20;
    const songsToShow = shuffledSongs.slice(0, maxSongs);
    const hasMore = availableSongs.length > maxSongs;
    
    // Create song list
    songsList.innerHTML = songsToShow.map(song => {
      // Access nested song data - the API returns { request_id, request_url, song: { title, artist, ... } }
      const songData = song.song || song;
      const title = songData.title || songData.name || songData.song_title || songData.track_title || 'Unknown Title';
      const artist = songData.artist || songData.artist_name || songData.artist_title || songData.performer || 'Unknown Artist';
      const requestId = song.request_id || song.id || song.song_id || song.track_id;
      const songId = songData.id || songData.song_id || songData.track_id;
      
      const artUrl = songData.art || null;
      
      return `
        <div class="song-item">
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
          <button class="song-request-btn" data-song-id="${requestId}" onclick="requestSong('${requestId}')">
            Request
          </button>
        </div>
      `;
    }).join('') + (hasMore ? `<div class="songs-more">... and ${availableSongs.length - maxSongs} more songs available</div>` : '');
    
    // Songs loaded successfully
    
  } catch (e) {
    console.error("Error loading available songs:", e);
    songsList.innerHTML = '<div class="songs-loading">No songs available for request</div>';
    // Don't show error message to user - if radio works, this is expected
  }
}


async function requestSong(songId) {
  const button = document.querySelector(`[data-song-id="${songId}"]`);
  
  if (!button) return;
  
  // Check if already requested
  if (button.classList.contains('requested')) {
    return;
  }
  
  // Check if this is a sample/mock song (only for local development)
  if (songId.startsWith('sample') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
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
        const apiUrl = getApiUrl(endpoint.url);
        const response = await fetchWithCorsBypass(apiUrl, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          success = true;
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
    // Re-enable button on error
    button.disabled = false;
    button.textContent = 'Request';
  }
}




// Window management functions moved to window-manager.js module

// Media Player Functionality
let currentMediaElement = null;
let mediaFiles = [];
let currentVideoIndex = 0;

function initializeMediaPlayer() {
  const mediaDisplay = document.getElementById('media-display');
  const prevBtn = document.getElementById('prev-video-btn');
  const nextBtn = document.getElementById('next-video-btn');
  const videoName = document.getElementById('current-video-name');
  
  if (!mediaDisplay || !prevBtn || !nextBtn) return;
  
  // Load available media files
  loadMediaFiles();
  
  // Set up event listeners
  prevBtn.addEventListener('click', () => {
    previousVideo();
  });
  
  nextBtn.addEventListener('click', () => {
    nextVideo();
  });
  
  // Add minimize button functionality
  const mediaWindow = document.getElementById('media-player-window');
  const minimizeBtn = mediaWindow.querySelector('.title-bar-controls button[aria-label="Minimize"]');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      mediaWindow.style.display = 'none';
    });
  }
  
  // Start playing the first video automatically
  if (mediaFiles.length > 0) {
    playVideo(0);
  }
}

function loadMediaFiles() {
  // List of available media files (you can add more)
  mediaFiles = [
    { name: 'Ear Man', path: 'media/Ear Man.webm', type: 'video' },
    { name: 'Jumpscare', path: 'media/Jumpscare.webm', type: 'video' },
    { name: 'Keanu Wants Pizza', path: 'media/Keanu Wants Pizza.webm', type: 'video' },
    { name: 'Sometimes', path: 'media/Sometimes.webm', type: 'video' },
    { name: 'Video 1', path: 'media/1667603304819993.webm', type: 'video' },
    { name: 'Video 2', path: 'media/1677606720568062.webm', type: 'video' },
    { name: 'Video 3', path: 'media/1687215412211774.webm', type: 'video' },
    { name: 'Video 4', path: 'media/1689744919165944.webm', type: 'video' },
    { name: 'Video 5', path: 'media/1745772417099947.webm', type: 'video' },
    { name: 'Video 6', path: 'media/1747208500093058.webm', type: 'video' },
    { name: 'Video 7', path: 'media/1751039720101799 (1).webm', type: 'video' }
  ];
}

function playVideo(index) {
  if (index < 0 || index >= mediaFiles.length) return;
  
  currentVideoIndex = index;
  const video = mediaFiles[index];
  const mediaDisplay = document.getElementById('media-display');
  const videoName = document.getElementById('current-video-name');
  
  if (!mediaDisplay || !video) return;
  
  // Clear existing media
  mediaDisplay.innerHTML = '';
  
  // Create video element
  const videoElement = document.createElement('video');
  videoElement.controls = true;
  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.preload = 'metadata';
  videoElement.src = video.path;
  videoElement.style.maxWidth = '100%';
  videoElement.style.maxHeight = '100%';
  videoElement.style.objectFit = 'contain';
  
  // Handle aspect ratio when video loads
  videoElement.addEventListener('loadedmetadata', () => {
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const mediaWindow = document.getElementById('media-player-window');
    
    if (mediaWindow && aspectRatio > 0) {
      // Calculate new dimensions based on aspect ratio
      const maxWidth = 600;
      const maxHeight = 400;
      
      let newWidth = maxWidth;
      let newHeight = maxWidth / aspectRatio;
      
      // If height exceeds max, scale down
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
      }
      
      // Update window size
      mediaWindow.style.width = `${Math.round(newWidth)}px`;
      mediaWindow.style.height = `${Math.round(newHeight + 50)}px`; // +50 for title bar
      
      console.log(`Video aspect ratio: ${aspectRatio.toFixed(2)}, Window resized to: ${Math.round(newWidth)}x${Math.round(newHeight)}`);
    }
  });
  
  // Set up event listener for when video ends
  videoElement.addEventListener('ended', () => {
    nextVideo();
  });
  
  mediaDisplay.appendChild(videoElement);
  currentMediaElement = videoElement;
  
  // Update video name display
  if (videoName) {
    videoName.textContent = `${index + 1}/${mediaFiles.length} - ${video.name}`;
  }
  
  // Auto-play
  videoElement.play().catch(e => {
    console.log('Autoplay prevented:', e);
  });
}

function nextVideo() {
  const nextIndex = (currentVideoIndex + 1) % mediaFiles.length;
  playVideo(nextIndex);
}

function previousVideo() {
  const prevIndex = currentVideoIndex === 0 ? mediaFiles.length - 1 : currentVideoIndex - 1;
  playVideo(prevIndex);
}



// Clock Functionality
function initializeClock() {
  updateClock();
  setInterval(updateClock, 1000); // Update every second
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

// Walking Cat Functionality
function initializeWalkingCat() {
  const walkingCat = document.getElementById('walking-cat');
  if (!walkingCat) return;
  
  let isDragging = false;
  let offsetX, offsetY;
  let currentTouch = null;
  let isPaused = false;
  
  // Mouse events
  walkingCat.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    isPaused = true;
    walkingCat.style.animationPlayState = 'paused';
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    walkingCat.style.zIndex = 1000;
  });
  
  // Touch events
  walkingCat.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true;
      isPaused = true;
      walkingCat.style.animationPlayState = 'paused';
      currentTouch = e.touches[0];
      const rect = walkingCat.getBoundingClientRect();
      offsetX = currentTouch.clientX - rect.left;
      offsetY = currentTouch.clientY - rect.top;
      walkingCat.style.zIndex = 1000;
    }
  });
  
  // Mouse move
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const constrained = constrainCatPosition(walkingCat, e.pageX - offsetX, e.pageY - offsetY);
    walkingCat.style.left = `${constrained.x}px`;
    walkingCat.style.top = `${constrained.y}px`;
  });
  
  // Touch move
  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !currentTouch) return;
    e.preventDefault();
    const touch = e.touches[0];
    const constrained = constrainCatPosition(walkingCat, touch.pageX - offsetX, touch.pageY - offsetY);
    walkingCat.style.left = `${constrained.x}px`;
    walkingCat.style.top = `${constrained.y}px`;
  });
  
  // Mouse up
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    walkingCat.style.zIndex = 999;
    
    // Resume animation after a short delay
    setTimeout(() => {
      if (!isPaused) {
        walkingCat.style.animationPlayState = 'running';
      }
    }, 1000);
  });
  
  // Touch end
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    currentTouch = null;
    walkingCat.style.zIndex = 999;
    
    // Resume animation after a short delay
    setTimeout(() => {
      if (!isPaused) {
        walkingCat.style.animationPlayState = 'running';
      }
    }, 1000);
  });
  
  // Click to pause/resume
  walkingCat.addEventListener('click', (e) => {
    if (isDragging) return;
    e.preventDefault();
    isPaused = !isPaused;
    walkingCat.style.animationPlayState = isPaused ? 'paused' : 'running';
  });
  
  // Double-click to reset position and resume walking
  walkingCat.addEventListener('dblclick', (e) => {
    e.preventDefault();
    isPaused = false;
    walkingCat.style.left = '-100px';
    walkingCat.style.top = 'auto';
    walkingCat.style.bottom = '30px';
    walkingCat.style.animationPlayState = 'running';
  });
}

function constrainCatPosition(cat, x, y) {
  const rect = cat.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height - 30; // Account for taskbar
  
  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY))
  };
}

// CORS Proxy function for GitHub Pages
function getCorsProxyUrl(url) {
  // For local development, use our local CORS proxy
  if (isLocalDevelopment()) {
    return `http://localhost:3001/${url}`;
  }
  
  // For GitHub Pages, use external CORS proxy
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
}

// Check if we're running on GitHub Pages
function isGitHubPages() {
  return window.location.hostname.includes('github.io') || 
         window.location.hostname.includes('github.com');
}

// Check if we're running locally
function isLocalDevelopment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.startsWith('10.0.0.');
}

// Get the correct API URL based on environment
function getApiUrl(endpoint) {
  // Use live AzuraCast server for production
  const baseUrl = "https://radio.jtrap.live";
  const fullUrl = `${baseUrl}${endpoint}`;
  
  return fullUrl;
}

// Now Playing functionality moved to audio-player.js module

function initializeNowPlayingSSE() {
  const sseBaseUri = "https://radio.jtrap.live/api/live/nowplaying/sse";
  const sseUriParams = new URLSearchParams({
    "cf_connect": JSON.stringify({
      "subs": {
        "station:jtrap_radio": {"recover": true}
      }
    })
  });
  const sseUri = sseBaseUri + "?" + sseUriParams.toString();
  
  // Initializing real-time Now Playing SSE
  
  try {
    nowPlayingSSE = new EventSource(sseUri);
    
    nowPlayingSSE.onopen = function(e) {
      // SSE connected
    };
    
    nowPlayingSSE.onmessage = function(e) {
      try {
        const jsonData = JSON.parse(e.data);
        
        if ('connect' in jsonData) {
          const connectData = jsonData.connect;
          
          if ('data' in connectData) {
            // Legacy SSE data
            connectData.data.forEach(handleNowPlayingData);
          } else {
            // New Centrifugo format
            if ('time' in connectData) {
              // Handle time updates if needed
            }
            
            // Handle initial NowPlaying data
            for (const subName in connectData.subs) {
              const sub = connectData.subs[subName];
              if ('publications' in sub && sub.publications.length > 0) {
                sub.publications.forEach((initialRow) => handleNowPlayingData(initialRow, false));
              }
            }
          }
        } else if ('pub' in jsonData) {
          handleNowPlayingData(jsonData.pub);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    nowPlayingSSE.onerror = function(e) {
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (nowPlayingSSE.readyState === EventSource.CLOSED) {
          initializeNowPlayingSSE();
        }
      }, 5000);
    };
    
  } catch (error) {
    console.error('Failed to initialize Now Playing SSE:', error);
  }
}

function handleNowPlayingData(ssePayload, useTime = true) {
  const jsonData = ssePayload.data;
  
  if (jsonData && jsonData.np) {
    nowPlayingData = jsonData.np;
    updateNowPlayingDisplay();
  }
}

function updateNowPlayingDisplay() {
  if (!nowPlayingData) return;
  
  const song = nowPlayingData.now_playing?.song || {};
  const station = nowPlayingData.station || {};
  const listeners = nowPlayingData.listeners || {};
  
  // Update song title
  const songTitleEl = document.getElementById('custom-track-title');
  if (songTitleEl) {
    songTitleEl.textContent = song.title || 'Unknown Title';
  }
  
  // Update song artist
  const songArtistEl = document.getElementById('custom-track-artist');
  if (songArtistEl) {
    songArtistEl.textContent = song.artist || 'Unknown Artist';
  }
  
  // Update song album
  const songAlbumEl = document.getElementById('custom-track-album');
  if (songAlbumEl) {
    songAlbumEl.textContent = song.album || 'Unknown Album';
  }
  
  // Update station name
  const stationNameEl = document.getElementById('custom-station-name');
  if (stationNameEl) {
    stationNameEl.textContent = station.name || 'JTrap Radio';
  }
  
  // Update listener count
  const listenerCountEl = document.getElementById('custom-listeners');
  if (listenerCountEl) {
    listenerCountEl.textContent = `Listeners: ${listeners.total || 0}`;
  }
  
  // Update album art if available
  const albumArtEl = document.getElementById('custom-album-art');
  const noArtPlaceholder = document.getElementById('no-art-placeholder');
  if (albumArtEl && song.art) {
    albumArtEl.src = song.art;
    albumArtEl.style.display = 'block';
    if (noArtPlaceholder) {
      noArtPlaceholder.style.display = 'none';
    }
  } else if (noArtPlaceholder) {
    noArtPlaceholder.style.display = 'block';
    if (albumArtEl) {
      albumArtEl.style.display = 'none';
    }
  }
  
  // Update progress bar and timing (only when audio is playing)
  const nowPlaying = nowPlayingData.now_playing || {};
  const elapsed = nowPlaying.elapsed || 0;
  const duration = nowPlaying.duration || 0;
  
  // Only update progress bar when audio is actually playing
  if (AudioPlayer.getPlayingState() && duration > 0) {
    // Update elapsed time
    const elapsedEl = document.getElementById('custom-time-elapsed');
    if (elapsedEl) {
      elapsedEl.textContent = formatTime(elapsed);
    }
    
    // Update remaining time
    const remainingEl = document.getElementById('custom-time-remaining');
    if (remainingEl) {
      const remaining = Math.max(0, duration - elapsed);
      remainingEl.textContent = formatTime(remaining);
    }
    
    // Update progress bar
    const progressFill = document.getElementById('custom-progress-fill');
    if (progressFill) {
      const progressPercent = (elapsed / duration) * 100;
      progressFill.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }
  } else {
    // When not playing, show static info or reset progress
    const elapsedEl = document.getElementById('custom-time-elapsed');
    const remainingEl = document.getElementById('custom-time-remaining');
    const progressFill = document.getElementById('custom-progress-fill');
    
    if (elapsedEl && !isPlaying) {
      elapsedEl.textContent = '0:00';
    }
    if (remainingEl && !isPlaying) {
      remainingEl.textContent = formatTime(duration);
    }
    if (progressFill && !isPlaying) {
      progressFill.style.width = '0%';
      progressFill.classList.add('paused');
    }
    
    // Progress bar paused - audio not playing
  }
}

function closeNowPlayingSSE() {
  if (nowPlayingSSE) {
    nowPlayingSSE.close();
    nowPlayingSSE = null;
  }
}

// Real-time progress bar updates (only when playing)
function updateProgressBar() {
  if (!isPlaying || !nowPlayingData) return;
  
  const nowPlaying = nowPlayingData.now_playing || {};
  const duration = nowPlaying.duration || 0;
  
  if (duration <= 0) return;
  
  // Calculate current elapsed time based on when the song started
  const playedAt = nowPlaying.played_at || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, currentTime - playedAt);
  
  // Only update if we're within the song duration
  if (elapsed <= duration) {
    const elapsedEl = document.getElementById('custom-time-elapsed');
    const remainingEl = document.getElementById('custom-time-remaining');
    const progressFill = document.getElementById('custom-progress-fill');
    
    if (elapsedEl) {
      elapsedEl.textContent = formatTime(elapsed);
    }
    
    if (remainingEl) {
      const remaining = Math.max(0, duration - elapsed);
      remainingEl.textContent = formatTime(remaining);
    }
    
    if (progressFill) {
      const progressPercent = (elapsed / duration) * 100;
      progressFill.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
      progressFill.classList.remove('paused');
    }
  }
}

// Fallback function to load now playing data from regular API
async function loadNowPlayingData() {
  try {
    const apiUrl = getApiUrl('/api/nowplaying/jtrap_radio');
    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // The API returns an array, so we need to get the first element
    const stationData = Array.isArray(data) ? data[0] : data;
    
    if (stationData) {
      nowPlayingData = stationData;
      updateNowPlayingDisplay();
    }
    
  } catch (error) {
    // Silent error handling for production
  }
}

// Try to bypass CORS by using a different approach
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
  
  // For requests endpoint, return some sample data only if it's a local/private URL
  if (url.includes('/requests') && (url.includes('10.0.0.') || url.includes('localhost'))) {
    return { 
      ok: true, 
      status: 200, 
      json: () => Promise.resolve([
        {
          request_id: 'sample1',
          song: {
            id: 'song1',
            title: 'Sample Song 1',
            artist: 'Sample Artist',
            album: 'Sample Album',
            art: null
          }
        },
        {
          request_id: 'sample2',
          song: {
            id: 'song2',
            title: 'Sample Song 2',
            artist: 'Sample Artist 2',
            album: 'Sample Album 2',
            art: null
          }
        }
      ])
    };
  }
  
  return { 
    ok: true, 
    status: 200, 
    json: () => Promise.resolve({}) 
  };
}

// Test connection function
async function testConnection() {
  console.log("🔍 Testing connection to AzuraCast server...");
  
  // First, let's try to access the basic API root
  const baseUrls = ["http://10.0.0.36", "https://10.0.0.36"];
  
  for (const baseUrl of baseUrls) {
    console.log(`\n🔍 Testing base URL: ${baseUrl}`);
    
    // Test basic API endpoints - AzuraCast uses different structure
    const endpoints = [
      '/api',
      '/api/stations',
      '/api/nowplaying',
      '/api/nowplaying/1',
      '/api/nowplaying/jtrap_radio',
      '/api/nowplaying/jtrap',
      '/api/nowplaying/radio',
      // Try the correct AzuraCast API structure
      '/api/station/1/nowplaying',
      '/api/station/jtrap_radio/nowplaying',
      '/api/station/1/requests',
      '/api/station/jtrap_radio/requests'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`Testing: ${url}`);
        
        const response = await fetch(url, { 
          headers: { 'Accept': 'application/json' }
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`  ✅ SUCCESS! Data:`, data);
          
          // If this is a stations endpoint, show available stations
          if (endpoint === '/api/stations' && Array.isArray(data)) {
            console.log(`  ◉ Available stations:`, data.map(s => s.shortcode || s.name || s.id));
          }
        }
      } catch (error) {
        console.log(`  ❌ Error:`, error.message);
      }
    }
  }
  
  console.log("\n🔍 Connection test complete. Look for SUCCESS messages above.");
}

// Terminal initialization
let terminal = null;

function initializeTerminal() {
  try {
    // Initialize xterm.js terminal
    terminal = new Terminal({
      theme: {
        // Gruvbox Dark color scheme
        background: '#282828',      // gruvbox-bg0
        foreground: '#ebdbb2',      // gruvbox-fg
        cursor: '#ebdbb2',          // gruvbox-fg
        selection: '#3c3836',       // gruvbox-bg2
        black: '#282828',           // gruvbox-bg0
        red: '#cc241d',             // gruvbox-red
        green: '#98971a',           // gruvbox-green
        yellow: '#d79921',          // gruvbox-yellow
        blue: '#458588',            // gruvbox-blue
        magenta: '#b16286',         // gruvbox-purple
        cyan: '#689d6a',            // gruvbox-aqua
        white: '#a89984',           // gruvbox-gray
        brightBlack: '#928374',     // gruvbox-bg4
        brightRed: '#fb4934',       // gruvbox-bright-red
        brightGreen: '#b8bb26',     // gruvbox-bright-green
        brightYellow: '#fabd2f',    // gruvbox-bright-yellow
        brightBlue: '#83a598',      // gruvbox-bright-blue
        brightMagenta: '#d3869b',   // gruvbox-bright-purple
        brightCyan: '#8ec07c',      // gruvbox-bright-aqua
        brightWhite: '#ebdbb2'      // gruvbox-fg
      },
      fontSize: 13,                 // Increased from 12
      fontFamily: 'Courier New, monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4
    });

    // Add fit addon for responsive terminal
    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in the DOM
    const terminalElement = document.getElementById('terminal');
    if (terminalElement) {
      terminal.open(terminalElement);
      fitAddon.fit();
      
      // Add welcome message
      terminal.writeln('\x1b[32mWelcome to JTrap Family Radio Terminal!\x1b[0m');
      terminal.writeln('\x1b[33mType "help" for available commands.\x1b[0m');
      terminal.writeln('');
      
      // Add some retro commands
      terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
      terminal.writeln('  help     - Show this help message');
      terminal.writeln('  radio    - Show radio station info');
      terminal.writeln('  time     - Show current time');
      terminal.writeln('  clear    - Clear the terminal');
      terminal.writeln('  matrix   - Matrix effect (coming soon)');
      terminal.writeln('  bbs      - Access BBS system');
      terminal.writeln('');
      
      // Set up command handling
      let currentLine = '';
      terminal.onData(data => {
        if (data === '\r') { // Enter key
          terminal.writeln('');
          if (window.BBS && window.BBS.bbsMode()) {
            window.BBS.handleBBSCommand(currentLine.trim());
          } else {
            handleCommand(currentLine.trim());
          }
          currentLine = '';
          if (!window.BBS || !window.BBS.bbsMode()) {
            terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
          }
        } else if (data === '\x7f') { // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            terminal.write('\b \b');
          }
        } else if (data >= ' ') { // Printable characters
          currentLine += data;
          terminal.write(data);
        }
      });
      
      // Show prompt
      terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
      
      // Handle window resize
      window.addEventListener('resize', () => {
        if (terminal && fitAddon) {
          fitAddon.fit();
        }
      });
    }
  } catch (error) {
    console.error('Failed to initialize terminal:', error);
  }
}

function handleCommand(command) {
  switch (command.toLowerCase()) {
    case 'help':
      terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
      terminal.writeln('  help     - Show this help message');
      terminal.writeln('  radio    - Show radio station info');
      terminal.writeln('  time     - Show current time');
      terminal.writeln('  clear    - Clear the terminal');
      terminal.writeln('  matrix   - Matrix effect (coming soon)');
      terminal.writeln('  bbs      - Access BBS system');
      break;
      
    case 'radio':
      terminal.writeln('\x1b[33m🎵 JTrap Family Radio Station\x1b[0m');
      terminal.writeln('  Frequency: 99.9 FM');
      terminal.writeln('  Website: jtrap.radio');
      terminal.writeln('  Status: Online');
      terminal.writeln('  Listeners: ' + Math.floor(Math.random() * 50) + 1);
      break;
      
    case 'time':
      const now = new Date();
      terminal.writeln(`\x1b[35mCurrent time: ${now.toLocaleString()}\x1b[0m`);
      break;
      
    case 'clear':
      terminal.clear();
      break;
      
    case 'matrix':
      terminal.writeln('\x1b[32mMatrix effect coming soon...\x1b[0m');
      break;
      
    case 'bbs':
      // Check if BBS is available, with fallback
      if (window.BBS && window.BBS.showBBSLogin) {
        window.BBS.showBBSLogin();
      } else if (window.BBS && window.BBS.showBBSLogin) {
        // Try the Supabase version
        window.BBS.showBBSLogin();
      } else {
        terminal.writeln('\x1b[31mBBS system not loaded. Please refresh the page.\x1b[0m');
        terminal.writeln('\x1b[33mTrying to load BBS system...\x1b[0m');
        // Try to load the BBS system manually
        setTimeout(() => {
          if (window.BBS && window.BBS.showBBSLogin) {
            terminal.writeln('\x1b[32mBBS system loaded! Try "bbs" again.\x1b[0m');
          } else {
            terminal.writeln('\x1b[31mBBS system still not available. Check console for errors.\x1b[0m');
          }
        }, 1000);
      }
      break;
      
    case '':
      // Empty command, do nothing
      break;
      
    default:
      terminal.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m`);
      terminal.writeln('Type "help" for available commands.');
  }
}

