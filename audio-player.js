// Audio Player - Handles audio playback and now playing display
// Based on the original working script_old.js

// Global variables for audio player
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

// Format time helper
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Update song display info (title, artist, album, art)
function updateSongDisplay(song, np, stationData) {
  // ♪ Update Custom Player Track Info
  const customTrackTitle = document.getElementById("custom-track-title");
  if (customTrackTitle) {
    // Try multiple possible locations for title
    const title = song.title || np.title || "Unknown Title";
    customTrackTitle.textContent = title;
  }

  const customTrackArtist = document.getElementById("custom-track-artist");
  if (customTrackArtist) {
    // Try multiple possible locations for artist
    const artist = song.artist || np.artist || "Unknown Artist";
    customTrackArtist.textContent = artist;
  }

  const customTrackAlbum = document.getElementById("custom-track-album");
  if (customTrackAlbum) {
    // Try multiple possible locations for album
    const album = song.album || np.album || "Unknown Album";
    customTrackAlbum.textContent = album;
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

  // ♪ Update Custom Player Station Info
  const customStationName = document.getElementById("custom-station-name");
  if (customStationName) {
    customStationName.textContent = stationData?.station?.name || "JTrap Family Radio";
  }

  const customListeners = document.getElementById("custom-listeners");
  if (customListeners) {
    customListeners.textContent = `Listeners: ${stationData?.listeners?.total || 0}`;
  }
}

// Update time display in real-time
function updateTimeDisplay() {
  if (currentSongDuration === 0) return;
  
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

// Initialize custom player
function initializeCustomPlayer() {
  // Clean up any existing audio element
  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
    audioElement = null;
  }
  
  // Create audio element for playback
  audioElement = new Audio();
  audioElement.volume = currentVolume / 100;
  
  console.log('🎵 Audio element created:', audioElement);
  
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
      console.log('🎵 Resuming paused audio');
      audioElement.play().catch(e => {
        console.log('🎵 Resume failed:', e.name);
      });
    }
  }, 1000);
  
  audioElement.addEventListener('canplay', () => {
    // Silent can play
  });
  
  audioElement.addEventListener('play', () => {
    console.log('🎵 Audio play event triggered');
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
    console.log('🎵 Audio pause event triggered');
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

// Update only the display data, don't touch audio controls
async function updateNowPlaying() {
  try {
    const apiUrl = window.getApiUrl('/api/nowplaying/1');
    
    const res = await window.fetchWithCorsBypass(apiUrl);
    
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
      console.log('🎵 New song detected:', currentTitle);
      lastSongTitle = currentTitle;
      currentSongDuration = duration;
      currentSongStartTime = (Date.now() / 1000) - elapsed;
      
      // Immediately update ALL display info for new song
      updateSongDisplay(song, np, stationData);
      updateTimeDisplay();
    }

    // Update display info (only if not a new song - new songs are handled above)
    if (currentTitle === lastSongTitle) {
      updateSongDisplay(song, np, stationData);
    }

    // 🎵 Update Stream URL for audio element
    if (audioElement && stationData?.station?.listen_url) {
      const newStreamUrl = stationData.station.listen_url;
      if (audioElement.src !== newStreamUrl) {
        console.log('🎵 Setting new stream URL:', newStreamUrl);
        audioElement.src = newStreamUrl;
        audioElement.load();
      }
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

// Debug function to check audio state
function debugAudioState() {
  console.log('🎵 Audio Debug Info:');
  console.log('  - audioElement:', audioElement);
  console.log('  - isPlaying:', isPlaying);
  console.log('  - currentVolume:', currentVolume);
  console.log('  - audioElement.src:', audioElement?.src);
  console.log('  - audioElement.paused:', audioElement?.paused);
  console.log('  - audioElement.volume:', audioElement?.volume);
  console.log('  - audioElement.currentTime:', audioElement?.currentTime);
  console.log('  - audioElement.duration:', audioElement?.duration);
  console.log('  - timeUpdateInterval:', timeUpdateInterval);
  
  // Check for multiple audio elements
  const allAudioElements = document.querySelectorAll('audio');
  console.log('  - Total audio elements on page:', allAudioElements.length);
  allAudioElements.forEach((audio, index) => {
    console.log(`    Audio ${index}:`, {
      src: audio.src,
      paused: audio.paused,
      volume: audio.volume,
      currentTime: audio.currentTime
    });
  });
}

// Export functions to global scope
window.AudioPlayer = {
  initializeCustomPlayer,
  updateNowPlaying,
  togglePlayPause,
  toggleMute,
  updateTimeDisplay,
  debugAudioState
};