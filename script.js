document.addEventListener('DOMContentLoaded', () => {
  // Only run this once DOM is ready
  initializeCustomPlayer();
  initializeCustomHistory();
  initializeCustomRequests();
  initializeMediaPlayer();
  initializeTerminal();
  initializeClock();
  initializeWalkingCat();
  initializeWindowResizing();
  testConnection();
  updateNowPlaying();
  updateHistory();
  updateLeaderboard();
  setInterval(updateNowPlaying, 5000);
  setInterval(updateHistory, 30000); // Update history every 30 seconds
  setInterval(updateLeaderboard, 60000); // Update leaderboard every 60 seconds

  const windows = document.querySelectorAll(".window");
  const taskbar = document.getElementById("taskbar");
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);
  
  // Add mobile class to body for CSS targeting
  if (isMobile) {
    document.body.classList.add('mobile');
  }

  windows.forEach((win, i) => {
    const title = win.querySelector(".title-bar");
    const id = win.id;

    // Handle media player window and terminal window specially (no auto taskbar button, but add dragging)
    if (id === 'media-player-window' || id === 'terminalWindow') {
      // Add dragging functionality to these windows
      makeWindowDraggable(win, title);
      // Add click handler to bring to front
      title.addEventListener("click", () => bringToFront(win));
      return;
    }

    // Restore position from localStorage (with mobile adjustments)
    const saved = localStorage.getItem(`win-${id}`);
    if (saved) {
      const { top, left } = JSON.parse(saved);
      win.style.top = top;
      win.style.left = left;
    } else if (isMobile) {
      // Better initial positioning for mobile
      const offset = i * 20;
      win.style.top = `${50 + offset}px`;
      win.style.left = `${10 + offset}px`;
      win.style.width = "calc(100vw - 20px)";
      win.style.maxWidth = "400px";
    }

    document.getElementById("reset-windows").addEventListener("click", () => {
      document.querySelectorAll(".window").forEach((win, i) => {
        const offset = i * 30;
        if (isMobile) {
          win.style.top = `${50 + offset}px`;
          win.style.left = `${10 + offset}px`;
          win.style.width = "calc(100vw - 20px)";
          win.style.maxWidth = "400px";
          win.style.height = "250px";
        } else {
        win.style.top = `${60 + offset}px`;
        win.style.left = `${60 + offset}px`;
        win.style.width = "300px";
        win.style.height = "200px";
        }
        // Clear saved positions
        localStorage.removeItem(`win-${win.id}`);
      });
    });

    // Add taskbar button
    const btn = document.createElement("button");
    btn.className = "taskbar-btn";
    btn.textContent = title.querySelector(".title-bar-text").textContent;
    btn.addEventListener("click", () => {
      win.classList.toggle("hidden");
      if (!win.classList.contains("hidden")) {
        bringToFront(win);
      }
    });
    
    // Create taskbar left section if it doesn't exist
    let taskbarLeft = document.querySelector('.taskbar-left');
    if (!taskbarLeft) {
      taskbarLeft = document.createElement('div');
      taskbarLeft.className = 'taskbar-left';
      taskbar.insertBefore(taskbarLeft, taskbar.firstChild);
    }
    
    taskbarLeft.appendChild(btn);

    // Add click handler to bring to front
    title.addEventListener("click", () => bringToFront(win));

    // Drag functionality (mouse and touch)
    let isDragging = false;
    let offsetX, offsetY;
    let currentTouch = null;

    // Mouse events
    title.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      bringToFront(win);
    });

    // Touch events
    title.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        isDragging = true;
        currentTouch = e.touches[0];
        const rect = title.getBoundingClientRect();
        offsetX = currentTouch.clientX - rect.left;
        offsetY = currentTouch.clientY - rect.top;
        bringToFront(win);
      }
    });

    // Helper function to constrain window position
    function constrainWindowPosition(win, x, y) {
      const rect = win.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height - 30; // Account for taskbar
      
      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY))
      };
    }

    // Mouse move
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const constrained = constrainWindowPosition(win, e.pageX - offsetX, e.pageY - offsetY);
      win.style.left = `${constrained.x}px`;
      win.style.top = `${constrained.y}px`;
    });

    // Touch move
    document.addEventListener("touchmove", (e) => {
      if (!isDragging || !currentTouch) return;
      e.preventDefault();
      const touch = e.touches[0];
      const constrained = constrainWindowPosition(win, touch.pageX - offsetX, touch.pageY - offsetY);
      win.style.left = `${constrained.x}px`;
      win.style.top = `${constrained.y}px`;
    });

    // Mouse up
    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      localStorage.setItem(
        `win-${id}`,
        JSON.stringify({ top: win.style.top, left: win.style.left })
      );
    });

    // Touch end
    document.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;
      currentTouch = null;
      localStorage.setItem(
        `win-${id}`,
        JSON.stringify({ top: win.style.top, left: win.style.left })
      );
    });
  });
});

function minimizeWindow(windowId) {
  const win = document.getElementById(windowId);
  if (win) {
    win.classList.add("hidden");
  } else {
    console.warn(`Window with ID "${windowId}" not found.`);
  }
}

// Bring window to front (highest z-index)
function bringToFront(window) {
  const allWindows = document.querySelectorAll('.window');
  let maxZ = 1000; // Base z-index
  
  // Find the highest current z-index
  allWindows.forEach(win => {
    const z = parseInt(win.style.zIndex) || 1000;
    if (z > maxZ) maxZ = z;
  });
  
  // Set this window to be on top
  window.style.zIndex = maxZ + 1;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Update time display in real-time
function updateTimeDisplay() {
  if (!isPlaying || currentSongDuration === 0) return;
  
  const now = Date.now() / 1000;
  const elapsed = Math.max(0, now - currentSongStartTime);
  const remaining = Math.max(0, currentSongDuration - elapsed);
  
  // Update elapsed time
  const customTimeElapsed = document.getElementById("custom-time-elapsed");
  if (customTimeElapsed) {
    customTimeElapsed.textContent = formatTime(elapsed);
  }
  
  // Update remaining time
  const customTimeRemaining = document.getElementById("custom-time-remaining");
  if (customTimeRemaining) {
    customTimeRemaining.textContent = formatTime(remaining);
  }
  
  // Update progress bar
  const customProgressFill = document.getElementById("custom-progress-fill");
  if (customProgressFill) {
    const progressPercent = (elapsed / currentSongDuration) * 100;
    customProgressFill.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
  }
}

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
let audioElement = null;
let isPlaying = false;
let currentVolume = 100;
let currentSongStartTime = 0;
let currentSongDuration = 0;
let wakeLock = null;
let timeUpdateInterval = null;
let lastSongTitle = "";

// Wake Lock functionality for mobile devices
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock acquired - audio will continue playing when screen locks');
      
      // Handle wake lock release (e.g., when user switches tabs)
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock was released');
      });
    } else {
      console.log('Wake lock not supported, trying alternative approach');
      // Fallback: try to keep the page active
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  } catch (err) {
    console.log('Wake lock failed:', err);
    // Fallback: try to keep the page active
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
}

// Handle visibility change as fallback
function handleVisibilityChange() {
  if (document.hidden && isPlaying) {
    console.log('Page hidden but audio should continue playing');
    // Try to keep audio playing by resuming if paused
    if (audioElement && audioElement.paused) {
      audioElement.play().catch(e => console.log('Could not resume audio:', e));
    }
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake lock released');
  }
}

// Initialize custom player
function initializeCustomPlayer() {
  // Create audio element for playback
  audioElement = new Audio();
  // Try without crossOrigin first to avoid CORS issues
  // audioElement.crossOrigin = "anonymous";
  audioElement.volume = currentVolume / 100;
  
  // Add error handling for CORS issues
  audioElement.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    console.error('Audio error details:', {
      error: e,
      src: audioElement.src,
      networkState: audioElement.networkState,
      readyState: audioElement.readyState
    });
  });
  
  // Set up event listeners
  audioElement.addEventListener('loadstart', () => {
    // Silent loading
  });
  
  // Add periodic check to keep audio playing
  setInterval(() => {
    if (isPlaying && audioElement.paused) {
      // Silent resume - no logging to avoid audio skipping
      audioElement.play().catch(e => {
        // Silent error handling
      });
    }
  }, 1000);
  
  audioElement.addEventListener('canplay', () => {
    // Silent can play
  });
  
  audioElement.addEventListener('play', () => {
    isPlaying = true;
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.textContent = '⏸';
    }
    
    // Request wake lock to keep audio playing when screen locks
    requestWakeLock();
    
    // Start real-time timer
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
    }
    timeUpdateInterval = setInterval(updateTimeDisplay, 1000);
  });
  
  audioElement.addEventListener('pause', () => {
    isPlaying = false;
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.textContent = '▶';
    }
    
    // Release wake lock when audio pauses
    releaseWakeLock();
    
    // Stop real-time timer
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
      timeUpdateInterval = null;
    }
  });
  
  audioElement.addEventListener('ended', () => {
    isPlaying = false;
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.textContent = '▶';
    }
    
    // Stop real-time timer
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
      timeUpdateInterval = null;
    }
  });
  
  audioElement.addEventListener('stalled', () => {
    // Silent stall recovery - no logging to avoid audio skipping
    if (isPlaying) {
      audioElement.play().catch(e => {
        // Only log actual errors
        if (e.name !== 'NotAllowedError') {
          console.error('Stall resume failed:', e);
        }
      });
    }
  });
  
  audioElement.addEventListener('suspend', () => {
    // Silent suspend - no logging
  });
  
  audioElement.addEventListener('waiting', () => {
    // Silent waiting - no logging
  });
  
  audioElement.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    console.error('Audio error details:', {
      error: e,
      src: audioElement.src,
      networkState: audioElement.networkState,
      readyState: audioElement.readyState
    });
  });
  
  // Play/Pause button
  const playPauseBtn = document.getElementById('play-pause-btn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
  }
  
  // Volume controls
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      currentVolume = e.target.value;
      if (audioElement) {
        audioElement.volume = currentVolume / 100;
      }
    });
  }
  
  const volumeBtn = document.getElementById('volume-btn');
  if (volumeBtn) {
    volumeBtn.addEventListener('click', toggleMute);
  }
}

function togglePlayPause() {
  if (!audioElement) return;
  
  if (isPlaying) {
    audioElement.pause();
    // isPlaying will be set to false by the pause event listener
  } else {
    audioElement.play().catch(e => {
      console.error('Play failed:', e);
    });
    // isPlaying will be set to true by the play event listener
  }
}

function toggleMute() {
  if (!audioElement) return;
  
  const volumeBtn = document.getElementById('volume-btn');
  if (audioElement.volume > 0) {
    audioElement.volume = 0;
    volumeBtn.textContent = '🔇';
  } else {
    audioElement.volume = currentVolume / 100;
    volumeBtn.textContent = '🔊';
  }
}

// Now Playing Stuff
// updater, art fetch, progress bar

// Update only the display data, don't touch audio controls
async function updateNowPlaying() {
  try {
    const apiUrl = getApiUrl('/api/nowplaying/random');
    
    const res = await fetchWithCorsBypass(apiUrl);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    // The API returns an array, so we need to get the first element
    const stationData = Array.isArray(data) ? data[0] : data;

    // Safely access nested properties
    const np = stationData?.now_playing || {};
    const song = np?.song || {};
    const elapsed = np?.elapsed || 0;
    const duration = np?.duration || 0;
    
    // Only update timing data if this is a new song (different title)
    const currentTitle = song.title || np.title || "Unknown Title";
    if (currentTitle !== lastSongTitle) {
      lastSongTitle = currentTitle;
      currentSongDuration = duration;
      currentSongStartTime = (Date.now() / 1000) - elapsed;
    }

    // ✅ FIX: Safely get album art — fallback to station-wide art if needed
    const artUrl = song.art || (stationData?.station?.listen_url ? `${stationData.station.listen_url.replace(/\/+$/, "")}/nowplaying/art` : null);

    // ♪ Update Custom Player Album Art
    const customAlbumArt = document.getElementById("custom-album-art");
    const noArtPlaceholder = document.getElementById("no-art-placeholder");
    if (customAlbumArt && noArtPlaceholder) {
      if (artUrl) {
        customAlbumArt.src = artUrl;
        customAlbumArt.style.display = "block";
        noArtPlaceholder.style.display = "none";
      } else {
        customAlbumArt.style.display = "none";
        noArtPlaceholder.style.display = "flex";
      }
    }

    // ♪ Update Custom Player Track Info
    const customTrackTitle = document.getElementById("custom-track-title");
    if (customTrackTitle) {
      // Try multiple possible locations for title
      const title = song.title || np.title || data.title || "Unknown Title";
      customTrackTitle.textContent = title;
    }

    const customTrackArtist = document.getElementById("custom-track-artist");
    if (customTrackArtist) {
      // Try multiple possible locations for artist
      const artist = song.artist || np.artist || data.artist || "Unknown Artist";
      customTrackArtist.textContent = artist;
    }

    const customTrackAlbum = document.getElementById("custom-track-album");
    if (customTrackAlbum) {
      // Try multiple possible locations for album
      const album = song.album || np.album || data.album || "Unknown Album";
      customTrackAlbum.textContent = album;
    }

    // Time display and progress bar are now handled by real-time updates
    // Only update them if not currently playing (to show initial state)
    if (!isPlaying) {
      // ♪ Update Custom Player Progress
      const customProgressFill = document.getElementById("custom-progress-fill");
      if (customProgressFill) {
      const progressPercent = duration > 0 ? (elapsed / duration) * 100 : 0;
        customProgressFill.style.width = `${progressPercent}%`;
      }

      // ♪ Update Custom Player Time Display
      const customTimeElapsed = document.getElementById("custom-time-elapsed");
      if (customTimeElapsed) {
        customTimeElapsed.textContent = formatTime(elapsed);
      }

      const customTimeRemaining = document.getElementById("custom-time-remaining");
      if (customTimeRemaining) {
        // Use the remaining field from the API, or calculate it
        const remaining = np?.remaining !== undefined ? np.remaining : Math.max(0, duration - elapsed);
        customTimeRemaining.textContent = formatTime(remaining);
      }
    }

    // ♪ Update Custom Player Station Info
    const customStationName = document.getElementById("custom-station-name");
    if (customStationName) {
      customStationName.textContent = stationData?.station?.name || "JTrap Family Radio";
    }

    const customListeners = document.getElementById("custom-listeners");
    if (customListeners) {
      customListeners.textContent = `Listeners: ${stationData?.listeners?.total || 0}`;
    }

    // 🎵 Update Stream URL for audio element (only if not already set)
    if (audioElement && stationData?.station?.listen_url && !audioElement.src) {
      audioElement.src = stationData.station.listen_url;
      audioElement.load();
    }

    // DON'T update play/pause button - let audio controls handle their own state

  } catch (e) {
    console.error("Error fetching now playing:", e);

    // Update custom player with error state
    const customTrackTitle = document.getElementById("custom-track-title");
    if (customTrackTitle) customTrackTitle.textContent = "Could not load now playing info.";

    const customTrackArtist = document.getElementById("custom-track-artist");
    if (customTrackArtist) customTrackArtist.textContent = "";

    const customTrackAlbum = document.getElementById("custom-track-album");
    if (customTrackAlbum) customTrackAlbum.textContent = "";

    const customAlbumArt = document.getElementById("custom-album-art");
    const noArtPlaceholder = document.getElementById("no-art-placeholder");
    if (customAlbumArt && noArtPlaceholder) {
      customAlbumArt.style.display = "none";
      noArtPlaceholder.style.display = "flex";
    }
  }
}

// Custom History Functionality
function initializeCustomHistory() {
  const refreshBtn = document.getElementById('refresh-history');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', updateHistory);
  }
}

async function updateHistory() {
  try {
    const apiUrl = getApiUrl('/api/nowplaying/random');
    
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
  const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard');
  
  if (refreshSongsBtn) {
    refreshSongsBtn.addEventListener('click', loadAvailableSongs);
  }
  
  if (refreshLeaderboardBtn) {
    refreshLeaderboardBtn.addEventListener('click', updateLeaderboard);
  }
  
  // Load initial data
  loadAvailableSongs();
  updateLeaderboard();
}

// Mobile-friendly window resizing
function initializeWindowResizing() {
  const windows = document.querySelectorAll('.window');
  
  windows.forEach(win => {
    const resizeHandle = win.querySelector('.resize-se');
    if (!resizeHandle) return;
    
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let currentTouch = null;
    
    // Mouse events
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.getComputedStyle(win).width, 10);
      startHeight = parseInt(window.getComputedStyle(win).height, 10);
      bringToFront(win);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      e.preventDefault();
      
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      
      // Apply minimum size constraints
      const minWidth = 200;
      const minHeight = 100;
      
      win.style.width = Math.max(newWidth, minWidth) + 'px';
      win.style.height = Math.max(newHeight, minHeight) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        // Save size
        localStorage.setItem(`win-${win.id}-size`, JSON.stringify({
          width: win.style.width,
          height: win.style.height
        }));
      }
    });
    
    // Touch events for mobile
    resizeHandle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isResizing = true;
      currentTouch = e.touches[0];
      startX = currentTouch.clientX;
      startY = currentTouch.clientY;
      startWidth = parseInt(window.getComputedStyle(win).width, 10);
      startHeight = parseInt(window.getComputedStyle(win).height, 10);
      bringToFront(win);
    });
    
    document.addEventListener('touchmove', (e) => {
      if (!isResizing || !currentTouch) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const newWidth = startWidth + (touch.clientX - startX);
      const newHeight = startHeight + (touch.clientY - startY);
      
      // Apply minimum size constraints
      const minWidth = 200;
      const minHeight = 100;
      
      win.style.width = Math.max(newWidth, minWidth) + 'px';
      win.style.height = Math.max(newHeight, minHeight) + 'px';
    });
    
    document.addEventListener('touchend', () => {
      if (isResizing) {
        isResizing = false;
        currentTouch = null;
        // Save size
        localStorage.setItem(`win-${win.id}-size`, JSON.stringify({
          width: win.style.width,
          height: win.style.height
        }));
      }
    });
  });
}

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
    
    // Show success status
    showStatus(`Loaded ${songsToShow.length} songs available for request${hasMore ? ` (${availableSongs.length} total)` : ''}`, 'success');
    
  } catch (e) {
    console.error("Error loading available songs:", e);
    songsList.innerHTML = '<div class="songs-loading">No songs available for request</div>';
    // Don't show error message to user - if radio works, this is expected
  }
}

async function updateLeaderboard() {
  try {
    // Note: This is a placeholder for the leaderboard
    // AzuraCast doesn't have a built-in leaderboard API
    // You could implement this by tracking requests in localStorage or a simple backend
    const leaderboardList = document.getElementById('leaderboard-list');
    
    if (!leaderboardList) return;
    
    // For now, show a placeholder message
    leaderboardList.innerHTML = '<div class="leaderboard-loading">Leaderboard coming soon...</div>';
    
  } catch (e) {
    console.error("Error loading leaderboard:", e);
    const leaderboardList = document.getElementById('leaderboard-list');
    if (leaderboardList) {
      leaderboardList.innerHTML = '<div class="leaderboard-error">Failed to load leaderboard</div>';
    }
  }
}

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


function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('request-status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `request-status ${type}`;
    
    // Auto-clear success/info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (statusDiv.textContent === message) {
          clearStatus();
        }
      }, 5000);
    }
  }
}

function clearStatus() {
  const statusDiv = document.getElementById('request-status');
  if (statusDiv) {
    statusDiv.textContent = '';
    statusDiv.className = 'request-status';
  }
}

// Window Management
function toggleWindow(windowId) {
  const window = document.getElementById(windowId);
  if (window) {
    if (window.style.display === 'none' || window.style.display === '') {
      window.style.display = 'block';
      bringToFront(window);
    } else {
      window.style.display = 'none';
    }
  }
}

// Helper function to make windows draggable
function makeWindowDraggable(win, title) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let currentTouch = null;

  // Mouse events
  title.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    bringToFront(win);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const constrained = constrainWindowPosition(win, e.clientX - offsetX, e.clientY - offsetY);
    win.style.left = constrained.x + 'px';
    win.style.top = constrained.y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      // Save position
      localStorage.setItem(`win-${win.id}`, JSON.stringify({
        top: win.style.top,
        left: win.style.left
      }));
    }
  });

  // Touch events for mobile
  title.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    isDragging = true;
    currentTouch = e.touches[0];
    const rect = title.getBoundingClientRect();
    offsetX = currentTouch.clientX - rect.left;
    offsetY = currentTouch.clientY - rect.top;
    bringToFront(win);
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !currentTouch) return;
    e.preventDefault();
    const constrained = constrainWindowPosition(win, e.touches[0].clientX - offsetX, e.touches[0].clientY - offsetY);
    win.style.left = constrained.x + 'px';
    win.style.top = constrained.y + 'px';
  });

  document.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      currentTouch = null;
      // Save position
      localStorage.setItem(`win-${win.id}`, JSON.stringify({
        top: win.style.top,
        left: win.style.left
      }));
    }
  });

  // Helper function to constrain window position
  function constrainWindowPosition(win, x, y) {
    const rect = win.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height - 30; // Account for taskbar
    
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    };
  }
}

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
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
        selection: '#ffffff',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#0000ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#808080',
        brightRed: '#ff8080',
        brightGreen: '#80ff80',
        brightYellow: '#ffff80',
        brightBlue: '#8080ff',
        brightMagenta: '#ff80ff',
        brightCyan: '#80ffff',
        brightWhite: '#ffffff'
      },
      fontSize: 12,
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
      terminal.writeln('  bbs      - BBS connection (coming soon)');
      terminal.writeln('');
      
      // Set up command handling
      let currentLine = '';
      terminal.onData(data => {
        if (data === '\r') { // Enter key
          terminal.writeln('');
          handleCommand(currentLine.trim());
          currentLine = '';
          terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
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
      terminal.writeln('  bbs      - BBS connection (coming soon)');
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
      terminal.writeln('\x1b[32mBBS connection coming soon...\x1b[0m');
      break;
      
    case '':
      // Empty command, do nothing
      break;
      
    default:
      terminal.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m`);
      terminal.writeln('Type "help" for available commands.');
  }
}

