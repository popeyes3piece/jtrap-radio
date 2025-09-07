// Window Manager - Handles window dragging, resizing, and taskbar management
// Based on the original working script_old.js

let zIndex = 1000;

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

function minimizeWindow(windowId) {
  console.log('minimizeWindow called for:', windowId);
  const win = document.getElementById(windowId);
  if (win) {
    console.log('Window found, hiding window');
    // Use both methods to ensure it works
    win.style.display = 'none';
    win.classList.add("hidden");
  } else {
    console.warn(`Window with ID "${windowId}" not found.`);
  }
}

function toggleWindow(windowId) {
  console.log('toggleWindow called for:', windowId);
  const window = document.getElementById(windowId);
  console.log('Window element found:', window);
  if (window) {
    if (window.style.display === 'none' || window.style.display === '') {
      console.log('Showing window:', windowId);
      window.style.display = 'block';
      bringToFront(window);
      
    } else {
      console.log('Hiding window:', windowId);
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

// Initialize window resizing
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

// Main window initialization function
function initializeWindows() {
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

    // Handle media player window specially (no auto taskbar button, but add dragging)
    if (id === 'media-player-window') {
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

    // Add taskbar button
    const btn = document.createElement("button");
    btn.className = "taskbar-btn";
    btn.textContent = title.querySelector(".title-bar-text").textContent;
    btn.addEventListener("click", () => {
      // Handle both hidden class and display style
      if (win.classList.contains("hidden") || win.style.display === "none") {
        win.classList.remove("hidden");
        win.style.display = "block";
        bringToFront(win);
        
      } else {
        win.classList.add("hidden");
        win.style.display = "none";
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

  // Set up reset windows button
  const resetBtn = document.getElementById("reset-windows");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
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
  }

  // Initialize window resizing
  initializeWindowResizing();
}

// Export functions to global scope
window.WindowManager = {
  initializeWindows,
  bringToFront,
  minimizeWindow,
  toggleWindow,
  makeWindowDraggable,
  initializeWindowResizing
};

// Make functions globally available for backward compatibility
window.bringToFront = bringToFront;
window.minimizeWindow = minimizeWindow;
window.toggleWindow = toggleWindow;
window.makeWindowDraggable = makeWindowDraggable;