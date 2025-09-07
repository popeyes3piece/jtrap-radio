// Media Player - Handles video/media playback functionality
// Based on the original working script_old.js

let currentMediaIndex = 0;
let mediaFiles = [];

// Initialize media player
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
  const minimizeBtn = document.getElementById('minimize-media-player');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      const mediaWindow = document.getElementById('media-player-window');
      if (mediaWindow) {
        mediaWindow.classList.add('hidden');
      }
    });
  }
}

// Load available media files
function loadMediaFiles() {
  // In a real implementation, this would fetch from an API
  // For now, we'll use the media files in the media/ directory
  mediaFiles = [
    { name: 'Sample Video 1', url: 'media/sample1.webm' },
    { name: 'Sample Video 2', url: 'media/sample2.webm' },
    { name: 'Sample Video 3', url: 'media/sample3.webm' }
  ];
  
  if (mediaFiles.length > 0) {
    loadCurrentVideo();
  }
}

// Load the current video
function loadCurrentVideo() {
  const mediaDisplay = document.getElementById('media-display');
  const videoName = document.getElementById('current-video-name');
  
  if (!mediaDisplay || !videoName || mediaFiles.length === 0) return;
  
  const currentMedia = mediaFiles[currentMediaIndex];
  mediaDisplay.src = currentMedia.url;
  videoName.textContent = currentMedia.name;
  
  // Update button states
  updateButtonStates();
}

// Go to previous video
function previousVideo() {
  if (mediaFiles.length === 0) return;
  
  currentMediaIndex = (currentMediaIndex - 1 + mediaFiles.length) % mediaFiles.length;
  loadCurrentVideo();
}

// Go to next video
function nextVideo() {
  if (mediaFiles.length === 0) return;
  
  currentMediaIndex = (currentMediaIndex + 1) % mediaFiles.length;
  loadCurrentVideo();
}

// Update button states
function updateButtonStates() {
  const prevBtn = document.getElementById('prev-video-btn');
  const nextBtn = document.getElementById('next-video-btn');
  
  if (prevBtn) {
    prevBtn.disabled = mediaFiles.length <= 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = mediaFiles.length <= 1;
  }
}

// Export functions to global scope
window.MediaPlayer = {
  initializeMediaPlayer,
  loadMediaFiles,
  previousVideo,
  nextVideo,
  loadCurrentVideo
};