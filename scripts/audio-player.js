/**
 * Audio Player Module
 * Handles all audio playback functionality including play/pause, volume, and wake lock
 */

const AudioPlayer = {
  // Audio state
  audioElement: null,
  isPlaying: false,
  currentVolume: 100,
  wakeLock: null,

  // Initialize the audio player
  initialize() {
    this.createAudioElement();
    this.setupEventListeners();
    this.setupControls();
  },

  // Create and configure the audio element
  createAudioElement() {
    this.audioElement = new Audio();
    this.audioElement.volume = this.currentVolume / 100;
    
    // Set the radio stream URL
    this.audioElement.src = "https://radio.jtrap.live/radio/8000/radio.mp3";
    
    // Add error handling for CORS issues
    this.audioElement.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Audio error details:', {
        error: e,
        src: this.audioElement.src,
        networkState: this.audioElement.networkState,
        readyState: this.audioElement.readyState
      });
    });
  },

  // Set up audio event listeners
  setupEventListeners() {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('loadstart', () => {
      // Silent loading
    });
    
    this.audioElement.addEventListener('canplay', () => {
      // Silent can play
    });
    
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayPauseButton();
      this.requestWakeLock();
    });
    
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayPauseButton();
      this.releaseWakeLock();
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updatePlayPauseButton();
    });
    
    this.audioElement.addEventListener('stalled', () => {
      // Silent stall recovery - no logging to avoid audio skipping
      if (this.isPlaying) {
        this.audioElement.play().catch(e => {
          // Only log actual errors
          if (e.name !== 'NotAllowedError') {
            console.error('Stall resume failed:', e);
          }
        });
      }
    });
    
    this.audioElement.addEventListener('suspend', () => {
      // Silent suspend - no logging
    });
    
    this.audioElement.addEventListener('waiting', () => {
      // Silent waiting - no logging
    });

    // Add periodic check to keep audio playing
    setInterval(() => {
      if (this.isPlaying && this.audioElement.paused) {
        // Silent resume - no logging to avoid audio skipping
        this.audioElement.play().catch(e => {
          // Silent error handling
        });
      }
    }, 1000);
  },

  // Set up control event listeners
  setupControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePlayPause());
      // Add touch support for mobile
      playPauseBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.togglePlayPause();
      });
    }
    
    // Volume controls
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        this.currentVolume = e.target.value;
        if (this.audioElement) {
          this.audioElement.volume = this.currentVolume / 100;
        }
      });
    }
    
    const volumeBtn = document.getElementById('volume-btn');
    if (volumeBtn) {
      volumeBtn.addEventListener('click', () => this.toggleMute());
      // Add touch support for mobile
      volumeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.toggleMute();
      });
    }
  },

  // Update the play/pause button text
  updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';
    }
  },

  // Toggle play/pause
  togglePlayPause() {
    if (!this.audioElement) return;
    
    if (this.isPlaying) {
      this.audioElement.pause();
      // isPlaying will be set to false by the pause event listener
    } else {
      this.audioElement.play().catch(e => {
        console.error('Play failed:', e);
      });
      // isPlaying will be set to true by the play event listener
    }
  },

  // Toggle mute
  toggleMute() {
    if (!this.audioElement) return;
    
    const volumeBtn = document.getElementById('volume-btn');
    if (this.audioElement.volume > 0) {
      this.audioElement.volume = 0;
      if (volumeBtn) volumeBtn.textContent = '🔇';
    } else {
      this.audioElement.volume = this.currentVolume / 100;
      if (volumeBtn) volumeBtn.textContent = '🔊';
    }
  },

  // Request wake lock to keep audio playing when screen locks
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired - audio will continue playing when screen locks');
        
        // Handle wake lock release (e.g., when user switches tabs)
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake lock was released');
        });
      } else {
        console.log('Wake lock not supported, trying alternative approach');
        // Fallback: try to keep the page active
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
      }
    } catch (err) {
      console.log('Wake lock failed:', err);
      // Fallback: try to keep the page active
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
  },

  // Handle visibility change as fallback
  handleVisibilityChange() {
    if (document.hidden && this.isPlaying) {
      console.log('Page hidden but audio should continue playing');
      // Try to keep audio playing by resuming if paused
      if (this.audioElement && this.audioElement.paused) {
        this.audioElement.play().catch(e => console.log('Could not resume audio:', e));
      }
    }
  },

  // Release wake lock
  async releaseWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Wake lock released');
    }
  },

  // Get current playing state
  getPlayingState() {
    return this.isPlaying;
  },

  // Get current volume
  getVolume() {
    return this.currentVolume;
  },

  // Set volume programmatically
  setVolume(volume) {
    this.currentVolume = Math.max(0, Math.min(100, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.currentVolume / 100;
    }
  },

  // Now Playing Data Management
  nowPlayingSSE: null,
  nowPlayingData: null,

  // Initialize Now Playing data loading
  initializeNowPlaying() {
    this.initializeNowPlayingSSE();
    this.loadNowPlayingData();
    
    // Set up regular updates for now playing data (every 30 seconds to reduce load)
    setInterval(() => this.loadNowPlayingData(), 30000);
    
    // Set up real-time progress bar updates (every 1 second, only when playing)
    setInterval(() => this.updateProgressBar(), 1000);
  },

  // Initialize Server-Sent Events for real-time Now Playing data
  initializeNowPlayingSSE() {
    const sseBaseUri = "https://radio.jtrap.live/api/live/nowplaying/sse";
    const sseUriParams = new URLSearchParams({
      'station': 'jtrap_radio'
    });
    const sseUri = `${sseBaseUri}?${sseUriParams}`;
    
    this.nowPlayingSSE = new EventSource(sseUri);
    
    this.nowPlayingSSE.onopen = function(e) {
      // SSE connected
    };
    
    this.nowPlayingSSE.onmessage = function(e) {
      try {
        const data = JSON.parse(e.data);
        AudioPlayer.handleNowPlayingData({ data: data });
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    this.nowPlayingSSE.onerror = function(e) {
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (AudioPlayer.nowPlayingSSE.readyState === EventSource.CLOSED) {
          AudioPlayer.initializeNowPlayingSSE();
        }
      }, 5000);
    };
  },

  // Handle Now Playing data from SSE
  handleNowPlayingData(ssePayload, useTime = true) {
    const jsonData = ssePayload.data;
    
    if (jsonData && jsonData.now_playing) {
      this.nowPlayingData = jsonData;
      this.updateNowPlayingDisplay();
    }
  },

  // Update the Now Playing display
  updateNowPlayingDisplay() {
    if (!this.nowPlayingData) return;
    
    const song = this.nowPlayingData.now_playing?.song || {};
    const station = this.nowPlayingData.station || {};
    const listeners = this.nowPlayingData.listeners || {};
    
    // Update song title
    const songTitleEl = document.getElementById('custom-track-title');
    if (songTitleEl) {
      songTitleEl.textContent = song.title || 'Unknown Title';
      this.addSmartScrolling(songTitleEl);
    }
    
    // Update song artist
    const songArtistEl = document.getElementById('custom-track-artist');
    if (songArtistEl) {
      songArtistEl.textContent = song.artist || 'Unknown Artist';
      this.addSmartScrolling(songArtistEl);
    }
    
    // Update song album
    const songAlbumEl = document.getElementById('custom-track-album');
    if (songAlbumEl) {
      songAlbumEl.textContent = song.album || 'Unknown Album';
      this.addSmartScrolling(songAlbumEl);
    }
    
    // Update window title with station name
    const windowTitleEl = document.querySelector('#playerWindow .title-bar-text');
    if (windowTitleEl) {
      const stationName = station.name || 'JTrap Radio';
      windowTitleEl.textContent = `Player - ${stationName}`;
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
    const nowPlaying = this.nowPlayingData.now_playing || {};
    const elapsed = nowPlaying.elapsed || 0;
    const duration = nowPlaying.duration || 0;
    
    // Only update progress bar when audio is actually playing
    if (this.isPlaying && duration > 0) {
      // Update elapsed time
      const elapsedEl = document.getElementById('custom-time-elapsed');
      if (elapsedEl) {
        elapsedEl.textContent = this.formatTime(elapsed);
      }
      
      // Update remaining time
      const remainingEl = document.getElementById('custom-time-remaining');
      if (remainingEl) {
        const remaining = Math.max(0, duration - elapsed);
        remainingEl.textContent = this.formatTime(remaining);
      }
      
      // Update progress bar
      const progressBar = document.getElementById('custom-progress-bar');
      if (progressBar) {
        const progressPercent = (elapsed / duration) * 100;
        progressBar.value = Math.min(100, Math.max(0, progressPercent));
      }
    } else {
      // Reset progress bar when not playing
      const progressBar = document.getElementById('custom-progress-bar');
      if (progressBar) {
        progressBar.value = 0;
      }
    }
  },

  // Update progress bar in real-time
  updateProgressBar() {
    if (!this.isPlaying || !this.nowPlayingData) return;
    
    const nowPlaying = this.nowPlayingData.now_playing || {};
    const playedAt = nowPlaying.played_at || 0;
    const duration = nowPlaying.duration || 0;
    
    if (playedAt && duration > 0) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - playedAt;
      
      if (elapsed >= 0 && elapsed <= duration) {
        // Update elapsed time
        const elapsedEl = document.getElementById('custom-time-elapsed');
        if (elapsedEl) {
          elapsedEl.textContent = this.formatTime(elapsed);
        }
        
        // Update remaining time
        const remainingEl = document.getElementById('custom-time-remaining');
        if (remainingEl) {
          const remaining = Math.max(0, duration - elapsed);
          remainingEl.textContent = this.formatTime(remaining);
        }
        
        // Update progress bar
        const progressBar = document.getElementById('custom-progress-bar');
        if (progressBar) {
          const progressPercent = (elapsed / duration) * 100;
          progressBar.value = Math.min(100, Math.max(0, progressPercent));
        }
      }
    }
  },

  // Load Now Playing data from API (fallback)
  async loadNowPlayingData() {
    try {
      const apiUrl = this.getApiUrl('/api/nowplaying/jtrap_radio');
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
        this.nowPlayingData = stationData;
        this.updateNowPlayingDisplay();
      }
    } catch (error) {
      console.error('Error loading now playing data:', error);
    }
  },

  // Get API URL
  getApiUrl(endpoint) {
    // Use live AzuraCast server for production
    return `https://radio.jtrap.live${endpoint}`;
  },

  // Format time helper
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  },

  // Close SSE connection
  closeNowPlayingSSE() {
    if (this.nowPlayingSSE) {
      this.nowPlayingSSE.close();
      this.nowPlayingSSE = null;
    }
  },

  // Add smart scrolling to text elements that overflow
  addSmartScrolling(element) {
    // Remove any existing animation
    element.style.animation = 'none';
    element.style.transform = 'translateX(0)';
    
    // Check if text overflows after a short delay to ensure DOM is updated
    setTimeout(() => {
      const isOverflowing = element.scrollWidth > element.clientWidth;
      
      if (isOverflowing) {
        // Add scrolling animation only if text overflows
        element.style.animation = 'scroll-text 6s linear infinite';
        element.style.textOverflow = 'unset';
      } else {
        // Use ellipsis if text fits
        element.style.animation = 'none';
        element.style.textOverflow = 'ellipsis';
        element.style.transform = 'translateX(0)';
      }
    }, 100);
  }
};

// Initialize audio player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  AudioPlayer.initialize();
  AudioPlayer.initializeNowPlaying();
});