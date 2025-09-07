// Media Player - Handles video/media playback functionality
// Based on the original working script_old.js

let currentMediaIndex = 0;
let mediaFiles = [];
let shuffledPlaylist = [];
let playedVideos = [];

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
  
  // Add shuffle button functionality
  const shuffleBtn = document.getElementById('shuffle-videos-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      shuffleMediaFiles();
      currentMediaIndex = 0;
      loadCurrentVideo();
    });
  }
}

// Load available media files
function loadMediaFiles() {
  // Use actual videos from the media/ directory
  mediaFiles = [
    { name: 'Bassackwards', url: 'media/bassackwards.webm' },
    { name: 'Cool Russian Song', url: 'media/Cool_Rus_song.webm' },
    { name: 'Ear Man', url: 'media/Ear Man.webm' },
    { name: 'Jumpscare', url: 'media/Jumpscare.webm' },
    { name: 'Keanu Wants Pizza', url: 'media/Keanu Wants Pizza.webm' },
    { name: 'Sometimes', url: 'media/Sometimes.webm' },
    { name: 'Trump Works At Home Depot', url: 'media/Trump Works At Home Depot.webm' },
    { name: 'Video 1657894439242', url: 'media/1657894439242.webm' },
    { name: 'Video 1667603304819993', url: 'media/1667603304819993.webm' },
    { name: 'Video 1669413907811558', url: 'media/1669413907811558.webm' },
    { name: 'Video 1669754222493390', url: 'media/1669754222493390.webm' },
    { name: 'Video 1670533486936134', url: 'media/1670533486936134.webm' },
    { name: 'Video 1670652996372991', url: 'media/1670652996372991.webm' },
    { name: 'Video 1671115846812711', url: 'media/1671115846812711.webm' },
    { name: 'Video 1671284361682843', url: 'media/1671284361682843.webm' },
    { name: 'Video 1671968314151320', url: 'media/1671968314151320.webm' },
    { name: 'Video 1672200709639097', url: 'media/1672200709639097.webm' },
    { name: 'Video 1672298305050075', url: 'media/1672298305050075.webm' },
    { name: 'Video 1677606720568062', url: 'media/1677606720568062.webm' },
    { name: 'Video 1687215412211774', url: 'media/1687215412211774.webm' },
    { name: 'Video 1689744919165944', url: 'media/1689744919165944.webm' },
    { name: 'Video 1712683220935964', url: 'media/1712683220935964.webm' },
    { name: 'Video 1730373456378377', url: 'media/1730373456378377.webm' },
    { name: 'Video 1733349554834284', url: 'media/1733349554834284.webm' },
    { name: 'Video 1742026593117869', url: 'media/1742026593117869.webm' },
    { name: 'Video 1743568021915515', url: 'media/1743568021915515.mp4' },
    { name: 'Video 1745772417099947', url: 'media/1745772417099947.webm' },
    { name: 'Video 1747196732397943', url: 'media/1747196732397943.webm' },
    { name: 'Video 1747208500093058', url: 'media/1747208500093058.webm' },
    { name: 'Video 1748721344522817', url: 'media/1748721344522817.webm' },
    { name: 'Video 1751039720101799', url: 'media/1751039720101799 (1).webm' },
    { name: 'Video 1756889407556518', url: 'media/1756889407556518.webm' },
    { name: 'Video 1757014385000743', url: 'media/1757014385000743.webm' },
    { name: 'Video 1757071272206056', url: 'media/1757071272206056.webm' },
    { name: 'Video 1757128034444584', url: 'media/1757128034444584.webm' }
  ];
  
  // Shuffle the media files for random playback
  shuffleMediaFiles();
  
  if (mediaFiles.length > 0) {
    currentMediaIndex = 0;
    loadCurrentVideo();
  }
}

// Shuffle media files for random playback
function shuffleMediaFiles() {
  // Create a new shuffled playlist
  shuffledPlaylist = [...mediaFiles];
  for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
  }
  // Reset the played videos list
  playedVideos = [];
  currentMediaIndex = 0;
}

// Load the current video
function loadCurrentVideo() {
  const videoPlayer = document.getElementById('video-player');
  const videoName = document.getElementById('current-video-name');
  
  if (!videoPlayer || !videoName || shuffledPlaylist.length === 0) return;
  
  const currentMedia = shuffledPlaylist[currentMediaIndex];
  videoPlayer.src = currentMedia.url;
  videoName.textContent = currentMedia.name;
  
  // Track this video as played
  if (!playedVideos.includes(currentMediaIndex)) {
    playedVideos.push(currentMediaIndex);
  }
  
  // Resize window to video aspect ratio when video loads
  videoPlayer.addEventListener('loadedmetadata', resizeWindowToVideo);
  
  // Update button states
  updateButtonStates();
}

// Resize window to match video aspect ratio
function resizeWindowToVideo() {
  const videoPlayer = document.getElementById('video-player');
  const mediaWindow = document.getElementById('media-player-window');
  
  if (!videoPlayer || !mediaWindow) return;
  
  const videoWidth = videoPlayer.videoWidth;
  const videoHeight = videoPlayer.videoHeight;
  
  if (videoWidth && videoHeight) {
    const aspectRatio = videoWidth / videoHeight;
    const titleBarHeight = 28; // Height of title bar
    const controlsHeight = 40; // Height of video controls
    const padding = 20; // Extra padding
    
    // Calculate new dimensions
    const maxWidth = 800; // Maximum window width
    const maxHeight = 600; // Maximum window height
    
    let newWidth = Math.min(maxWidth, videoWidth + padding);
    let newHeight = Math.min(maxHeight, videoHeight + titleBarHeight + controlsHeight + padding);
    
    // Adjust if we hit max constraints
    if (newWidth === maxWidth) {
      newHeight = Math.min(maxHeight, (newWidth - padding) / aspectRatio + titleBarHeight + controlsHeight + padding);
    } else if (newHeight === maxHeight) {
      newWidth = Math.min(maxWidth, (newHeight - titleBarHeight - controlsHeight - padding) * aspectRatio + padding);
    }
    
    // Apply new dimensions
    mediaWindow.style.width = `${newWidth}px`;
    mediaWindow.style.height = `${newHeight}px`;
  }
}

// Go to previous video
function previousVideo() {
  if (shuffledPlaylist.length === 0) return;
  
  currentMediaIndex = (currentMediaIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
  loadCurrentVideo();
}

// Go to next video
function nextVideo() {
  if (shuffledPlaylist.length === 0) return;
  
  // Move to next video in the shuffled playlist
  currentMediaIndex = (currentMediaIndex + 1) % shuffledPlaylist.length;
  
  // If we've played all videos, create a new shuffle
  if (playedVideos.length >= shuffledPlaylist.length) {
    shuffleMediaFiles();
  }
  
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