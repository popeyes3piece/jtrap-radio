// Local BBS System - Works without database
// This is a temporary workaround while the database schema is being fixed


// Local user storage
let localUsers = [
  { username: 'admin', password: 'admin', user_level: 'sysop', email: 'admin@jtrap.live' },
  { username: 'guest', password: '', user_level: 'user', email: 'guest@jtrap.live' }
];

let currentUser = null;
let bbsMode = false;
let currentMenu = 'main';
let inputBuffer = '';

// BBS Login Screen
function showBBSLogin() {
  terminal.clear();
  terminal.writeln('\x1b[33m╔══════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[33m║                JTRAP FAMILY RADIO                    ║\x1b[0m');
  terminal.writeln('\x1b[33m╠══════════════════════════════════════════════════════╣\x1b[0m');
  terminal.writeln('\x1b[33m║                                                      ║\x1b[0m');
  terminal.writeln('\x1b[33m║         Welcome to the Bulletin Board System         ║\x1b[0m');
  terminal.writeln('\x1b[33m║                                                      ║\x1b[0m');
  terminal.writeln('\x1b[33m╚══════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[33m╔══════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[33m║                Login Instructions                    ║\x1b[0m');
  terminal.writeln('\x1b[33m╠══════════════════════════════════════════════════════╣\x1b[0m');
  terminal.writeln('\x1b[33m║                                                      ║\x1b[0m');
  terminal.writeln('\x1b[33m║  • Type your username and password to login          ║\x1b[0m');
  terminal.writeln('\x1b[33m║  • Type "register" to create a new account           ║\x1b[0m');
  terminal.writeln('\x1b[33m║  • Type "exit" to return to main terminal            ║\x1b[0m');
  terminal.writeln('\x1b[33m║                                                      ║\x1b[0m');
  terminal.writeln('\x1b[33m╚══════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln('Available users: admin/admin, guest/(no password)');
  terminal.writeln('');
  terminal.write('\x1b[32mUsername: \x1b[0m');
  
  bbsMode = true;
  currentMenu = 'login';
}

// Handle BBS commands
function handleBBSCommand(command) {
  if (!bbsMode) return;
  
  if (currentMenu === 'login') {
    handleLogin(command);
  } else if (currentMenu === 'main') {
    handleMainMenu(command);
  }
}

// Handle login
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
  
  if (command.toLowerCase() === 'register') {
    terminal.writeln('\x1b[31mRegistration not available in local mode.\x1b[0m');
    terminal.writeln('\x1b[33mUse: admin/admin or guest/(no password)\x1b[0m');
    terminal.write('\x1b[32mUsername: \x1b[0m');
    return;
  }
  
  if (!currentUser) {
    // Username input
    const user = localUsers.find(u => u.username === command.toLowerCase());
    if (user) {
      currentUser = user;
      terminal.writeln(`\x1b[32mFound user: ${user.username}\x1b[0m`);
      terminal.write('\x1b[32mPassword: \x1b[0m');
    } else {
      terminal.writeln('\x1b[31mUser not found. Try admin or guest.\x1b[0m');
      terminal.write('\x1b[32mUsername: \x1b[0m');
    }
  } else {
    // Password input
    if (currentUser.password === '' || currentUser.password === command) {
      terminal.writeln('\x1b[32mLogin successful!\x1b[0m');
      terminal.writeln(`\x1b[33mWelcome, ${currentUser.username}!\x1b[0m`);
      showMainMenu();
    } else {
      terminal.writeln('\x1b[31mInvalid password. Try again.\x1b[0m');
      terminal.write('\x1b[32mPassword: \x1b[0m');
    }
  }
}

// Show main menu
function showMainMenu() {
  terminal.clear();
  terminal.writeln('\x1b[33m╔══════════════════════════════════════════════════════╗\x1b[0m');
  terminal.writeln('\x1b[33m║                JTRAP FAMILY RADIO BBS               ║\x1b[0m');
  terminal.writeln('\x1b[33m╠══════════════════════════════════════════════════════╣\x1b[0m');
  terminal.writeln('\x1b[33m║                                                      ║\x1b[0m');
  terminal.writeln('\x1b[33m║  Welcome to the Bulletin Board System!              ║\x1b[0m');
  terminal.writeln('\x1b[33m║                                                      ║\x1b[0m');
  terminal.writeln('\x1b[33m╚══════════════════════════════════════════════════════╝\x1b[0m');
  terminal.writeln('');
  terminal.writeln('\x1b[36mMain Menu:\x1b[0m');
  terminal.writeln('  1. Message Boards');
  terminal.writeln('  2. File Downloads');
  terminal.writeln('  3. User Directory');
  terminal.writeln('  4. Chat System');
  terminal.writeln('  5. Change Password');
  terminal.writeln('  6. Logout');
  terminal.writeln('');
  terminal.write('\x1b[32mSelect option (1-6): \x1b[0m');
  
  currentMenu = 'main';
}

// Handle main menu
function handleMainMenu(command) {
  switch (command) {
    case '1':
      terminal.writeln('\x1b[33mMessage Boards - Coming soon!\x1b[0m');
      terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
      break;
    case '2':
      terminal.writeln('\x1b[33mFile Downloads - Coming soon!\x1b[0m');
      terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
      break;
    case '3':
      terminal.writeln('\x1b[33mUser Directory - Coming soon!\x1b[0m');
      terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
      break;
    case '4':
      terminal.writeln('\x1b[33mChat System - Coming soon!\x1b[0m');
      terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
      break;
    case '5':
      terminal.writeln('\x1b[33mChange Password - Coming soon!\x1b[0m');
      terminal.write('\x1b[32mPress Enter to continue: \x1b[0m');
      break;
    case '6':
      currentUser = null;
      bbsMode = false;
      terminal.clear();
      terminal.writeln('\x1b[32mLogged out successfully!\x1b[0m');
      terminal.writeln('\x1b[33mType "help" for available commands.\x1b[0m');
      terminal.write('\x1b[32mjtrap@radio:~$ \x1b[0m');
      break;
    default:
      terminal.writeln('\x1b[31mInvalid option. Please select 1-6.\x1b[0m');
      terminal.write('\x1b[32mSelect option (1-6): \x1b[0m');
  }
}

// Only export if Supabase BBS is not available
if (!window.BBS || !window.BBS.reinitSupabase) {
  // Export functions
  window.BBS = {
    showBBSLogin,
    handleBBSCommand,
    bbsMode: () => bbsMode,
    setBBSMode: (mode) => { bbsMode = mode; },
    reinitSupabase: () => false
  };
}
