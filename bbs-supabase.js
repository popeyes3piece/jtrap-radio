// BBS System with Supabase Integration for JTrap Family Radio
// Real-time bulletin board system with persistent data

// BBS System Variables
let currentUser = null;
let bbsMode = false;
let currentMenu = 'main';
let inputBuffer = '';
let supabase = null;

// Initialize Supabase connection
function initSupabase() {
  if (window.getSupabase) {
    supabase = window.getSupabase();
    if (supabase) {
      console.log('BBS: Supabase connected successfully!');
      return true;
    }
  }
  console.error('BBS: Supabase not available');
  return false;
}

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
  terminal.writeln('\x1b[35mOr type "register" to create a new account\x1b[0m');
  terminal.writeln('\x1b[35mOr type "exit" to return to main terminal\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mUsername: \x1b[0m');
  
  bbsMode = true;
  currentMenu = 'login';
  
  // Initialize Supabase
  if (!initSupabase()) {
    terminal.writeln('\x1b[31mWarning: Supabase not connected. Some features may not work.\x1b[0m');
  }
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
  terminal.writeln(`\x1b[36mLast Login: ${currentUser.last_login ? new Date(currentUser.last_login).toLocaleString() : 'First time!'}\x1b[0m`);
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
    case 'register':
      handleRegistration(command);
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
async function handleLogin(command) {
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
  
  if (command.toLowerCase() === 'register') {
    showRegistration();
    return;
  }
  
  if (!currentUser) {
    // Username input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mUsername cannot be empty. Try again or type "exit" to return.\x1b[0m');
      terminal.write('\x1b[32mUsername: \x1b[0m');
      return;
    }
    
    // Check if user exists in Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', command.toLowerCase())
          .single();
        
        if (error || !data) {
          terminal.writeln('\x1b[31mUser not found. Try again or type "register" to create account.\x1b[0m');
          terminal.write('\x1b[32mUsername: \x1b[0m');
          return;
        }
        
        currentUser = data;
        terminal.writeln(`\x1b[32mFound user: ${data.username}\x1b[0m`);
        terminal.write('\x1b[32mPassword: \x1b[0m');
      } catch (err) {
        terminal.writeln('\x1b[31mDatabase error. Using fallback login.\x1b[0m');
        // Fallback to local users
        const localUsers = [
          { username: 'admin', password: 'admin', user_level: 'sysop' },
          { username: 'guest', password: '', user_level: 'user' }
        ];
        const user = localUsers.find(u => u.username === command.toLowerCase());
        if (user) {
          currentUser = user;
          terminal.writeln(`\x1b[32mFound user: ${user.username}\x1b[0m`);
          terminal.write('\x1b[32mPassword: \x1b[0m');
        } else {
          terminal.writeln('\x1b[31mUser not found. Try again or type "register" to create account.\x1b[0m');
          terminal.write('\x1b[32mUsername: \x1b[0m');
        }
      }
    } else {
      // Fallback to local users
      const localUsers = [
        { username: 'admin', password: 'admin', user_level: 'sysop' },
        { username: 'guest', password: '', user_level: 'user' }
      ];
      const user = localUsers.find(u => u.username === command.toLowerCase());
      if (user) {
        currentUser = user;
        terminal.writeln(`\x1b[32mFound user: ${user.username}\x1b[0m`);
        terminal.write('\x1b[32mPassword: \x1b[0m');
      } else {
        terminal.writeln('\x1b[31mUser not found. Try again or type "register" to create account.\x1b[0m');
        terminal.write('\x1b[32mUsername: \x1b[0m');
      }
    }
  } else {
    // Password input
    if (currentUser.password === '' || currentUser.password === command) {
      // Update last login in Supabase
      if (supabase && currentUser.id) {
        try {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', currentUser.id);
        } catch (err) {
          console.error('Failed to update last login:', err);
        }
      }
      
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

// Registration Handler
function showRegistration() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        User Registration                    ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[33mCreate a new BBS account:\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mUsername: \x1b[0m');
  
  currentMenu = 'register';
}

async function handleRegistration(command) {
  if (command.toLowerCase() === 'exit') {
    showBBSLogin();
    return;
  }
  
  if (!currentUser) {
    // Username input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mUsername cannot be empty. Try again or type "exit" to return.\x1b[0m');
      terminal.write('\x1b[32mUsername: \x1b[0m');
      return;
    }
    
    // Check if username is available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', command.toLowerCase())
          .single();
        
        if (data) {
          terminal.writeln('\x1b[31mUsername already taken. Try another.\x1b[0m');
          terminal.write('\x1b[32mUsername: \x1b[0m');
          return;
        }
      } catch (err) {
        // Username available
      }
    }
    
    currentUser = { username: command.toLowerCase(), step: 'password' };
    terminal.writeln(`\x1b[32mUsername: ${command}\x1b[0m`);
    terminal.write('\x1b[32mPassword: \x1b[0m');
  } else if (currentUser.step === 'password') {
    // Password input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mPassword cannot be empty. Try again.\x1b[0m');
      terminal.write('\x1b[32mPassword: \x1b[0m');
      return;
    }
    
    currentUser.password = command;
    currentUser.step = 'email';
    terminal.writeln('\x1b[32mPassword: [HIDDEN]\x1b[0m');
    terminal.write('\x1b[32mEmail: \x1b[0m');
  } else if (currentUser.step === 'email') {
    // Email input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mEmail cannot be empty. Try again.\x1b[0m');
      terminal.write('\x1b[32mEmail: \x1b[0m');
      return;
    }
    
    currentUser.email = command;
    
    // Create user in Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            username: currentUser.username,
            email: currentUser.email,
            password_hash: currentUser.password, // In production, hash this!
            user_level: 'user',
            join_date: new Date().toISOString(),
            last_login: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) {
          terminal.writeln('\x1b[31mRegistration failed: ' + error.message + '\x1b[0m');
          terminal.writeln('\x1b[33mUsing local account instead.\x1b[0m');
          currentUser.user_level = 'user';
          currentUser.last_login = new Date();
        } else {
          currentUser = data;
          terminal.writeln('\x1b[32mRegistration successful!\x1b[0m');
        }
      } catch (err) {
        terminal.writeln('\x1b[31mRegistration failed. Using local account.\x1b[0m');
        currentUser.user_level = 'user';
        currentUser.last_login = new Date();
      }
    } else {
      terminal.writeln('\x1b[33mSupabase not available. Using local account.\x1b[0m');
      currentUser.user_level = 'user';
      currentUser.last_login = new Date();
    }
    
    setTimeout(() => showBBSMainMenu(), 1000);
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
async function showMessageBoards() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        Message Boards                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  const boards = ['general', 'announcements', 'music', 'tech'];
  terminal.writeln('\x1b[35mAvailable Boards:\x1b[0m');
  
  if (supabase) {
    try {
      for (let i = 0; i < boards.length; i++) {
        const board = boards[i];
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('board', board);
        terminal.writeln(`\x1b[36m  [${i + 1}] ${board.toUpperCase()} (${count || 0} messages)\x1b[0m`);
      }
    } catch (err) {
      terminal.writeln('\x1b[31mError loading message counts.\x1b[0m');
      boards.forEach((board, index) => {
        terminal.writeln(`\x1b[36m  [${index + 1}] ${board.toUpperCase()} (0 messages)\x1b[0m`);
      });
    }
  } else {
    boards.forEach((board, index) => {
      terminal.writeln(`\x1b[36m  [${index + 1}] ${board.toUpperCase()} (0 messages)\x1b[0m`);
    });
  }
  
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mSelect board (0-4): \x1b[0m');
  
  currentMenu = 'messages';
}

// File Downloads
async function showFileDownloads() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        File Downloads                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mAvailable Files:\x1b[0m');
  
  if (supabase) {
    try {
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        terminal.writeln('\x1b[31mError loading files.\x1b[0m');
      } else if (files && files.length > 0) {
        files.forEach((file, index) => {
          terminal.writeln(`\x1b[36m  [${index + 1}] ${file.name}\x1b[0m`);
          terminal.writeln(`\x1b[33m      Size: ${file.size} | Downloads: ${file.downloads} | Uploader: ${file.uploader_id}\x1b[0m`);
          terminal.writeln(`\x1b[33m      Description: ${file.description}\x1b[0m`);
          terminal.writeln('');
        });
      } else {
        terminal.writeln('\x1b[33m  No files available.\x1b[0m');
      }
    } catch (err) {
      terminal.writeln('\x1b[31mError loading files.\x1b[0m');
    }
  } else {
    terminal.writeln('\x1b[33m  Supabase not available. No files to display.\x1b[0m');
  }
  
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mSelect file to download (0-4): \x1b[0m');
  
  currentMenu = 'files';
}

// User Directory
async function showUserDirectory() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        User Directory                       ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mRegistered Users:\x1b[0m');
  
  if (supabase) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('username, user_level, join_date, last_login')
        .order('join_date', { ascending: false });
      
      if (error) {
        terminal.writeln('\x1b[31mError loading users.\x1b[0m');
      } else if (users && users.length > 0) {
        users.forEach(user => {
          const status = user.username === currentUser.username ? ' (YOU)' : '';
          terminal.writeln(`\x1b[36m  ${user.username}${status}\x1b[0m`);
          terminal.writeln(`\x1b[33m      Level: ${user.user_level ? user.user_level.toUpperCase() : 'USER'} | Joined: ${user.join_date ? new Date(user.join_date).toLocaleDateString() : 'Unknown'}\x1b[0m`);
          terminal.writeln(`\x1b[33m      Last Login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}\x1b[0m`);
          terminal.writeln('');
        });
      } else {
        terminal.writeln('\x1b[33m  No users found.\x1b[0m');
      }
    } catch (err) {
      terminal.writeln('\x1b[31mError loading users.\x1b[0m');
    }
  } else {
    terminal.writeln('\x1b[33m  Supabase not available. No user data to display.\x1b[0m');
  }
  
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
  currentMenu = 'users';
}

// Chat Room
async function showChatRoom() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                          Chat Room                          ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mRecent Messages:\x1b[0m');
  
  if (supabase) {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users!chat_messages_user_id_fkey(username)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        terminal.writeln('\x1b[31mError loading chat messages.\x1b[0m');
      } else if (messages && messages.length > 0) {
        messages.reverse().forEach(msg => {
          const author = msg.users ? msg.users.username : 'Unknown';
          terminal.writeln(`\x1b[36m  [${new Date(msg.created_at).toLocaleTimeString()}] ${author}: ${msg.content}\x1b[0m`);
        });
      } else {
        terminal.writeln('\x1b[33m  No messages yet. Be the first to chat!\x1b[0m');
      }
    } catch (err) {
      terminal.writeln('\x1b[31mError loading chat messages.\x1b[0m');
    }
  } else {
    terminal.writeln('\x1b[33m  Supabase not available. No chat messages to display.\x1b[0m');
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
async function showSystemInfo() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                      System Information                     ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[35mBBS System Info:\x1b[0m');
  terminal.writeln('\x1b[36m  Software: JTrap BBS v2.0 (Supabase)\x1b[0m');
  terminal.writeln('\x1b[36m  Uptime: 24/7\x1b[0m');
  terminal.writeln('\x1b[36m  Database: Supabase PostgreSQL\x1b[0m');
  
  if (supabase) {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      // Get message count
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      
      // Get file count
      const { count: fileCount } = await supabase
        .from('files')
        .select('*', { count: 'exact', head: true });
      
      terminal.writeln(`\x1b[36m  Total Users: ${userCount || 0}\x1b[0m`);
      terminal.writeln(`\x1b[36m  Messages: ${messageCount || 0}\x1b[0m`);
      terminal.writeln(`\x1b[36m  Files: ${fileCount || 0}\x1b[0m`);
    } catch (err) {
      terminal.writeln('\x1b[31m  Error loading statistics\x1b[0m');
    }
  } else {
    terminal.writeln('\x1b[31m  Supabase not connected\x1b[0m');
  }
  
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

async function handleFileMenu(command) {
  if (command === '0') {
    showBBSMainMenu();
  } else {
    const fileIndex = parseInt(command) - 1;
    if (fileIndex >= 0) {
      if (supabase) {
        try {
          const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error || !files || fileIndex >= files.length) {
            terminal.writeln('\x1b[31mInvalid file selection.\x1b[0m');
          } else {
            const file = files[fileIndex];
            terminal.writeln(`\x1b[32mDownloading ${file.name}...\x1b[0m`);
            terminal.writeln(`\x1b[33mFile size: ${file.size}\x1b[0m`);
            terminal.writeln(`\x1b[33mDescription: ${file.description}\x1b[0m`);
            terminal.writeln('\x1b[32mDownload complete! (Simulated)\x1b[0m');
            
            // Update download count
            await supabase
              .from('files')
              .update({ downloads: file.downloads + 1 })
              .eq('id', file.id);
          }
        } catch (err) {
          terminal.writeln('\x1b[31mError downloading file.\x1b[0m');
        }
      } else {
        terminal.writeln('\x1b[31mSupabase not available.\x1b[0m');
      }
    } else {
      terminal.writeln('\x1b[31mInvalid file selection.\x1b[0m');
    }
    terminal.writeln('');
    terminal.write('\x1b[32mSelect file to download (0-4): \x1b[0m');
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

async function handleChatMenu(command) {
  if (command.toLowerCase() === 'exit') {
    showBBSMainMenu();
  } else if (command.trim() !== '') {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert([{
            user_id: currentUser.id,
            content: command,
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          terminal.writeln('\x1b[31mFailed to send message.\x1b[0m');
        } else {
          terminal.writeln(`\x1b[36m[${new Date().toLocaleTimeString()}] ${currentUser.username}: ${command}\x1b[0m`);
        }
      } catch (err) {
        terminal.writeln('\x1b[31mFailed to send message.\x1b[0m');
      }
    } else {
      terminal.writeln(`\x1b[36m[${new Date().toLocaleTimeString()}] ${currentUser.username}: ${command}\x1b[0m`);
    }
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
