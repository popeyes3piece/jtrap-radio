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
  }
};

// Initialize audio player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  AudioPlayer.initialize();
});