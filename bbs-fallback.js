// Fallback BBS System for JTrap Family Radio
// Simple BBS that works without Supabase

// BBS System Variables
let currentUser = null;
let bbsMode = false;
let currentMenu = 'main';
let inputBuffer = '';

// Simple BBS Login Screen
function showBBSLogin() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                                                              ║\x1b[0m');
  terminal.writeln('\x1b[32m║              🎵 JTrap Family Radio BBS 🎵                    ║\x1b[0m');
  terminal.writeln('\x1b[32m║                                                              ║\x1b[0m');
  terminal.writeln('\x1b[32m║              Welcome to the Bulletin Board System             ║\x1b[0m');
  terminal.writeln('\x1b[32m║                                                              ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[33mLogin to access the BBS system:\x1b[0m');
  terminal.writeln('\x1b[36mUsername: guest\x1b[0m');
  terminal.writeln('\x1b[36mPassword: (press Enter for guest access)\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[35mOr type "exit" to return to main terminal\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mUsername: \x1b[0m');
  
  bbsMode = true;
  currentMenu = 'login';
}

// BBS Main Menu
function showBBSMainMenu() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                                                              ║\x1b[0m');
  terminal.writeln('\x1b[32m║              🎵 JTrap Family Radio BBS 🎵                    ║\x1b[0m');
  terminal.writeln('\x1b[32m║                                                              ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln(`\x1b[33mWelcome back, ${currentUser.username}!\x1b[0m`);
  terminal.writeln(`\x1b[36mUser Level: ${currentUser.user_level ? currentUser.user_level.toUpperCase() : 'USER'}\x1b[0m`);
  terminal.writeln(`\x1b[36mLast Login: ${currentUser.last_login ? currentUser.last_login.toLocaleString() : 'First time!'}\x1b[0m`);
  terminal.writeln('');
  terminal.writeln('\x1b[35m┌─ Main Menu ─────────────────────────────────────────────────┐\x1b[0m');
  terminal.writeln('\x1b[35m│                                                              │\x1b[0m');
  terminal.writeln('\x1b[35m│  [1] Message Boards                                          │\x1b[0m');
  terminal.writeln('\x1b[35m│  [2] File Downloads                                          │\x1b[0m');
  terminal.writeln('\x1b[35m│  [3] User Directory                                          │\x1b[0m');
  terminal.writeln('\x1b[35m│  [4] Chat Room                                               │\x1b[0m');
  terminal.writeln('\x1b[35m│  [5] Radio Station Info                                      │\x1b[0m');
  terminal.writeln('\x1b[35m│  [6] System Information                                      │\x1b[0m');
  terminal.writeln('\x1b[35m│  [7] Change Password                                         │\x1b[0m');
  terminal.writeln('\x1b[35m│  [8] Logout                                                  │\x1b[0m');
  terminal.writeln('\x1b[35m│                                                              │\x1b[0m');
  terminal.writeln('\x1b[35m└──────────────────────────────────────────────────────────────┘\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mSelect option (1-8): \x1b[0m');
  
  currentMenu = 'main';
}

// BBS Command Handler
function handleBBSCommand(command) {
  switch (currentMenu) {
    case 'login':
      handleLogin(command);
      break;
    case 'main':
      handleMainMenu(command);
      break;
    case 'messages':
      handleMessageMenu(command);
      break;
    case 'files':
      handleFileMenu(command);
      break;
    case 'users':
      handleUserMenu(command);
      break;
    case 'chat':
      handleChatMenu(command);
      break;
    case 'system':
      handleSystemMenu(command);
      break;
    default:
      terminal.writeln('\x1b[31mInvalid menu state!\x1b[0m');
  }
}

// Login Handler
function handleLogin(command) {
  if (command.toLowerCase() === 'exit') {
    bbsMode = false;
    terminal.clear();
    terminal.writeln('\x1b[32mWelcome to JTrap Family Radio Terminal!\x1b[0m');
    terminal.writeln('\x1b[33mType "help" for available commands.\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
    terminal.writeln('  help     - Show this help message');
    terminal.writeln('  radio    - Show radio station info');
    terminal.writeln('  time     - Show current time');
    terminal.writeln('  clear    - Clear the terminal');
    terminal.writeln('  bbs      - Access BBS system');
    terminal.writeln('');
    terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
    return;
  }
  
  if (!currentUser) {
    // Username input
    const localUsers = [
      { username: 'admin', password: 'admin', user_level: 'sysop' },
      { username: 'guest', password: '', user_level: 'user' },
      { username: 'listener', password: 'music', user_level: 'user' }
    ];
    const user = localUsers.find(u => u.username === command.toLowerCase());
    if (user) {
      currentUser = user;
      terminal.writeln(`\x1b[32mFound user: ${user.username}\x1b[0m`);
      terminal.write('\x1b[32mPassword: \x1b[0m');
    } else {
      terminal.writeln('\x1b[31mUser not found. Try again or type "exit" to return.\x1b[0m');
      terminal.write('\x1b[32mUsername: \x1b[0m');
    }
  } else {
    // Password input
    if (currentUser.password === '' || currentUser.password === command) {
      currentUser.last_login = new Date();
      terminal.writeln('\x1b[32mLogin successful!\x1b[0m');
      setTimeout(() => showBBSMainMenu(), 1000);
    } else {
      terminal.writeln('\x1b[31mInvalid password. Try again.\x1b[0m');
      terminal.write('\x1b[32mUsername: \x1b[0m');
      currentUser = null;
    }
  }
}

// Main Menu Handler
function handleMainMenu(command) {
  switch (command) {
    case '1':
      showMessageBoards();
      break;
    case '2':
      showFileDownloads();
      break;
    case '3':
      showUserDirectory();
      break;
    case '4':
      showChatRoom();
      break;
    case '5':
      showRadioInfo();
      break;
    case '6':
      showSystemInfo();
      break;
    case '7':
      showChangePassword();
      break;
    case '8':
      logout();
      break;
    default:
      terminal.writeln('\x1b[31mInvalid option. Please select 1-8.\x1b[0m');
      terminal.write('\x1b[32mSelect option (1-8): \x1b[0m');
  }
}

// Message Boards
function showMessageBoards() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        Message Boards                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  const boards = ['general', 'announcements', 'music', 'tech'];
  terminal.writeln('\x1b[35mAvailable Boards:\x1b[0m');
  boards.forEach((board, index) => {
    terminal.writeln(`\x1b[36m  [${index + 1}] ${board.toUpperCase()} (0 messages)\x1b[0m`);
  });
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mSelect board (0-4): \x1b[0m');
  
  currentMenu = 'messages';
}

// File Downloads
function showFileDownloads() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        File Downloads                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mAvailable Files:\x1b[0m');
  terminal.writeln('\x1b[33m  No files available in offline mode.\x1b[0m');
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
  currentMenu = 'files';
}

// User Directory
function showUserDirectory() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        User Directory                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mRegistered Users:\x1b[0m');
  const users = [
    { username: 'admin', user_level: 'sysop', join_date: '2024-01-01' },
    { username: 'guest', user_level: 'user', join_date: '2024-01-01' },
    { username: 'listener', user_level: 'user', join_date: '2024-01-15' }
  ];
  
  users.forEach(user => {
    const status = user.username === currentUser.username ? ' (YOU)' : '';
    terminal.writeln(`\x1b[36m  ${user.username}${status}\x1b[0m`);
    terminal.writeln(`\x1b[33m      Level: ${user.user_level.toUpperCase()} | Joined: ${user.join_date}\x1b[0m`);
    terminal.writeln('');
  });
  
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
  currentMenu = 'users';
}

// Chat Room
function showChatRoom() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                          Chat Room                          ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mRecent Messages:\x1b[0m');
  terminal.writeln('\x1b[33m  No messages yet. Be the first to chat!\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[35mCommands:\x1b[0m');
  terminal.writeln('\x1b[36m  Type your message and press Enter to send\x1b[0m');
  terminal.writeln('\x1b[36m  Type "exit" to return to main menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mEnter message: \x1b[0m');
  
  currentMenu = 'chat';
}

// Radio Station Info
function showRadioInfo() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                      Radio Station Info                     ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[33m🎵 JTrap Family Radio Station\x1b[0m');
  terminal.writeln('\x1b[36m  Frequency: 99.9 FM\x1b[0m');
  terminal.writeln('\x1b[36m  Website: jtrap.radio\x1b[0m');
  terminal.writeln('\x1b[36m  Status: Online\x1b[0m');
  terminal.writeln('\x1b[36m  Listeners: ' + Math.floor(Math.random() * 50) + 1 + '\x1b[0m');
  terminal.writeln('\x1b[36m  Format: Alternative/Indie Rock\x1b[0m');
  terminal.writeln('\x1b[36m  Coverage: Worldwide via Internet\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[35mContact Info:\x1b[0m');
  terminal.writeln('\x1b[36m  Email: info@jtrap.radio\x1b[0m');
  terminal.writeln('\x1b[36m  Phone: (555) JT-RADIO\x1b[0m');
  terminal.writeln('\x1b[36m  Address: 123 Music Lane, Radio City\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
  currentMenu = 'system';
}

// System Information
function showSystemInfo() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                      System Information                     ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mBBS System Info:\x1b[0m');
  terminal.writeln('\x1b[36m  Software: JTrap BBS v2.0 (Offline Mode)\x1b[0m');
  terminal.writeln('\x1b[36m  Uptime: 24/7\x1b[0m');
  terminal.writeln('\x1b[36m  Database: Local Storage\x1b[0m');
  terminal.writeln('\x1b[36m  Total Users: 3\x1b[0m');
  terminal.writeln('\x1b[36m  Messages: 0\x1b[0m');
  terminal.writeln('\x1b[36m  Files: 0\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[35mServer Info:\x1b[0m');
  terminal.writeln('\x1b[36m  OS: Linux\x1b[0m');
  terminal.writeln('\x1b[36m  CPU: Intel i7\x1b[0m');
  terminal.writeln('\x1b[36m  RAM: 16GB\x1b[0m');
  terminal.writeln('\x1b[36m  Storage: 1TB SSD\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
  currentMenu = 'system';
}

// Change Password
function showChangePassword() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                      Change Password                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[33mPassword change feature coming soon!\x1b[0m');
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
  currentMenu = 'system';
}

// Logout
function logout() {
  terminal.clear();
  terminal.writeln('\x1b[32mThank you for using JTrap Family Radio BBS!\x1b[0m');
  terminal.writeln('\x1b[33mGoodbye, ' + currentUser.username + '!\x1b[0m');
  terminal.writeln('');
  
  currentUser = null;
  bbsMode = false;
  currentMenu = 'main';
  
  setTimeout(() => {
    terminal.writeln('\x1b[32mWelcome to JTrap Family Radio Terminal!\x1b[0m');
    terminal.writeln('\x1b[33mType "help" for available commands.\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
    terminal.writeln('  help     - Show this help message');
    terminal.writeln('  radio    - Show radio station info');
    terminal.writeln('  time     - Show current time');
    terminal.writeln('  clear    - Clear the terminal');
    terminal.writeln('  bbs      - Access BBS system');
    terminal.writeln('');
    terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
  }, 2000);
}

// Menu Handlers
function handleMessageMenu(command) {
  if (command === '0') {
    showBBSMainMenu();
  } else {
    terminal.writeln('\x1b[33mMessage board feature coming soon!\x1b[0m');
    terminal.write('\x1b[32mSelect board (0-4): \x1b[0m');
  }
}

function handleFileMenu(command) {
  if (command === '0') {
    showBBSMainMenu();
  } else {
    terminal.writeln('\x1b[33mFile download feature coming soon!\x1b[0m');
    terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  }
}

function handleUserMenu(command) {
  if (command === '0') {
    showBBSMainMenu();
  } else {
    terminal.writeln('\x1b[31mInvalid option.\x1b[0m');
    terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  }
}

function handleChatMenu(command) {
  if (command.toLowerCase() === 'exit') {
    showBBSMainMenu();
  } else if (command.trim() !== '') {
    terminal.writeln(`\x1b[36m[${new Date().toLocaleTimeString()}] ${currentUser.username}: ${command}\x1b[0m`);
    terminal.write('\x1b[32mEnter message: \x1b[0m');
  } else {
    terminal.write('\x1b[32mEnter message: \x1b[0m');
  }
}

function handleSystemMenu(command) {
  if (command === '0') {
    showBBSMainMenu();
  } else {
    terminal.writeln('\x1b[31mInvalid option.\x1b[0m');
    terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  }
}

// Export functions for use in main script
window.BBS = {
  showBBSLogin,
  handleBBSCommand,
  bbsMode: () => bbsMode,
  setBBSMode: (mode) => { bbsMode = mode; }
};

// Debug logging
console.log('BBS Fallback system loaded:', window.BBS);
