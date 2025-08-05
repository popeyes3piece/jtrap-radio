document.addEventListener("DOMContentLoaded", () => {
  const windows = document.querySelectorAll(".window");
  const taskbar = document.getElementById("taskbar");

  windows.forEach((win) => {
    const title = win.querySelector(".title-bar");
    const id = win.id;

    // Restore position from localStorage
    const saved = localStorage.getItem(`win-${id}`);
    if (saved) {
      const { top, left } = JSON.parse(saved);
      win.style.top = top;
      win.style.left = left;
    }

    // Add taskbar button
    const btn = document.createElement("button");
    btn.textContent = title.querySelector(".title-bar-text").textContent;
    btn.addEventListener("click", () => {
      if (win.classList.contains("hidden")) {
        win.classList.remove("hidden");
      } else {
        win.classList.add("hidden");
      }
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
function updateNowPlaying() {
  fetch('http://localhost:80/api/nowplaying/jtrap_radio') // Replace with your public AzuraCast URL if needed
    .then(response => response.json())
    .then(data => {
      const np = data.now_playing.song;
      const container = document.getElementById('now-playing-container');
      container.innerHTML = `
        <b>${np.title}</b><br>
        <i>${np.artist}</i>
      `;
    })
    .catch(err => {
      console.error('Error fetching now playing:', err);
      document.getElementById('now-playing-container').innerText = 'Could not load now playing info.';
    });
}

// Call every 15 seconds
setInterval(updateNowPlaying, 15000);
window.addEventListener('DOMContentLoaded', updateNowPlaying);

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      // Save position
      localStorage.setItem(`win-${id}`,
        JSON.stringify({ top: win.style.top, left: win.style.left })
      );
    });
  });
});

