document.addEventListener('DOMContentLoaded', () => {
  // Only run this once DOM is ready
  updateNowPlaying();
  setInterval(updateNowPlaying, 5000);

  const windows = document.querySelectorAll(".window");
  const taskbar = document.getElementById("taskbar");

  windows.forEach((win, i) => {
    const title = win.querySelector(".title-bar");
    const id = win.id;

    // Restore position from localStorage
    const saved = localStorage.getItem(`win-${id}`);
    if (saved) {
      const { top, left } = JSON.parse(saved);
      win.style.top = top;
      win.style.left = left;
    }

    document.getElementById("reset-windows").addEventListener("click", () => {
      document.querySelectorAll(".window").forEach((win, i) => {
        const offset = i * 30;
        win.style.top = `${60 + offset}px`;
        win.style.left = `${60 + offset}px`;
        win.style.width = "300px";
        win.style.height = "200px";
      });
    });

    // Add taskbar button
    const btn = document.createElement("button");
    btn.textContent = title.querySelector(".title-bar-text").textContent;
    btn.addEventListener("click", () => {
      win.classList.toggle("hidden");
    });
    taskbar.appendChild(btn);

    // Drag functionality
    let isDragging = false;
    let offsetX, offsetY;

    title.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      win.style.zIndex = 999;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      win.style.left = `${e.pageX - offsetX}px`;
      win.style.top = `${e.pageY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
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

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
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

// Now Playing Stuff
// updater, art fetch, progress bar

async function updateNowPlaying() {
  try {
    const res = await fetch("http://localhost:80/api/nowplaying/jtrap_radio");
    const data = await res.json();

    const np = data.now_playing;
    const song = np.song || {};
    const elapsed = np.elapsed || 0;
    const duration = np.duration || 0;

    // ✅ FIX: Safely get album art — fallback to station-wide art if needed
    const artUrl = song.art || `${data.station.listen_url.replace(/\/+$/, "")}/nowplaying/art`;

    // ✅ FIX: More reliable playback state check
    const isPlaying = np.playing === true;
    const state = isPlaying ? "▶ Playing" : "⏸ Paused";

    // 🎵 Update Album Art
    const albumArt = document.getElementById("album-art");
    if (albumArt) {
      albumArt.src = artUrl;
      albumArt.style.display = "block";
    }

    // 🎵 Update Marquee Text
    const marqueeText = document.getElementById("marquee-text");
    if (marqueeText) {
      marqueeText.textContent = `${song.title || "Unknown Title"} — ${song.artist || "Unknown Artist"}`;
      startMarquee(marqueeText);
    }

    // 🎵 Update Playback State
    const playbackState = document.getElementById("playback-state");
    if (playbackState) {
      playbackState.textContent = state;
    }

    // 🎵 Update Time Elapsed
    const timeElapsed = document.getElementById("time-elapsed");
    if (timeElapsed) {
      timeElapsed.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
    }

    // 🎵 Update Progress Bar
    const progressFill = document.getElementById("progress-fill");
    if (progressFill) {
      const progressPercent = duration > 0 ? (elapsed / duration) * 100 : 0;
      progressFill.style.width = `${progressPercent}%`;
    }

  } catch (e) {
    console.error("Error fetching now playing:", e);

    const marqueeText = document.getElementById("marquee-text");
    if (marqueeText) marqueeText.textContent = "Could not load now playing info.";

    const playbackState = document.getElementById("playback-state");
    if (playbackState) playbackState.textContent = "";

    const timeElapsed = document.getElementById("time-elapsed");
    if (timeElapsed) timeElapsed.textContent = "";

    const albumArt = document.getElementById("album-art");
    if (albumArt) albumArt.style.display = "none";
  }
}

