// Terminal Module - Handles xterm.js terminal functionality
// Following the same modular pattern as other components

let terminal = null;
let fitAddon = null;
let terminalInitialized = false;

// Terminal initialization
function initializeTerminal() {
  // Check if xterm.js is loaded
  if (typeof Terminal === 'undefined') {
    setTimeout(() => {
      initializeTerminal();
    }, 1000);
    return false;
  }
  
  if (typeof FitAddon === 'undefined') {
    setTimeout(() => {
      initializeTerminal();
    }, 1000);
    return false;
  }
  
  // Get the correct constructor
  let TerminalConstructor = Terminal;
  if (typeof Terminal !== 'function') {
    if (Terminal.Terminal) {
      TerminalConstructor = Terminal.Terminal;
    } else if (Terminal.default) {
      TerminalConstructor = Terminal.default;
    } else {
      return false;
    }
  }
  
  try {
    // Create terminal instance
    terminal = new TerminalConstructor({
      theme: {
        background: '#282828',      // Gruvbox background
        foreground: '#ebdbb2',      // Gruvbox foreground
        cursor: '#ebdbb2',          // Gruvbox cursor
        selection: '#3c3836',       // Gruvbox selection
        black: '#282828',
        red: '#cc241d',
        green: '#98971a',
        yellow: '#d79921',
        blue: '#458588',
        magenta: '#b16286',
        cyan: '#689d6a',
        white: '#a89984',
        brightBlack: '#928374',
        brightRed: '#fb4934',
        brightGreen: '#b8bb26',
        brightYellow: '#fabd2f',
        brightBlue: '#83a598',
        brightMagenta: '#d3869b',
        brightCyan: '#8ec07c',
        brightWhite: '#ebdbb2'
      },
      fontSize: 13,
      fontFamily: 'Courier New, monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4
    });
    
    // Add fit addon
    fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    
    // Open terminal in DOM
    const terminalElement = document.getElementById('terminal');
    
    if (terminalElement) {
      terminal.open(terminalElement);
      fitAddon.fit();
      
      // Add welcome message
      showWelcomeMessage();
      
      // Set up command handling
      setupCommandHandling();
      
      // Handle window resize
      window.addEventListener('resize', handleTerminalResize);
      
      terminalInitialized = true;
      
      // Make terminal globally accessible for BBS system
      window.terminal = terminal;
      
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

function showWelcomeMessage() {
  if (!terminal) return;
  
  terminal.writeln('\x1b[32mWelcome to JTrap Family Radio Terminal!\x1b[0m');
  terminal.writeln('\x1b[33mType "help" for available commands.\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
  terminal.writeln('  help     - Show this help message');
  terminal.writeln('  time     - Show current time');
  terminal.writeln('  clear    - Clear the terminal');
  terminal.writeln('  bbs      - Access BBS system');
  terminal.writeln('');
  terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
}

function setupCommandHandling() {
  if (!terminal) return;
  
  let currentLine = '';
  
  terminal.onData(data => {
    // Check if we're in password mode
    if (window.BBS && window.BBS.isPasswordMode && window.BBS.isPasswordMode()) {
      const result = window.BBS.handlePasswordInput(data);
      if (result !== null) {
        // Password input complete, process it
        if (window.BBS && window.BBS.bbsMode()) {
          window.BBS.handleBBSCommand(result);
        }
        currentLine = '';
        if (!window.BBS || !window.BBS.bbsMode()) {
          terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
        }
      }
      return;
    }
    
    if (data === '\r') { // Enter key
      terminal.writeln('');
      if (window.BBS && window.BBS.bbsMode()) {
        window.BBS.handleBBSCommand(currentLine.trim());
      } else {
        handleCommand(currentLine.trim());
      }
      currentLine = '';
      if (!window.BBS || !window.BBS.bbsMode()) {
        terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
      }
    } else if (data === '\x7f') { // Backspace
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1);
        terminal.write('\b \b');
      }
    } else if (data >= ' ') { // Printable characters
      currentLine += data;
      terminal.write(data);
    }
  });
}

function handleCommand(command) {
  if (!terminal) return;
  
  switch (command.toLowerCase()) {
    case 'help':
      terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
      terminal.writeln('  help     - Show this help message');
      terminal.writeln('  time     - Show current time');
      terminal.writeln('  clear    - Clear the terminal');
      terminal.writeln('  bbs      - Access BBS system');
      break;
      
      
    case 'time':
      const now = new Date();
      terminal.writeln(`\x1b[35mCurrent time: ${now.toLocaleString()}\x1b[0m`);
      break;
      
    case 'clear':
      terminal.clear();
      break;
      
    case 'bbs':
      // Check if BBS is available, with fallback
      if (window.BBS && window.BBS.showBBSLogin) {
        window.BBS.showBBSLogin();
      } else if (window.BBS && window.BBS.showBBSLogin) {
        // Try the Supabase version
        window.BBS.showBBSLogin();
      } else {
        terminal.writeln('\x1b[31mBBS system not loaded. Please refresh the page.\x1b[0m');
        terminal.writeln('\x1b[33mTrying to load BBS system...\x1b[0m');
        // Try to load the BBS system manually
        setTimeout(() => {
          if (window.BBS && window.BBS.showBBSLogin) {
            terminal.writeln('\x1b[32mBBS system loaded! Try "bbs" again.\x1b[0m');
          } else {
            terminal.writeln('\x1b[31mBBS system still not available. Check console for errors.\x1b[0m');
          }
        }, 1000);
      }
      break;
      
    case '':
      // Empty command, do nothing
      break;
      
    default:
      terminal.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m`);
      terminal.writeln('Type "help" for available commands.');
  }
}

function handleTerminalResize() {
  if (terminal && fitAddon) {
    fitAddon.fit();
  }
}



// Public API - Use a different name to avoid shadowing the xterm.js Terminal constructor
window.TerminalModule = {
  initializeTerminal,
  isInitialized: () => terminalInitialized,
  getTerminal: () => terminal,
  getFitAddon: () => fitAddon
};
