// History - Handles song history functionality
// Based on the original working script_old.js

// Update history
async function updateHistory() {
  try {
    const apiUrl = window.getApiUrl('/api/nowplaying/1');
    
    const res = await window.fetchWithCorsBypass(apiUrl);
    
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

// Export functions to global scope
window.History = {
  updateHistory
};
