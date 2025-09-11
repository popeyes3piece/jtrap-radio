/**
 * Window Manager Module
 * Handles all window operations: dragging, resizing, minimizing, toggling
 */

const WindowManager = {
  // Initialize all windows with dragging and positioning
  initializeWindows() {
    const windows = document.querySelectorAll(".window");
    const taskbar = document.getElementById("taskbar");
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

    // Add mobile class to body for CSS targeting
    if (isMobile) {
      document.body.classList.add('mobile');
    }

    windows.forEach((win, i) => {
      const title = win.querySelector(".title-bar");
      const id = win.id;

      // Set initial position with offset
      const saved = localStorage.getItem(`win-${id}`);
      if (saved) {
        try {
          const { top, left } = JSON.parse(saved);
          win.style.top = top;
          win.style.left = left;
        } catch (e) {
          // If parsing fails, use default offset
          const offset = i * 30;
          win.style.top = (60 + offset) + 'px';
          win.style.left = (60 + offset) + 'px';
        }
      } else {
        const offset = i * 30;
        win.style.top = (60 + offset) + 'px';
        win.style.left = (60 + offset) + 'px';
      }

      // Restore window size
      const savedSize = localStorage.getItem(`win-${id}-size`);
      if (savedSize) {
        try {
          const { width, height } = JSON.parse(savedSize);
          win.style.width = width;
          win.style.height = height;
        } catch (e) {
          // Use default size if parsing fails
        }
      }

      // Always update window-body height to account for resize handle
      const windowBody = win.querySelector('.window-body');
      if (windowBody) {
        // Use setTimeout to ensure the window is fully rendered
        setTimeout(() => {
          const currentHeight = win.style.height || win.offsetHeight;
          const heightValue = parseInt(currentHeight, 10);
          // Account for title bar (28px) and resize handle area (25px)
          windowBody.style.height = (heightValue - 28 - 25) + 'px';
        }, 0);
      }

      // Add dragging functionality to all windows
      this.makeWindowDraggable(win, title);
    });

    // Set up reset button
    const resetBtn = document.getElementById("reset-windows");
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        windows.forEach((win, i) => {
          const offset = i * 30;
          win.style.top = (60 + offset) + 'px';
          win.style.left = (60 + offset) + 'px';
          win.style.width = '300px';
          win.style.height = '200px';
          win.style.zIndex = '1000';
          win.style.display = 'block';
          
          // Update window-body height after reset
          const windowBody = win.querySelector('.window-body');
          if (windowBody) {
            setTimeout(() => {
              const currentHeight = win.style.height || win.offsetHeight;
              const heightValue = parseInt(currentHeight, 10);
              windowBody.style.height = (heightValue - 28 - 25) + 'px';
            }, 0);
          }
        });
        
        // Save reset positions
        windows.forEach(win => {
          const id = win.id;
          const rect = win.getBoundingClientRect();
          localStorage.setItem(`win-${id}`, JSON.stringify({
            top: rect.top + 'px',
            left: rect.left + 'px'
          }));
          localStorage.setItem(`win-${id}-size`, JSON.stringify({
            width: win.style.width,
            height: win.style.height
          }));
        });
      });
    }

    // Window management initialized
  },

  // Minimize a window
  minimizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
      win.style.display = 'none';
    } else {
      console.warn(`Window with ID "${windowId}" not found.`);
    }
  },

  // Bring window to front (highest z-index)
  bringToFront(window) {
    const windows = document.querySelectorAll('.window');
    let maxZ = 1000;
    windows.forEach(win => {
      const z = parseInt(win.style.zIndex) || 1000;
      if (z > maxZ) maxZ = z;
    });
    window.style.zIndex = maxZ + 1;
  },

  // Toggle window visibility
  toggleWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
      if (win.style.display === 'none') {
        win.style.display = 'block';
        this.bringToFront(win);
        
        // Special handling for media player window - reshuffle videos when opened
        if (windowId === 'media-player-window' && typeof reshuffleVideos === 'function') {
          reshuffleVideos();
        }
      } else {
        win.style.display = 'none';
      }
    } else {
      console.warn(`Window with ID "${windowId}" not found.`);
    }
  },

  // Make a window draggable
  makeWindowDraggable(win, title) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    title.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(win.style.left) || 0;
      startTop = parseInt(win.style.top) || 0;
      
      this.bringToFront(win);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;
      
      // Constrain to viewport
      const constrained = this.constrainWindowPosition(win, newLeft, newTop);
      newLeft = constrained.x;
      newTop = constrained.y;
      
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Save position
        const id = win.id;
        const rect = win.getBoundingClientRect();
        localStorage.setItem(`win-${id}`, JSON.stringify({
          top: rect.top + 'px',
          left: rect.left + 'px'
        }));
      }
    });

    // Touch events for mobile dragging
    title.addEventListener('touchstart', (e) => {
      if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
      
      isDragging = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startLeft = parseInt(win.style.left) || 0;
      startTop = parseInt(win.style.top) || 0;
      
      this.bringToFront(win);
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;
      
      // Constrain to viewport
      const constrained = this.constrainWindowPosition(win, newLeft, newTop);
      newLeft = constrained.x;
      newTop = constrained.y;
      
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
      
      e.preventDefault();
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        // Save position
        const id = win.id;
        const rect = win.getBoundingClientRect();
        localStorage.setItem(`win-${id}`, JSON.stringify({
          top: rect.top + 'px',
          left: rect.left + 'px'
        }));
      }
    });

    // Initialize window resizing
    this.initializeWindowResizing(win);
  },

  // Initialize window resizing
  initializeWindowResizing(win) {
    const resizeHandle = win.querySelector('.resize-se');
    if (!resizeHandle) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(win.style.width) || win.offsetWidth;
      startHeight = parseInt(win.style.height) || win.offsetHeight;
      startLeft = parseInt(win.style.left) || 0;
      startTop = parseInt(win.style.top) || 0;
      
      this.bringToFront(win);
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Set different minimum dimensions based on window type
      let minWidth = 200;
      let minHeight = 100;
      
      if (win.id === 'playerWindow') {
        minWidth = 200;
        minHeight = 250;
      }
      
      let newWidth = Math.max(minWidth, startWidth + deltaX);
      let newHeight = Math.max(minHeight, startHeight + deltaY);
      
      win.style.width = newWidth + 'px';
      win.style.height = newHeight + 'px';
      
      // Update window-body height dynamically
      const windowBody = win.querySelector('.window-body');
      if (windowBody) {
        const finalHeight = newHeight;
        // Account for title bar (28px) and resize handle area (25px)
        windowBody.style.height = (finalHeight - 28 - 25) + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        // Save size
        const id = win.id;
        localStorage.setItem(`win-${id}-size`, JSON.stringify({
          width: win.style.width,
          height: win.style.height
        }));
      }
    });

    // Touch events for mobile resizing
    resizeHandle.addEventListener('touchstart', (e) => {
      isResizing = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startWidth = parseInt(win.style.width) || win.offsetWidth;
      startHeight = parseInt(win.style.height) || win.offsetHeight;
      startLeft = parseInt(win.style.left) || 0;
      startTop = parseInt(win.style.top) || 0;
      
      this.bringToFront(win);
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isResizing) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // Set different minimum dimensions based on window type
      let minWidth = 200;
      let minHeight = 100;
      
      if (win.id === 'playerWindow') {
        minWidth = 200;
        minHeight = 250;
      }
      
      let newWidth = Math.max(minWidth, startWidth + deltaX);
      let newHeight = Math.max(minHeight, startHeight + deltaY);
      
      win.style.width = newWidth + 'px';
      win.style.height = newHeight + 'px';
      
      // Update window-body height dynamically
      const windowBody = win.querySelector('.window-body');
      if (windowBody) {
        const finalHeight = newHeight;
        // Account for title bar (28px) and resize handle area (25px)
        windowBody.style.height = (finalHeight - 28 - 25) + 'px';
      }
      
      e.preventDefault();
    });

    document.addEventListener('touchend', () => {
      if (isResizing) {
        isResizing = false;
        // Save size
        const id = win.id;
        localStorage.setItem(`win-${id}-size`, JSON.stringify({
          width: win.style.width,
          height: win.style.height
        }));
      }
    });
  },

  // Helper function to constrain window position
  constrainWindowPosition(win, x, y) {
    const rect = win.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Keep window within viewport bounds
    const minX = 0;
    const maxX = windowWidth - rect.width;
    const minY = 0;
    const maxY = windowHeight - rect.height;
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }
};

// Initialize window management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  WindowManager.initializeWindows();
});
