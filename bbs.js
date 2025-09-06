// BBS System for JTrap Family Radio
// A complete bulletin board system with retro feel

// BBS System Variables
let currentUser = null;
let bbsMode = false;
let currentMenu = 'main';
let inputBuffer = '';
let bbsData = {
  users: [
    { username: 'admin', password: 'admin', level: 'sysop', lastLogin: null, joinDate: '2024-01-01' },
    { username: 'guest', password: '', level: 'user', lastLogin: null, joinDate: '2024-01-01' },
    { username: 'listener', password: 'music', level: 'user', lastLogin: null, joinDate: '2024-01-15' }
  ],
  messages: [
    { 
      id: 1, 
      author: 'admin', 
      subject: 'Welcome to JTrap BBS!', 
      content: 'Welcome to the JTrap Family Radio BBS! This is where listeners can connect, share, and discuss music. Feel free to post messages, download files, and chat with other listeners.', 
      timestamp: new Date('2024-01-01'), 
      board: 'general',
      replies: []
    },
    { 
      id: 2, 
      author: 'admin', 
      subject: 'Radio Station Info', 
      content: 'JTrap Family Radio broadcasts on 99.9 FM. Visit jtrap.radio for more info! We play the best music 24/7.', 
      timestamp: new Date('2024-01-02'), 
      board: 'announcements',
      replies: []
    },
    { 
      id: 3, 
      author: 'listener', 
      subject: 'Great show today!', 
      content: 'Loved the music selection today! Keep up the great work!', 
      timestamp: new Date('2024-01-15'), 
      board: 'general',
      replies: []
    }
  ],
  files: [
    { name: 'station_logo.ans', size: '2.3KB', description: 'Station logo in ANSI art', downloads: 15, uploader: 'admin' },
    { name: 'playlist.txt', size: '1.1KB', description: 'Current playlist', downloads: 8, uploader: 'admin' },
    { name: 'station_info.txt', size: '0.8KB', description: 'Station information', downloads: 12, uploader: 'admin' },
    { name: 'ascii_art.zip', size: '5.2KB', description: 'Collection of ASCII art', downloads: 23, uploader: 'listener' }
  ],
  onlineUsers: [],
  chatMessages: []
};

// BBS Login Screen
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
  terminal.writeln(`\x1b[36mUser Level: ${currentUser.level.toUpperCase()}\x1b[0m`);
  terminal.writeln(`\x1b[36mLast Login: ${currentUser.lastLogin ? currentUser.lastLogin.toLocaleString() : 'First time!'}\x1b[0m`);
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
    const user = bbsData.users.find(u => u.username.toLowerCase() === command.toLowerCase());
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
      currentUser.lastLogin = new Date();
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
    const count = bbsData.messages.filter(m => m.board === board).length;
    terminal.writeln(`\x1b[36m  [${index + 1}] ${board.toUpperCase()} (${count} messages)\x1b[0m`);
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
  bbsData.files.forEach((file, index) => {
    terminal.writeln(`\x1b[36m  [${index + 1}] ${file.name}\x1b[0m`);
    terminal.writeln(`\x1b[33m      Size: ${file.size} | Downloads: ${file.downloads} | Uploader: ${file.uploader}\x1b[0m`);
    terminal.writeln(`\x1b[33m      Description: ${file.description}\x1b[0m`);
    terminal.writeln('');
  });
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mSelect file to download (0-4): \x1b[0m');
  
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
  bbsData.users.forEach(user => {
    const status = user.username === currentUser.username ? ' (YOU)' : '';
    const online = bbsData.onlineUsers.includes(user.username) ? ' [ONLINE]' : '';
    terminal.writeln(`\x1b[36m  ${user.username}${status}${online}\x1b[0m`);
    terminal.writeln(`\x1b[33m      Level: ${user.level.toUpperCase()} | Joined: ${user.joinDate}\x1b[0m`);
    terminal.writeln(`\x1b[33m      Last Login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}\x1b[0m`);
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
  if (bbsData.chatMessages.length === 0) {
    terminal.writeln('\x1b[33m  No messages yet. Be the first to chat!\x1b[0m');
  } else {
    bbsData.chatMessages.slice(-10).forEach(msg => {
      terminal.writeln(`\x1b[36m  [${msg.timestamp.toLocaleTimeString()}] ${msg.author}: ${msg.content}\x1b[0m`);
    });
  }
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
  terminal.writeln('\x1b[36m  Software: JTrap BBS v1.0\x1b[0m');
  terminal.writeln('\x1b[36m  Uptime: 24/7\x1b[0m');
  terminal.writeln('\x1b[36m  Users Online: ' + bbsData.onlineUsers.length + '\x1b[0m');
  terminal.writeln('\x1b[36m  Total Users: ' + bbsData.users.length + '\x1b[0m');
  terminal.writeln('\x1b[36m  Messages: ' + bbsData.messages.length + '\x1b[0m');
  terminal.writeln('\x1b[36m  Files: ' + bbsData.files.length + '\x1b[0m');
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
    const fileIndex = parseInt(command) - 1;
    if (fileIndex >= 0 && fileIndex < bbsData.files.length) {
      const file = bbsData.files[fileIndex];
      terminal.writeln(`\x1b[32mDownloading ${file.name}...\x1b[0m`);
      terminal.writeln(`\x1b[33mFile size: ${file.size}\x1b[0m`);
      terminal.writeln(`\x1b[33mDescription: ${file.description}\x1b[0m`);
      terminal.writeln('\x1b[32mDownload complete! (Simulated)\x1b[0m');
      file.downloads++;
      terminal.writeln('');
      terminal.write('\x1b[32mSelect file to download (0-4): \x1b[0m');
    } else {
      terminal.writeln('\x1b[31mInvalid file selection.\x1b[0m');
      terminal.write('\x1b[32mSelect file to download (0-4): \x1b[0m');
    }
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
    const message = {
      author: currentUser.username,
      content: command,
      timestamp: new Date()
    };
    bbsData.chatMessages.push(message);
    terminal.writeln(`\x1b[36m[${message.timestamp.toLocaleTimeString()}] ${message.author}: ${message.content}\x1b[0m`);
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
console.log('BBS system loaded:', window.BBS);
