/**
 * BBS Chat Manager
 * Handles all chat functionality including UI, messaging, and Supabase integration
 */

class ChatManager {
  constructor(supabaseClient, currentUser) {
    this.supabase = supabaseClient;
    this.currentUser = currentUser;
    this.chatContainer = null;
    this.isVisible = false;
    this.messageLimit = 100; // Keep costs low
    this.realTimeSubscription = null;
    this.presenceSubscription = null;
    this.onlineUsers = new Map(); // Track online users
    this.userActivityTimeout = 0; // No auto-removal of users
  }

  /**
   * Initialize the chat system
   */
  async initialize() {
    console.log('ChatManager: Initializing...');
    
    // Set up real-time subscription for new messages
    if (this.supabase) {
      this.setupRealTimeSubscription();
      this.setupPresenceTracking();
    }
    
    // Clean up old messages to keep costs down
    await this.cleanupOldMessages();
  }

  /**
   * Show the chat room interface
   */
  async showChatRoom() {
    console.log('ChatManager: showChatRoom called');
    
    // Hide terminal and show chat
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
      terminalContainer.style.display = 'none';
      console.log('ChatManager: Terminal hidden');
    }

    // Create or show chat container
    if (!this.chatContainer) {
      console.log('ChatManager: Creating new chat container');
      this.createChatContainer();
    } else {
      console.log('ChatManager: Showing existing chat container');
      this.chatContainer.style.display = 'block';
    }

    this.isVisible = true;

    // Set up BBS Chat Client with user's nickname
    if (window.bbsChatClient && this.currentUser) {
      window.bbsChatClient.setNickname(this.currentUser.username);
    }

    // Load recent messages
    await this.loadRecentMessages();

    // Show help
    this.addSystemMessage('BBS Chat Commands:');
    this.addSystemMessage('/who - Show who\'s online');
    this.addSystemMessage('/clear - Clear the chat screen');
    this.addSystemMessage('/time - Show current time');
    if (this.currentUser && this.currentUser.user_level === 'admin') {
      this.addSystemMessage('/admin - Admin commands');
    }
    this.addSystemMessage('Just type to chat with other users!');
    this.addSystemMessage('DEBUG: Chat container should show two columns - chat on left, users on right');

    // Focus input
    const chatInput = document.getElementById('bbs-chat-input');
    if (chatInput) {
      chatInput.focus();
    }
  }

  /**
   * Hide the chat room
   */
  hideChatRoom() {
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
      terminalContainer.style.display = 'block';
    }

    if (this.chatContainer) {
      this.chatContainer.style.display = 'none';
    }

    this.isVisible = false;
  }

  /**
   * Create the chat container UI
   */
  createChatContainer() {
    const terminalWindow = document.getElementById('terminal-window');
    if (!terminalWindow) {
      console.error('ChatManager: terminal-window not found');
      return;
    }
    console.log('ChatManager: Creating chat container...');

    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'bbs-chat-container';
    this.chatContainer.style.cssText = `
      position: absolute;
      top: 28px;
      left: 0;
      right: 0;
      bottom: 0;
      background: #1a1a1a;
      border: 2px inset #75715e;
      display: flex;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #f8f8f2;
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
      background: #000;
      border: 1px inset #75715e;
      margin-bottom: 8px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.4;
    `;

    // Chat input area
    const chatInputArea = document.createElement('div');
    chatInputArea.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      background: #2a2a2a;
      border: 1px inset #75715e;
      padding: 4px;
    `;

    const chatPrompt = document.createElement('span');
    chatPrompt.textContent = '> ';
    chatPrompt.style.cssText = `
      color: #a6e22e;
      font-weight: bold;
    `;

    const chatInput = document.createElement('input');
    chatInput.id = 'bbs-chat-input';
    chatInput.type = 'text';
    chatInput.style.cssText = `
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #f8f8f2;
      font-family: 'Courier New', monospace;
      font-size: 11px;
    `;

    // Add event listeners
    chatInput.addEventListener('keypress', (e) => this.handleChatInput(e));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideChatRoom();
      }
    });

    // Assemble main chat area
    chatInputArea.appendChild(chatPrompt);
    chatInputArea.appendChild(chatInput);
    chatMainArea.appendChild(chatMessages);
    chatMainArea.appendChild(chatInputArea);

    // Create users sidebar
    const usersSidebar = document.createElement('div');
    usersSidebar.id = 'bbs-users-sidebar';
    usersSidebar.style.cssText = `
      width: 200px;
      min-width: 200px;
      max-width: 200px;
      background: #2a2a2a;
      border: 1px inset #75715e;
      display: flex;
      flex-direction: column;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      flex-shrink: 0;
    `;

    // Users header
    const usersHeader = document.createElement('div');
    usersHeader.style.cssText = `
      background: #1a1a1a;
      border-bottom: 1px solid #75715e;
      padding: 4px 8px;
      font-weight: bold;
      color: #a6e22e;
      text-align: center;
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
      background: #1a1a1a;
      border-top: 1px solid #75715e;
      padding: 4px 8px;
      font-size: 10px;
      color: #888;
      text-align: center;
    `;
    userCount.textContent = '0 users online';

    // Assemble users sidebar
    usersSidebar.appendChild(usersHeader);
    usersSidebar.appendChild(usersList);
    usersSidebar.appendChild(userCount);

    // Assemble the main UI
    this.chatContainer.appendChild(chatMainArea);
    this.chatContainer.appendChild(usersSidebar);
    terminalWindow.appendChild(this.chatContainer);
    
    console.log('ChatManager: Chat container created with users sidebar');
  }

  /**
   * Handle chat input
   */
  handleChatInput(event) {
    if (event.key !== 'Enter') return;

    const message = event.target.value.trim();
    if (!message) return;

    // Clear input
    event.target.value = '';

    // Handle commands
    if (message.startsWith('/')) {
      this.handleCommand(message);
      return;
    }

    // Send regular message
    this.sendMessage(message);
  }

  /**
   * Handle chat commands
   */
  async handleCommand(command) {
    const cmd = command.toLowerCase();

    if (cmd === '/clear') {
      const chatMessages = document.getElementById('bbs-chat-messages');
      if (chatMessages) {
        chatMessages.innerHTML = '';
      }
    } else if (cmd === '/time') {
      const now = new Date();
      this.addSystemMessage(`Current time: ${now.toLocaleString()}`);
    } else if (cmd === '/who') {
      const usersList = document.getElementById('bbs-users-list');
      if (usersList) {
        const users = Array.from(usersList.querySelectorAll('span')).map(span => span.textContent).filter(text => text && text !== '@');
        if (users.length > 0) {
          this.addSystemMessage(`Online users (${users.length}): ${users.join(', ')}`);
        } else {
          this.addSystemMessage('No users currently online');
        }
      } else {
        this.addSystemMessage('Online users: ' + (this.currentUser ? this.currentUser.username : 'Guest'));
      }
    } else if (cmd === '/admin') {
      if (this.currentUser && this.currentUser.user_level === 'admin') {
        this.addSystemMessage('Admin commands:');
        this.addSystemMessage('/clearall - Clear all chat messages from database');
        this.addSystemMessage('/kick <username> - Kick user from chat');
        this.addSystemMessage('/ban <username> - Ban user from chat');
      } else {
        this.addSystemMessage('You need admin privileges to use admin commands');
      }
    } else if (cmd.startsWith('/clearall')) {
      if (this.currentUser && this.currentUser.user_level === 'admin') {
        await this.clearAllMessages();
      } else {
        this.addSystemMessage('You need admin privileges to clear all messages');
      }
    } else if (cmd.startsWith('/kick ')) {
      if (this.currentUser && this.currentUser.user_level === 'admin') {
        const username = cmd.split(' ')[1];
        this.addSystemMessage(`Kick functionality coming soon! (Would kick: ${username})`);
      } else {
        this.addSystemMessage('You need admin privileges to kick users');
      }
    } else if (cmd.startsWith('/ban ')) {
      if (this.currentUser && this.currentUser.user_level === 'admin') {
        const username = cmd.split(' ')[1];
        this.addSystemMessage(`Ban functionality coming soon! (Would ban: ${username})`);
      } else {
        this.addSystemMessage('You need admin privileges to ban users');
      }
    } else {
      this.addSystemMessage(`Unknown command: ${command}`);
    }
  }

  /**
   * Send a message to the chat
   */
  async sendMessage(message) {
    if (!this.supabase || !this.currentUser) {
      this.addSystemMessage('You must be logged in to send messages.');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .insert({
          username: this.currentUser.username,
          message: message,
          user_level: this.currentUser.user_level || 'user'
        });

      if (error) {
        console.error('Chat: Error sending message:', error);
        this.addSystemMessage('Failed to send message: ' + error.message);
      } else {
        // Message will appear via real-time subscription
        console.log('Chat: Message sent successfully');
      }
    } catch (err) {
      console.error('Chat: Exception sending message:', err);
      this.addSystemMessage('Error sending message: ' + err.message);
    }
  }

  /**
   * Add a message to the chat display
   */
  addMessage(type, message, username = null, customTime = null) {
    const chatMessages = document.getElementById('bbs-chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 4px;
      word-wrap: break-word;
    `;

    const time = customTime || new Date();
    const timeStr = time.toLocaleTimeString();

    let content = '';
    if (type === 'system') {
      content = `[${timeStr}] <span style="color: #f39c12;">SYSTEM:</span> ${message}`;
    } else if (type === 'user') {
      const userColor = this.getUserColor(username);
      content = `[${timeStr}] <span style="color: ${userColor}; font-weight: bold;">${username}:</span> ${message}`;
    }

    messageDiv.innerHTML = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Add a system message
   */
  addSystemMessage(message) {
    this.addMessage('system', message);
  }

  /**
   * Get color for username
   */
  getUserColor(username) {
    const colors = ['#a6e22e', '#66d9ef', '#f92672', '#ae81ff', '#fd971f', '#e6db74'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Load recent chat messages
   */
  async loadRecentMessages() {
    if (!this.supabase) return;

    try {
      const { data: messages, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Chat: Error loading messages:', error);
        return;
      }

      if (messages && messages.length > 0) {
        // Display messages in reverse order (oldest first)
        messages.reverse().forEach(msg => {
          this.addMessage('user', msg.message, msg.username, new Date(msg.created_at));
        });
      }
    } catch (err) {
      console.error('Chat: Exception loading messages:', err);
    }
  }

  /**
   * Set up real-time subscription for new messages
   */
  setupRealTimeSubscription() {
    if (!this.supabase) return;

    this.realTimeSubscription = this.supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages' 
        }, 
        (payload) => {
          if (this.isVisible) {
            const newMessage = payload.new;
            this.addMessage('user', newMessage.message, newMessage.username, new Date(newMessage.created_at));
          }
        }
      )
      .subscribe();
  }

  /**
   * Set up presence tracking for online users
   */
  setupPresenceTracking() {
    if (!this.supabase || !this.currentUser) return;

    // Track our own presence
    this.updateUserPresence();

    // Set up presence subscription
    this.presenceSubscription = this.supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceSubscription.presenceState();
        this.updateOnlineUsersList(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        this.addSystemMessage(`${newPresences[0]?.username || key} joined the chat`);
        this.updateUserPresence(); // Update our own presence
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        this.addSystemMessage(`${leftPresences[0]?.username || key} left the chat`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceSubscription.track({
            username: this.currentUser.username,
            user_level: this.currentUser.user_level || 'user',
            online_at: new Date().toISOString()
          });
        }
      });

    // Update presence every 20 seconds to stay online
    setInterval(() => {
      this.updateUserPresence();
    }, 20000);
  }

  /**
   * Update our own presence
   */
  async updateUserPresence() {
    if (!this.presenceSubscription || !this.currentUser) return;

    await this.presenceSubscription.track({
      username: this.currentUser.username,
      user_level: this.currentUser.user_level || 'user',
      online_at: new Date().toISOString()
    });
  }

  /**
   * Update the online users list display
   */
  updateOnlineUsersList(presenceState) {
    const usersList = document.getElementById('bbs-users-list');
    const userCount = document.getElementById('bbs-user-count');
    
    if (!usersList || !userCount) return;

    // Clear current list
    usersList.innerHTML = '';

    // Process presence state
    const onlineUsers = [];
    Object.values(presenceState).forEach(presences => {
      presences.forEach(presence => {
        if (presence.username) {
          onlineUsers.push(presence);
        }
      });
    });

    // Sort users alphabetically
    onlineUsers.sort((a, b) => a.username.localeCompare(b.username));

    // Add users to list
    onlineUsers.forEach(user => {
      const userDiv = document.createElement('div');
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
        background: #a6e22e;
        flex-shrink: 0;
      `;

      // Add username
      const username = document.createElement('span');
      username.textContent = user.username;
      username.style.cssText = `
        color: ${this.getUserColor(user.username)};
        font-weight: bold;
      `;

      // Add user level indicator
      if (user.user_level === 'admin') {
        const adminBadge = document.createElement('span');
        adminBadge.textContent = '@';
        adminBadge.style.cssText = `
          color: #f92672;
          font-weight: bold;
          font-size: 8px;
        `;
        userDiv.appendChild(adminBadge);
      }

      userDiv.appendChild(statusDot);
      userDiv.appendChild(username);
      usersList.appendChild(userDiv);
    });

    // Update user count
    userCount.textContent = `${onlineUsers.length} user${onlineUsers.length !== 1 ? 's' : ''} online`;
  }

  /**
   * Clear all messages from database (admin only)
   */
  async clearAllMessages() {
    if (!this.supabase) {
      this.addSystemMessage('Database connection required to clear messages');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .delete()
        .neq('id', 0); // Delete all messages

      if (error) {
        console.error('Chat: Error clearing messages:', error);
        this.addSystemMessage('Failed to clear messages: ' + error.message);
      } else {
        this.addSystemMessage('All chat messages cleared from database');
        // Clear the display
        const chatMessages = document.getElementById('bbs-chat-messages');
        if (chatMessages) {
          chatMessages.innerHTML = '';
        }
      }
    } catch (err) {
      console.error('Chat: Exception clearing messages:', err);
      this.addSystemMessage('Error clearing messages: ' + err.message);
    }
  }

  /**
   * Clean up old messages to keep costs down
   */
  async cleanupOldMessages() {
    if (!this.supabase) return;

    try {
      // Get total count of messages
      const { count } = await this.supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      // If we have more than our limit, delete the oldest ones
      if (count && count > this.messageLimit) {
        const messagesToDelete = count - this.messageLimit;

        // Get the oldest messages to delete
        const { data: oldMessages } = await this.supabase
          .from('chat_messages')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(messagesToDelete);

        if (oldMessages && oldMessages.length > 0) {
          const idsToDelete = oldMessages.map(msg => msg.id);

          // Delete the old messages
          const { error } = await this.supabase
            .from('chat_messages')
            .delete()
            .in('id', idsToDelete);

          if (error) {
            console.warn('Chat: Failed to cleanup old messages:', error);
          } else {
            console.log(`Chat: Cleaned up ${idsToDelete.length} old messages`);
          }
        }
      }
    } catch (err) {
      console.warn('Chat: Error during cleanup:', err);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.realTimeSubscription) {
      this.supabase.removeChannel(this.realTimeSubscription);
      this.realTimeSubscription = null;
    }

    if (this.presenceSubscription) {
      this.supabase.removeChannel(this.presenceSubscription);
      this.presenceSubscription = null;
    }

    if (this.chatContainer && this.chatContainer.parentNode) {
      this.chatContainer.parentNode.removeChild(this.chatContainer);
      this.chatContainer = null;
    }

    this.isVisible = false;
    this.onlineUsers.clear();
  }
}

// Export for use in other modules
window.ChatManager = ChatManager;
