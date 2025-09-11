// BBS System with Supabase Integration for JTrap Family Radio
// Real-time bulletin board system with persistent data


try {
// BBS System Variables
let currentUser = null;
let bbsMode = false;
let currentMenu = 'main';
let inputBuffer = '';
let passwordAttempts = 0;
let supabase = null;
let passwordMode = false;
let maskedPassword = '';

// Initialize Supabase connection
function initSupabase() {
  if (window.getSupabase) {
    supabase = window.getSupabase();
    if (supabase) {
      return true;
    }
  }
  return false;
}

// Check if we're in password input mode
function isPasswordMode() {
  return passwordMode;
}

// Password input handler with masking
function handlePasswordInput(char) {
  if (char === '\r' || char === '\n') {
    // Enter pressed - process the password
    passwordMode = false;
    const password = maskedPassword;
    maskedPassword = ''; // Clear the password buffer
    return password;
  } else if (char === '\b' || char === '\x7f') {
    // Backspace - remove last character
    if (maskedPassword.length > 0) {
      maskedPassword = maskedPassword.slice(0, -1);
      // Clear the line and re-display the masked password
      terminal.write('\r\x1b[K');
      terminal.write('\x1b[1m\x1b[4m\x1b[32mPassword:\x1b[0m ' + '*'.repeat(maskedPassword.length));
    }
    return null;
  } else if (char >= ' ' && char <= '~') {
    // Printable character - add to password
    maskedPassword += char;
    // Display asterisk
    terminal.write('*');
    return null;
  }
  return null;
}

// BBS Login Screen
function showBBSLogin() {
  terminal.clear();
  passwordMode = false; // Reset password mode
  terminal.writeln('╔══════════════════════════════════════════════════════╗');
  terminal.writeln('║                JTRAP FAMILY RADIO                    ║');
  terminal.writeln('╠══════════════════════════════════════════════════════╣');
  terminal.writeln('║                                                      ║');
  terminal.writeln('║         Welcome to the Bulletin Board System         ║');
  terminal.writeln('║                                                      ║');
  terminal.writeln('╚══════════════════════════════════════════════════════╝');
  terminal.writeln('');
  terminal.writeln('╔══════════════════════════════════════════════════════╗');
  terminal.writeln('║                Login Instructions                    ║');
  terminal.writeln('╠══════════════════════════════════════════════════════╣');
  terminal.writeln('║                                                      ║');
  terminal.writeln('║  • Type your username and password to login          ║');
  terminal.writeln('║  • Type "register" to create a new account           ║');
  terminal.writeln('║  • Type "exit" to return to main terminal            ║');
  terminal.writeln('║                                                      ║');
  terminal.writeln('╚══════════════════════════════════════════════════════╝');
  terminal.writeln('');
  terminal.write('Username: ');
  
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
  terminal.writeln('┌─◆══════════════════════════════════════════════◆─┐');
  terminal.writeln('│                                                  │');
  terminal.writeln('│        🎵 JTrap Family Radio BBS 🎵               │');
  terminal.writeln('│                                                  │');
  terminal.writeln('└─◆══════════════════════════════════════════════◆─┘');
  terminal.writeln('');
  terminal.writeln('┌─◆ User Info ◆══════════════════════════════════◆─┐');
  const username = currentUser.username.padEnd(15);
  const userLevel = (currentUser.user_level ? currentUser.user_level.toUpperCase() : 'USER').padEnd(17);
  const lastLogin = (currentUser.last_login ? new Date(currentUser.last_login).toLocaleString() : 'First time!').padEnd(36);
  terminal.writeln(`│ User: ${username} │ Level: ${userLevel} │`);
  terminal.writeln(`│ Last Login: ${lastLogin} │`);
  terminal.writeln('└─◆══════════════════════════════════════════════◆─┘');
  terminal.writeln('');
  
  if (currentUser && currentUser.user_level === 'guest') {
    terminal.writeln('⚠️  GUEST ACCESS - Limited features available');
    terminal.writeln('');
  }
  
  terminal.writeln('┌─◆ Main Menu ◆══════════════════════════════════◆─┐');
  if (currentUser && currentUser.user_level !== 'guest') {
    terminal.writeln('│ [1] Message Boards     │ [3] Chat Room           │');
    terminal.writeln('│ [2] User Directory     │ [4] Change Password     │');
    terminal.writeln('│                        │ [5] Logout              │');
    terminal.writeln('│ [admin] First Admin Setup                      │');
    terminal.writeln('│ [refresh] Refresh User Data                    │');
  } else {
    terminal.writeln('│ [1] Message Boards     │ [3] Chat Room           │');
    terminal.writeln('│ [2] User Directory     │ [4] Logout              │');
    terminal.writeln('│                        │ [ ] (Register for more) │');
    terminal.writeln('│ [admin] First Admin Setup                      │');
    terminal.writeln('│ [refresh] Refresh User Data                    │');
  }
  terminal.writeln('└─◆══════════════════════════════════════════════◆─┘');
  terminal.writeln('');
  terminal.write('Select option (1-5, admin, or refresh): ');
  
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
      showChatRoom();
      break;
    case 'board':
      handleBoardMenu(command);
      break;
    case 'newmessage':
      handleNewMessage(command);
      break;
    default:
      terminal.writeln('\x1b[31mInvalid menu state!\x1b[0m');
  }
}

// Login Handler
async function handleLogin(command) {
  if (command.toLowerCase() === 'exit') {
    bbsMode = false;
    passwordMode = false; // Reset password mode
    terminal.clear();
    terminal.writeln('\x1b[32mWelcome to JTrap Family Radio Terminal!\x1b[0m');
    terminal.writeln('\x1b[33mType "help" for available commands.\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[36mAvailable commands:\x1b[0m');
    terminal.writeln('  help     - Show this help message');
    terminal.writeln('  time     - Show current time');
    terminal.writeln('  clear    - Clear the terminal');
    terminal.writeln('  bbs      - Access BBS system');
    terminal.writeln('');
    terminal.write('\x1b[1m\x1b[4m\x1b[32mjtrap@radio:~$\x1b[0m ');
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
      terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
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
          terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
          return;
        }
        
        currentUser = data;
        passwordAttempts = 0; // Reset password attempts for new user
        terminal.writeln(`\x1b[32mFound user: ${data.username}\x1b[0m`);
        passwordMode = true; // Set password mode for BBS login
        inputBuffer = ''; // Clear input buffer
        terminal.write('\x1b[1m\x1b[4m\x1b[32mPassword:\x1b[0m ');
      } catch (err) {
        console.error('Database error:', err);
        terminal.writeln('\x1b[31mDatabase error. Please try again.\x1b[0m');
        terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
        return;
      }
    } else {
      terminal.writeln('\x1b[31mDatabase not available. Please try again later.\x1b[0m');
      terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
    }
  } else {
    // Password input
    
    if (currentUser && (currentUser.password_hash === '' || currentUser.password_hash === command)) {
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
      passwordMode = false; // Reset password mode
      terminal.writeln('\x1b[32mLogin successful!\x1b[0m');
      setTimeout(() => showBBSMainMenu(), 1000);
    } else {
      passwordAttempts++;
      if (passwordAttempts < 3) {
        terminal.writeln(`\x1b[31mInvalid password. Try again (${passwordAttempts}/3 attempts).\x1b[0m`);
        passwordMode = true; // Set password mode for retry
        inputBuffer = ''; // Clear input buffer
        terminal.write('\x1b[1m\x1b[4m\x1b[32mPassword:\x1b[0m ');
      } else {
        terminal.writeln('\x1b[31mToo many failed attempts. Returning to login.\x1b[0m');
        terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
        currentUser = null;
        passwordAttempts = 0;
      }
    }
  }
}

// Registration Handler
function showRegistration() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        User Registration                     ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[33mCreate a new BBS account:\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[36m💡 Type "exit" to cancel\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
  
  currentMenu = 'register';
}

async function handleRegistration(command) {
  const lowerCommand = command.toLowerCase();
  if (lowerCommand === 'exit' || lowerCommand === 'back' || lowerCommand === 'cancel') {
    terminal.writeln('\x1b[33mReturning to login screen...\x1b[0m');
    currentUser = null; // Reset registration state
    passwordMode = false; // Reset password mode
    showBBSLogin();
    return;
  }
  
  if (!currentUser) {
    // Username input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mUsername cannot be empty. Try again or type "exit", "back", or "cancel" to return.\x1b[0m');
      terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
      return;
    }
    
    // Check if username is available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', command.toLowerCase());
        
        if (error) {
          console.error('Error checking username:', error);
          terminal.writeln('\x1b[31mDatabase error. Try again.\x1b[0m');
          terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
          return;
        }
        
        if (data && data.length > 0) {
          terminal.writeln('\x1b[31mUsername already taken. Try another.\x1b[0m');
          terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
          return;
        }
      } catch (err) {
        console.error('Error checking username:', err);
        terminal.writeln('\x1b[31mDatabase error. Try again.\x1b[0m');
        terminal.write('\x1b[1m\x1b[4m\x1b[32mUsername:\x1b[0m ');
        return;
      }
    }
    
    currentUser = { username: command.toLowerCase(), step: 'password' };
    terminal.writeln(`\x1b[32mUsername: ${command}\x1b[0m`);
    terminal.write('\x1b[1m\x1b[4m\x1b[32mPassword:\x1b[0m ');
  } else if (currentUser.step === 'password') {
    // Password input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mPassword cannot be empty. Try again or type "exit", "back", or "cancel" to return.\x1b[0m');
      terminal.write('\x1b[1m\x1b[4m\x1b[32mPassword:\x1b[0m ');
      return;
    }
    
    currentUser.password = command;
    currentUser.step = 'email';
    terminal.writeln('\x1b[32mPassword: [HIDDEN]\x1b[0m');
    terminal.write('\x1b[1m\x1b[4m\x1b[32mEmail:\x1b[0m ');
  } else if (currentUser.step === 'email') {
    // Email input
    if (command.trim() === '') {
      terminal.writeln('\x1b[31mEmail cannot be empty. Try again or type "exit", "back", or "cancel" to return.\x1b[0m');
      terminal.write('\x1b[1m\x1b[4m\x1b[32mEmail:\x1b[0m ');
      return;
    }
    
    currentUser.email = command;
    
    // Create user in Supabase
    if (supabase) {
      try {
        // Generate a UUID for the new user
        const userId = crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: userId,
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
          console.error('Registration error:', error);
          terminal.writeln('\x1b[31mRegistration failed: ' + error.message + '\x1b[0m');
          terminal.writeln('\x1b[33mUsing local account instead.\x1b[0m');
          currentUser.user_level = 'user';
          currentUser.last_login = new Date();
        } else {
          console.log('Registration successful:', data);
          currentUser = data;
          terminal.writeln('\x1b[32mRegistration successful!\x1b[0m');
        }
      } catch (err) {
        console.error('Registration exception:', err);
        terminal.writeln('\x1b[31mRegistration failed: ' + err.message + '\x1b[0m');
        terminal.writeln('\x1b[33mUsing local account instead.\x1b[0m');
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
      showUserDirectory();
      break;
    case '3':
      showChatRoom();
      break;
    case '4':
      if (currentUser && currentUser.user_level !== 'guest') {
        showChangePassword();
      } else {
        logout();
      }
      break;
    case 'admin':
      if (currentUser && currentUser.user_level === 'admin') {
        terminal.writeln('\x1b[33mAdmin promotion command available to admins only.\x1b[0m');
        terminal.writeln('\x1b[36mUse: promote <username> to promote a user to admin.\x1b[0m');
      } else if (currentUser && currentUser.username) {
        // Check if any admins exist first
        checkAndPromoteToFirstAdmin(currentUser.username);
      } else {
        terminal.writeln('\x1b[31mYou must be logged in to use admin commands.\x1b[0m');
      }
      break;
    case 'refresh':
      // Refresh user data from database
      refreshUserData();
      break;
    case '5':
      if (currentUser && currentUser.user_level !== 'guest') {
        logout();
      } else {
        terminal.writeln('\x1b[31mInvalid option! Please select 1-4.\x1b[0m');
        terminal.write('\x1b[32mSelect option (1-4): \x1b[0m');
      }
      break;
    default:
      const maxOption = (currentUser && currentUser.user_level !== 'guest') ? '5' : '4';
      terminal.writeln(`\x1b[31mInvalid option! Please select 1-${maxOption}.\x1b[0m`);
      terminal.write(`\x1b[32mSelect option (1-${maxOption}): \x1b[0m`);
  }
}

// Message Boards
async function showMessageBoards() {
  terminal.clear();
  terminal.writeln('╔══════════════════════════════════════════════════════════════╗');
  terminal.writeln('║                        Message Boards                        ║');
  terminal.writeln('╚══════════════════════════════════════════════════════════════╝');
  terminal.writeln('');
  
  if (currentUser && currentUser.user_level === 'guest') {
    terminal.writeln('Guest users can only view messages, not post new ones.');
    terminal.writeln('');
  }
  
  const boards = ['general', 'random', 'music', 'computer', 'prog', 'news'];
  terminal.writeln('╔═ Available Boards ════════════════════════════════════════════╗');
  
  if (supabase) {
    try {
      for (let i = 0; i < boards.length; i++) {
        const board = boards[i];
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('board', board);
        const msgCount = count || 0;
        const paddedBoard = `/${board}/`.padEnd(12);
        const paddedCount = `(${msgCount} msgs)`.padEnd(10);
        terminal.writeln(`║ [${i + 1}] ${paddedBoard} ${paddedCount} ║`);
      }
    } catch (err) {
      terminal.writeln('Error loading message counts.');
      boards.forEach((board, index) => {
        const paddedBoard = `/${board}/`.padEnd(12);
        terminal.writeln(`║ [${index + 1}] ${paddedBoard} (0 msgs)     ║`);
      });
    }
  } else {
    terminal.writeln('Database connection required.');
  }
  
  terminal.writeln('║ [0] Back to Main Menu                ║');
  terminal.writeln('╚═══════════════════════════════════════════════════════════╝');
  terminal.writeln('');
  terminal.write('Select board (0-6): ');
  
  currentMenu = 'messages';
}

// Show messages in a specific board
async function showBoardMessages(boardName) {
  terminal.clear();
  const title = `${boardName.toUpperCase()} BOARD`;
  const borderLength = Math.max(60, title.length + 4);
  const border = '═'.repeat(borderLength - 2);
  const padding = ' '.repeat(Math.max(0, Math.floor((borderLength - title.length - 2) / 2)));
  
  terminal.writeln(`\x1b[32m╔${border}╗\x1b[0m`);
  terminal.writeln(`\x1b[32m║${padding}${title}${padding}║\x1b[0m`);
  terminal.writeln(`\x1b[32m╚${border}╝\x1b[0m`);
  terminal.writeln('');
  
  if (supabase) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('board', boardName)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('BBS: Error loading messages:', error);
        terminal.writeln('\x1b[31mError loading messages: ' + error.message + '\x1b[0m');
      } else if (messages && messages.length > 0) {
        terminal.writeln('\x1b[35mRecent Messages:\x1b[0m');
        terminal.writeln('');
        
        // Get usernames for all messages
        const userIds = [...new Set(messages.map(msg => msg.author_id))];
        const { data: users } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);
        
        const userMap = {};
        if (users) {
          users.forEach(user => {
            userMap[user.id] = user.username;
          });
        }
        
        messages.forEach((msg, index) => {
          const date = new Date(msg.created_at).toLocaleDateString();
          const time = new Date(msg.created_at).toLocaleTimeString();
          const username = userMap[msg.author_id] || 'Unknown';
          const shortSubject = msg.subject.length > 35 ? msg.subject.substring(0, 35) + '...' : msg.subject;
          const shortContent = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
          
          terminal.writeln(`\x1b[36m[${index + 1}] \x1b[33m${shortSubject}\x1b[0m`);
          terminal.writeln(`     \x1b[37mBy: \x1b[32m${username}\x1b[37m | ${date}\x1b[0m`);
          terminal.writeln(`     \x1b[90m${'─'.repeat(50)}\x1b[0m`);
          terminal.writeln(`     \x1b[37m${shortContent}\x1b[0m`);
          terminal.writeln('');
        });
      } else {
        terminal.writeln('\x1b[33mNo messages in this board yet.\x1b[0m');
        terminal.writeln('');
      }
    } catch (err) {
      terminal.writeln('\x1b[31mError connecting to database.\x1b[0m');
    }
  } else {
    terminal.writeln('\x1b[31mDatabase connection required.\x1b[0m');
    terminal.writeln('');
  }
  
  terminal.writeln('\x1b[35mOptions:\x1b[0m');
  terminal.writeln('\x1b[36m  [1-20] View message details\x1b[0m');
  if (currentUser && currentUser.user_level !== 'guest') {
    terminal.writeln('\x1b[36m  [N] New message\x1b[0m');
  }
  terminal.writeln('\x1b[36m  [0] Back to boards\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[1m\x1b[4m\x1b[32mSelect option:\x1b[0m ');
  
  currentMenu = 'board';
  // Store the current board name for new message creation
  window.currentBoard = boardName;
}

// Handle board menu commands
function handleBoardMenu(command) {
  if (command === '0') {
    showMessageBoards();
  } else if (command.toLowerCase() === 'n' && currentUser && currentUser.user_level !== 'guest') {
    // Get the current board name from the URL or context
    const currentBoard = window.currentBoard || 'general';
    showNewMessageForm(currentBoard);
  } else if (command >= '1' && command <= '20') {
    // View message details (placeholder for now)
    terminal.writeln('\x1b[33mMessage viewing feature coming soon!\x1b[0m');
    terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
  } else {
    terminal.writeln('\x1b[31mInvalid option!\x1b[0m');
    terminal.write('\x1b[32mSelect option: \x1b[0m');
  }
}

// New Message Form
function showNewMessageForm(boardName = 'general') {
  terminal.clear();
  terminal.writeln('\x1b[1m\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[1m\x1b[32m║                        \x1b[4mNEW MESSAGE\x1b[0m\x1b[1m\x1b[32m                           ║\x1b[0m');
  terminal.writeln('\x1b[1m\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln(`\x1b[33mCreating new message in /${boardName}/ board...\x1b[0m`);
  terminal.writeln('\x1b[36m💡 Type "cancel" or "exit" to abort\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[1m\x1b[4m\x1b[32mSubject:\x1b[0m ');
  
  currentMenu = 'newmessage';
  inputBuffer = '';
  // Store the board name for later use
  window.currentBoard = boardName;
}

// Handle new message creation
function handleNewMessage(command) {
  const cancelCommands = ['cancel', 'abort', 'exit', 'quit', 'stop'];
  if (cancelCommands.includes(command.toLowerCase())) {
    terminal.writeln('\x1b[33mMessage creation cancelled.\x1b[0m');
    showBBSMainMenu();
    return;
  }
  
  if (!inputBuffer || inputBuffer === '') {
    // First input is subject
    inputBuffer = command;
    terminal.writeln(`\x1b[33mSubject: ${command}\x1b[0m`);
    terminal.writeln('');
    terminal.write('\x1b[1m\x1b[4m\x1b[32mMessage content (type "END" to finish):\x1b[0m ');
  } else if (command.toLowerCase() === 'end') {
    // Save the message
    const subject = inputBuffer.split('\n')[0];
    const content = inputBuffer.split('\n').slice(1).join('\n');
    saveNewMessage(subject, content);
    inputBuffer = '';
  } else {
    // Continue collecting content
    if (inputBuffer.includes('\n')) {
      inputBuffer += '\n' + command;
    } else {
      inputBuffer = inputBuffer + '\n' + command;
    }
    terminal.writeln('\x1b[36m💡 Type "END" to finish, "cancel" to abort\x1b[0m');
    terminal.write('\x1b[32m> \x1b[0m');
  }
}

// Save new message to database
async function saveNewMessage(subject, content) {
  if (!supabase) {
    terminal.writeln('\x1b[31mDatabase connection required to post messages.\x1b[0m');
    terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
    return;
  }
  
  const boardName = window.currentBoard || 'general';
  
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        subject: subject,
        content: content,
        author_id: currentUser.id,
        board: boardName,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('BBS: Error saving message:', error);
      terminal.writeln('\x1b[31mError saving message: ' + error.message + '\x1b[0m');
    } else {
      console.log('BBS: Message saved successfully');
      terminal.writeln('\x1b[32mMessage posted successfully to /' + boardName + '/!\x1b[0m');
    }
  } catch (err) {
    terminal.writeln('\x1b[31mError connecting to database: ' + err.message + '\x1b[0m');
  }
  
  terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
}

// File Downloads
async function showFileDownloads() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                        File Downloads                        ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  if (currentUser && currentUser.user_level === 'guest') {
    terminal.writeln('\x1b[33mGuest users can only view file listings, not download files.\x1b[0m');
    terminal.writeln('');
  }
  
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
  terminal.writeln('\x1b[32m║                        User Directory                        ║\x1b[0m');
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

// Chat History Management
async function cleanupOldChatMessages() {
  if (!supabase) return;
  
  try {
    // Get total count of messages
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });
    
    // If we have more than 100 messages, delete the oldest ones
    if (count && count > 100) {
      const messagesToDelete = count - 100;
      
      // Get the oldest messages to delete
      const { data: oldMessages } = await supabase
        .from('chat_messages')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(messagesToDelete);
      
      if (oldMessages && oldMessages.length > 0) {
        const idsToDelete = oldMessages.map(msg => msg.id);
        
        // Delete the old messages
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .in('id', idsToDelete);
        
        if (error) {
          console.warn('Failed to cleanup old chat messages:', error);
        } else {
          console.log(`Cleaned up ${idsToDelete.length} old chat messages`);
        }
      }
    }
  } catch (err) {
    console.warn('Error during chat cleanup:', err);
  }
}


// BBS Chat Room - Custom Chat Interface
async function showChatRoom() {
  console.log('showChatRoom called');
  
  // Hide the terminal and show custom chat interface
  const terminalContainer = document.getElementById('terminal');
  const chatContainer = document.getElementById('bbs-chat-container');
  
  console.log('Terminal container:', terminalContainer);
  console.log('Existing chat container:', chatContainer);
  
  if (terminalContainer) {
    terminalContainer.style.display = 'none';
    console.log('Terminal hidden');
  }
  
  // Create chat container if it doesn't exist
  if (!chatContainer) {
    console.log('Creating new chat container...');
    createChatContainer();
    console.log('Chat container created');
  } else {
    console.log('Showing existing chat container');
    chatContainer.style.display = 'block';
  }
  
  // Set up BBS Chat Client with user's nickname
  if (window.bbsChatClient && currentUser) {
    window.bbsChatClient.setNickname(currentUser.username);
  }
  
  // Load recent chat messages
  console.log('Loading recent chat messages...');
  await loadRecentChatMessages();
  
  // Show help messages
  console.log('Adding help messages...');
  addChatMessage('system', 'BBS Chat Commands:');
  addChatMessage('system', '/who - Show who\'s online');
  addChatMessage('system', '/clear - Clear the chat screen');
  addChatMessage('system', '/time - Show current time');
  addChatMessage('system', '/help - Show this help');
  addChatMessage('system', '/exit - Return to BBS menu');
  addChatMessage('system', 'Just type to chat with other users!');
  console.log('Help messages added');
  
  // Focus the chat input
  const chatInput = document.getElementById('bbs-chat-input');
  if (chatInput) {
    chatInput.focus();
  }
  
  currentMenu = 'chat';
}

// Create custom chat container with users sidebar
function createChatContainer() {
  console.log('createChatContainer called');
  const terminalWindow = document.getElementById('terminalWindow');
  console.log('Terminal window found:', terminalWindow);
  if (!terminalWindow) {
    console.error('Terminal window not found!');
    return;
  }
  
  const chatContainer = document.createElement('div');
  chatContainer.id = 'bbs-chat-container';
  chatContainer.style.cssText = `
    position: absolute;
    top: 28px;
    left: 0;
    right: 0;
    bottom: 0;
    background: #282828;
    color: #ebdbb2;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    display: flex;
    padding: 8px;
    box-sizing: border-box;
  `;

  // Create main chat area (messages + input)
  const chatMainArea = document.createElement('div');
  chatMainArea.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-right: 8px;
  `;
  
  // Chat messages area
  const chatMessages = document.createElement('div');
  chatMessages.id = 'bbs-chat-messages';
  chatMessages.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    background: #3c3836;
    border: 1px inset #665c54;
    margin-bottom: 8px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    line-height: 1.4;
  `;
  chatMainArea.appendChild(chatMessages);
  
  // Chat input area
  const chatInputArea = document.createElement('div');
  chatInputArea.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    background: #3c3836;
    border: 2px inset #665c54;
    padding: 4px;
  `;
  
  const chatPrompt = document.createElement('span');
  chatPrompt.style.cssText = `
    color: #b8bb26;
    font-weight: bold;
  `;
  chatPrompt.textContent = '> ';
  chatInputArea.appendChild(chatPrompt);
  
  const chatInput = document.createElement('input');
  chatInput.id = 'bbs-chat-input';
  chatInput.type = 'text';
  chatInput.style.cssText = `
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #ebdbb2;
    font-family: 'Courier New', monospace;
    font-size: 11px;
  `;
  chatInput.placeholder = 'Type your message...';
  
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const message = chatInput.value.trim();
      if (message) {
        // Check for BBS commands first
        if (message === 'admin' || message === 'exit' || message === 'logout') {
          handleBBSCommand(message);
        } else {
          handleChatMessage(message);
        }
        chatInput.value = '';
      }
    }
  });
  
  chatInputArea.appendChild(chatInput);
  chatMainArea.appendChild(chatInputArea);

  // Create users sidebar
  const usersSidebar = document.createElement('div');
  usersSidebar.id = 'bbs-users-sidebar';
  usersSidebar.style.cssText = `
    width: 150px;
    min-width: 150px;
    max-width: 150px;
    background: #3c3836;
    border: 1px inset #665c54;
    display: flex;
    flex-direction: column;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    flex-shrink: 0;
  `;

  // Users header
  const usersHeader = document.createElement('div');
  usersHeader.style.cssText = `
    background: #504945;
    border-bottom: 1px solid #665c54;
    border-top: 1px solid #504945;
    border-left: 1px solid #504945;
    border-right: 1px solid #504945;
    padding: 4px 8px;
    font-weight: bold;
    color: #ebdbb2;
    text-align: center;
    font-size: 10px;
  `;
  usersHeader.textContent = 'ONLINE USERS';

  // Users list
  const usersList = document.createElement('div');
  usersList.id = 'bbs-users-list';
  usersList.style.cssText = `
    flex: 1;
    padding: 4px;
    overflow-y: auto;
  `;

  // User count
  const userCount = document.createElement('div');
  userCount.id = 'bbs-user-count';
  userCount.style.cssText = `
    background: #282828;
    border-top: 1px solid #665c54;
    border-bottom: 1px solid #282828;
    border-left: 1px solid #282828;
    border-right: 1px solid #282828;
    padding: 4px 8px;
    font-size: 9px;
    color: #ebdbb2;
    text-align: center;
  `;
  userCount.textContent = '0 users online';

  // Assemble users sidebar
  usersSidebar.appendChild(usersHeader);
  usersSidebar.appendChild(usersList);
  usersSidebar.appendChild(userCount);

  // Assemble the main UI
  chatContainer.appendChild(chatMainArea);
  chatContainer.appendChild(usersSidebar);
  
  terminalWindow.appendChild(chatContainer);
  console.log('Chat container added to terminal window');
  
  // Refresh user data to get latest admin status
  if (currentUser) {
    refreshUserData();
  }
  
  // Add current user to the users list
  addUserToSidebar(currentUser ? currentUser.username : 'Guest');
  console.log('Current user added to sidebar:', currentUser ? currentUser.username : 'Guest');
}

// Add user to the sidebar
function addUserToSidebar(username) {
  const usersList = document.getElementById('bbs-users-list');
  const userCount = document.getElementById('bbs-user-count');
  
  if (!usersList || !userCount) return;

  // Check if user already exists
  const existingUser = usersList.querySelector(`[data-username="${username}"]`);
  if (existingUser) return;

  const userDiv = document.createElement('div');
  userDiv.setAttribute('data-username', username);
  userDiv.style.cssText = `
    padding: 2px 4px;
    margin: 1px 0;
    border-radius: 2px;
    font-size: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
  `;

  // Add status indicator
  const statusDot = document.createElement('span');
  statusDot.style.cssText = `
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #b8bb26;
    flex-shrink: 0;
  `;

  // Add username with admin badge if applicable
  const usernameSpan = document.createElement('span');
  const isAdmin = currentUser && currentUser.username === username && currentUser.user_level === 'admin';
  usernameSpan.textContent = isAdmin ? `@${username}` : username;
  usernameSpan.style.cssText = `
    color: ${isAdmin ? '#fb4934' : '#b8bb26'};
    font-weight: bold;
  `;

  userDiv.appendChild(statusDot);
  userDiv.appendChild(usernameSpan);
  usersList.appendChild(userDiv);

  // Update user count
  const userCountNum = usersList.children.length;
  userCount.textContent = `${userCountNum} user${userCountNum !== 1 ? 's' : ''} online`;
}

// Check if any admins exist and promote if none do
async function checkAndPromoteToFirstAdmin(username) {
  if (!supabase) {
    terminal.writeln('\x1b[31mDatabase connection required for admin promotion.\x1b[0m');
    return;
  }

  try {
    // Check if any admins exist
    const { data: admins, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('user_level', 'admin');

    if (checkError) {
      console.error('Admin check error:', checkError);
      terminal.writeln('\x1b[31mFailed to check for existing admins: ' + checkError.message + '\x1b[0m');
      return;
    }

    if (admins && admins.length > 0) {
      terminal.writeln('\x1b[31mAdmin users already exist. Only existing admins can promote users.\x1b[0m');
      terminal.writeln('\x1b[33mContact an admin to be promoted: ' + admins.map(a => a.username).join(', ') + '\x1b[0m');
      return;
    }

    // No admins exist, allow self-promotion
    terminal.writeln('\x1b[33mNo admin users found. Promoting you to first admin...\x1b[0m');
    await promoteToAdmin(username);
  } catch (err) {
    console.error('Admin check exception:', err);
    terminal.writeln('\x1b[31mError checking for admins: ' + err.message + '\x1b[0m');
  }
}

// Refresh user data from database
async function refreshUserData() {
  if (!supabase || !currentUser) {
    terminal.writeln('\x1b[31mNo user logged in to refresh.\x1b[0m');
    return;
  }

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', currentUser.username)
      .single();

    if (error) {
      console.error('User refresh error:', error);
      terminal.writeln('\x1b[31mFailed to refresh user data: ' + error.message + '\x1b[0m');
    } else if (userData) {
      // Update current user object
      Object.assign(currentUser, userData);
      terminal.writeln('\x1b[32mUser data refreshed successfully!\x1b[0m');
      terminal.writeln('\x1b[33mUser level: ' + currentUser.user_level + '\x1b[0m');
      
      // Update admin badge in chat if visible
      updateAdminBadgeInChat();
    }
  } catch (err) {
    console.error('User refresh exception:', err);
    terminal.writeln('\x1b[31mError refreshing user data: ' + err.message + '\x1b[0m');
  }
}

// Update admin badge in chat
function updateAdminBadgeInChat() {
  const usersList = document.getElementById('bbs-users-list');
  if (!usersList || !currentUser) return;

  // Find current user in the sidebar
  const userDiv = usersList.querySelector(`[data-username="${currentUser.username}"]`);
  if (userDiv) {
    // Remove existing admin badge
    const existingBadge = userDiv.querySelector('.admin-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    // Add admin badge if user is admin
    if (currentUser.user_level === 'admin') {
      const adminBadge = document.createElement('span');
      adminBadge.className = 'admin-badge';
      adminBadge.textContent = '@';
      adminBadge.style.cssText = `
        color: #f92672;
        font-weight: bold;
        font-size: 8px;
        margin-right: 4px;
      `;
      userDiv.insertBefore(adminBadge, userDiv.firstChild);
    }
  }
}

// Promote user to admin
async function promoteToAdmin(username) {
  if (!supabase) {
    terminal.writeln('\x1b[31mDatabase connection required for admin promotion.\x1b[0m');
    return;
  }

  try {
    // Update user level to admin
    const { error } = await supabase
      .from('users')
      .update({ user_level: 'admin' })
      .eq('username', username);

    if (error) {
      console.error('Admin promotion error:', error);
      terminal.writeln('\x1b[31mFailed to promote to admin: ' + error.message + '\x1b[0m');
    } else {
      terminal.writeln('\x1b[32mSuccessfully promoted ' + username + ' to admin!\x1b[0m');
      terminal.writeln('\x1b[33mPlease log out and log back in to activate admin privileges.\x1b[0m');
      
      // Update current user object
      if (currentUser && currentUser.username === username) {
        currentUser.user_level = 'admin';
      }
    }
  } catch (err) {
    console.error('Admin promotion exception:', err);
    terminal.writeln('\x1b[31mError promoting to admin: ' + err.message + '\x1b[0m');
  }
}

// Handle chat messages
async function handleChatMessage(message) {
  if (message.toLowerCase() === '/exit' || message.toLowerCase() === 'exit') {
    exitChatRoom();
    return;
  }
  
  if (message.toLowerCase() === '/help') {
    addChatMessage('system', 'BBS Chat Commands:');
    addChatMessage('system', '/who - Show who\'s online');
    addChatMessage('system', '/clear - Clear the chat screen');
    addChatMessage('system', '/time - Show current time');
    addChatMessage('system', '/help - Show this help');
    addChatMessage('system', '/exit - Return to BBS menu');
    addChatMessage('system', 'Just type to chat with other users!');
    return;
  }
  
  if (message.toLowerCase() === '/who') {
    addChatMessage('system', 'Users in BBS Chat:');
    addChatMessage('system', `${currentUser ? currentUser.username : 'Guest'} (you)`);
    addChatMessage('system', '(Real-time user presence coming soon!)');
    return;
  }
  
  if (message.toLowerCase() === '/clear') {
    const chatMessages = document.getElementById('bbs-chat-messages');
    if (chatMessages) {
      chatMessages.innerHTML = '';
    }
    addChatMessage('system', 'Chat screen cleared.');
    return;
  }
  
  if (message.toLowerCase() === '/time') {
    const now = new Date();
    addChatMessage('system', `Current time: ${now.toLocaleString()}`);
    return;
  }
  
  // Send chat message
  if (currentUser && currentUser.user_level === 'guest') {
    addChatMessage('system', 'Guest users cannot send messages.');
    return;
  }
  
  if (supabase) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: currentUser.id,
          content: message,
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        addChatMessage('error', 'Error sending message.');
      } else {
        // Show the message immediately
        addChatMessage('user', message, currentUser.username);
      }
    } catch (err) {
      addChatMessage('error', 'Error sending message.');
    }
  } else {
    addChatMessage('system', 'Chat not available. Message not sent.');
  }
}

// Add message to chat display
function addChatMessage(type, message, username = null, customTime = null) {
  const chatMessages = document.getElementById('bbs-chat-messages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    margin-bottom: 2px;
    word-wrap: break-word;
  `;
  
  const time = customTime || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  if (type === 'system') {
    messageDiv.innerHTML = `<span style="color: #83a598;">*** ${message}</span>`;
  } else if (type === 'error') {
    messageDiv.innerHTML = `<span style="color: #fb4934;">*** ${message}</span>`;
  } else if (type === 'user') {
    messageDiv.innerHTML = `<span style="color: #928374;">${time}</span> <span style="color: #b8bb26;">&lt;${username}&gt;</span> <span style="color: #ebdbb2;">${message}</span>`;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Exit chat room
function exitChatRoom() {
  const terminalContainer = document.getElementById('terminal');
  const chatContainer = document.getElementById('bbs-chat-container');
  
  if (terminalContainer) {
    terminalContainer.style.display = 'block';
  }
  
  if (chatContainer) {
    chatContainer.style.display = 'none';
  }
  
  currentMenu = 'main';
  showBBSMainMenu();
}

// Load recent chat messages for seamless BBS experience
async function loadRecentChatMessages() {
  if (supabase) {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        addChatMessage('error', 'Error loading chat history.');
        return;
      }
      
      if (messages && messages.length > 0) {
        // Get usernames for chat messages
        const userIds = [...new Set(messages.map(msg => msg.user_id))];
        const { data: users } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);
        
        const userMap = {};
        if (users) {
          users.forEach(user => {
            userMap[user.id] = user.username;
          });
        }
        
        // Display recent messages
        addChatMessage('system', 'Recent Chat Activity:');
        messages.reverse().forEach(msg => {
          const author = userMap[msg.user_id] || 'Unknown';
          const time = new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          addChatMessage('user', msg.content, author, time);
        });
        addChatMessage('system', 'Chat is now active! Start typing to chat with other users...');
      } else {
        addChatMessage('system', 'No recent chat activity. Be the first to chat!');
        addChatMessage('system', 'Chat is now active! Start typing to chat with other users...');
      }
    } catch (err) {
      addChatMessage('error', 'Error loading chat history.');
    }
  } else {
    addChatMessage('system', 'Chat history not available.');
    addChatMessage('system', 'Chat is now active! Start typing to chat with other users...');
  }
}

// Change Password
function showChangePassword() {
  terminal.clear();
  terminal.writeln('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[32m║                      Change Password                         ║\x1b[0m');
  terminal.writeln('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  
  terminal.writeln('\x1b[33mPassword change feature coming soon!\x1b[0m');
  terminal.writeln('\x1b[36m  [0] Back to Main Menu\x1b[0m');
  terminal.writeln('');
  terminal.write('\x1b[32mPress 0 to return: \x1b[0m');
  
}

// Logout
function logout() {
  terminal.clear();
  passwordMode = false; // Reset password mode
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
    terminal.writeln('  time     - Show current time');
    terminal.writeln('  clear    - Clear the terminal');
    terminal.writeln('  bbs      - Access BBS system');
    terminal.writeln('');
    terminal.write('\x1b[1m\x1b[4m\x1b[32mjtrap@radio:~$\x1b[0m ');
  }, 2000);
}

// Menu Handlers
function handleMessageMenu(command) {
  if (command === '0') {
    showBBSMainMenu();
  } else if (command >= '1' && command <= '6') {
    const boards = ['general', 'random', 'music', 'computer', 'prog', 'news'];
    const boardIndex = parseInt(command) - 1;
    const selectedBoard = boards[boardIndex];
    showBoardMessages(selectedBoard);
  } else {
    terminal.writeln('\x1b[31mInvalid option! Please select 0-6.\x1b[0m');
    terminal.write('\x1b[1m\x1b[4m\x1b[32mSelect board (0-6):\x1b[0m ');
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
  if (command.toLowerCase() === '/exit' || command.toLowerCase() === 'exit') {
    terminal.writeln('\x1b[36m*** Leaving BBS Chat Room...\x1b[0m');
    showBBSMainMenu();
  } else if (command.toLowerCase() === '/help') {
    terminal.writeln('\x1b[36m*** BBS Chat Commands:\x1b[0m');
    terminal.writeln('\x1b[36m***   /who     - Show who\'s online\x1b[0m');
    terminal.writeln('\x1b[36m***   /clear   - Clear the chat screen\x1b[0m');
    terminal.writeln('\x1b[36m***   /time    - Show current time\x1b[0m');
    terminal.writeln('\x1b[36m***   /help    - Show this help\x1b[0m');
    terminal.writeln('\x1b[36m***   /exit    - Return to BBS menu\x1b[0m');
    terminal.writeln('\x1b[36m***   Just type to chat with other users!\x1b[0m');
  } else if (command.toLowerCase() === '/who') {
    terminal.writeln('\x1b[36m*** Users in BBS Chat:\x1b[0m');
    terminal.writeln(`\x1b[32m***   ${currentUser ? currentUser.username : 'Guest'} (you)\x1b[0m`);
    terminal.writeln('\x1b[33m***   (Real-time user presence coming soon!)\x1b[0m');
  } else if (command.toLowerCase() === '/clear') {
    terminal.clear();
    terminal.writeln('\x1b[1m\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[1m\x1b[32m║                        \x1b[4mBBS Chat Room\x1b[0m\x1b[1m\x1b[32m                        ║\x1b[0m');
    terminal.writeln('\x1b[1m\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[36m*** Chat screen cleared.\x1b[0m');
  } else if (command.toLowerCase() === '/time') {
    const now = new Date();
    terminal.writeln(`\x1b[36m*** Current time: ${now.toLocaleString()}\x1b[0m`);
  } else if (command.trim() !== '') {
    // Send chat message
    if (currentUser && currentUser.user_level === 'guest') {
      terminal.writeln('\x1b[33m*** Guest users cannot send messages.\x1b[0m');
    } else if (supabase) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert([{
            user_id: currentUser.id,
            content: command,
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          terminal.writeln('\x1b[31m*** Error sending message.\x1b[0m');
        } else {
          // Show the message immediately in BBS style - use write instead of writeln for chat flow
          const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          terminal.write(`\x1b[90m${time}\x1b[0m \x1b[32m<${currentUser.username}>\x1b[0m ${command}\r\n`);
        }
      } catch (err) {
        terminal.writeln('\x1b[31m*** Error sending message.\x1b[0m');
      }
    } else {
      terminal.writeln('\x1b[33m*** Chat not available. Message not sent.\x1b[0m');
    }
  }
  
  // Always show the prompt after any command
  terminal.write(`\x1b[32m<${currentUser ? currentUser.username : 'Guest'}>\x1b[0m `);
}


// Function to reinitialize Supabase
function reinitSupabase() {
  if (initSupabase()) {
    console.log('BBS: Supabase reinitialized successfully');
    return true;
  }
  console.log('BBS: Supabase reinitialization failed');
  return false;
}

// Export functions for use in main script (immediately)
try {
  console.log('Initializing BBS system...');
  window.BBS = {
    showBBSLogin,
    handleBBSCommand,
    bbsMode: () => bbsMode,
    setBBSMode: (mode) => { bbsMode = mode; },
    reinitSupabase,
    isPasswordMode: () => isPasswordMode(),
    handlePasswordInput: (data) => {
      if (data === '\r') {
        const password = inputBuffer;
        inputBuffer = '';
        passwordMode = false;
        return password;
      } else if (data === '\u007f' || data === '\b') {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          terminal.write('\b \b');
        }
        return null;
      } else if (data.length === 1 && data >= ' ') {
        inputBuffer += data;
        terminal.write('*');
        return null;
      }
      return null;
    }
  };
  console.log('BBS system initialized successfully');
} catch (error) {
  console.error('BBS: Error exporting functions:', error);
}

// Initialize Supabase when BBS system loads (with delay)
setTimeout(() => {
  if (initSupabase()) {
    console.log('BBS: Supabase initialized on load');
  } else {
    console.log('BBS: Supabase not available on load, will retry later');
  }
}, 100);

// System ready
console.log('🎉 BBS: System ready');

} catch (error) {
  console.error('BBS: Critical error during loading:', error);
  console.error('BBS: Stack trace:', error.stack);
  
  // Create a minimal fallback BBS
  window.BBS = {
    showBBSLogin: () => console.log('BBS: Fallback mode - BBS not available'),
    handleBBSCommand: () => console.log('BBS: Fallback mode - BBS not available'),
    bbsMode: () => false,
    setBBSMode: () => {},
    reinitSupabase: () => false
  };
}
