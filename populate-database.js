// Database Population Script for JTrap Radio BBS
// Run this in your browser console to add sample data

async function populateDatabase() {
  if (!window.getSupabase) {
    console.error('Supabase not loaded');
    return;
  }
  
  const supabase = window.getSupabase();
  if (!supabase) {
    console.error('Supabase not initialized');
    return;
  }
  
  console.log('Starting database population...');
  
  try {
    // Add sample users
    console.log('Adding sample users...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          email: 'admin@jtrap.radio',
          password_hash: 'admin',
          user_level: 'sysop',
          join_date: new Date('2024-01-01').toISOString(),
          last_login: new Date().toISOString()
        },
        {
          username: 'listener',
          email: 'listener@example.com',
          password_hash: 'music',
          user_level: 'user',
          join_date: new Date('2024-01-15').toISOString(),
          last_login: new Date().toISOString()
        }
      ])
      .select();
    
    if (userError) {
      console.error('Error adding users:', userError);
    } else {
      console.log('Users added:', users);
    }
    
    // Add sample messages
    console.log('Adding sample messages...');
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          author_id: users[0].id,
          subject: 'Welcome to JTrap BBS!',
          content: 'Welcome to the JTrap Family Radio BBS! This is where listeners can connect, share, and discuss music. Feel free to post messages, download files, and chat with other listeners.',
          board: 'general',
          created_at: new Date('2024-01-01').toISOString()
        },
        {
          author_id: users[0].id,
          subject: 'Radio Station Info',
          content: 'JTrap Family Radio broadcasts on 99.9 FM. Visit jtrap.radio for more info! We play the best music 24/7.',
          board: 'announcements',
          created_at: new Date('2024-01-02').toISOString()
        },
        {
          author_id: users[1].id,
          subject: 'Great show today!',
          content: 'Loved the music selection today! Keep up the great work!',
          board: 'general',
          created_at: new Date('2024-01-15').toISOString()
        }
      ])
      .select();
    
    if (messageError) {
      console.error('Error adding messages:', messageError);
    } else {
      console.log('Messages added:', messages);
    }
    
    // Add sample files
    console.log('Adding sample files...');
    const { data: files, error: fileError } = await supabase
      .from('files')
      .insert([
        {
          name: 'station_logo.ans',
          size: '2.3KB',
          description: 'Station logo in ANSI art',
          uploader_id: users[0].id,
          downloads: 15,
          created_at: new Date().toISOString()
        },
        {
          name: 'playlist.txt',
          size: '1.1KB',
          description: 'Current playlist',
          uploader_id: users[0].id,
          downloads: 8,
          created_at: new Date().toISOString()
        },
        {
          name: 'station_info.txt',
          size: '0.8KB',
          description: 'Station information',
          uploader_id: users[0].id,
          downloads: 12,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (fileError) {
      console.error('Error adding files:', fileError);
    } else {
      console.log('Files added:', files);
    }
    
    // Add sample chat messages
    console.log('Adding sample chat messages...');
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: users[0].id,
          content: 'Welcome to the chat room!',
          created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          user_id: users[1].id,
          content: 'Thanks for the great music!',
          created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        }
      ])
      .select();
    
    if (chatError) {
      console.error('Error adding chat messages:', chatError);
    } else {
      console.log('Chat messages added:', chatMessages);
    }
    
    console.log('Database population complete!');
    
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Make it available globally
window.populateDatabase = populateDatabase;

console.log('Database population script loaded. Run populateDatabase() to add sample data.');
