import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting user mention task...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const telegramApiId = Deno.env.get('TELEGRAM_API_ID')!;
    const telegramApiHash = Deno.env.get('TELEGRAM_API_HASH')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get a recent chat_id first
    const { data: recentMessage, error: messageError } = await supabase
      .from('messages')
      .select('chat_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (messageError || !recentMessage) {
      console.error('Error fetching chat_id:', messageError);
      throw new Error('Could not find chat to send message to');
    }

    const chatId = recentMessage.chat_id;
    console.log('Using chat_id:', chatId);

    // Use Telegram MTProto API via HTTP to get all chat members
    // This requires the Telegram API credentials we just added
    try {
      const membersResponse = await fetch('https://api.telegram.org/bot' + telegramBotToken + '/getChatAdministrators?chat_id=' + chatId);
      const adminsData = await membersResponse.json();
      
      // Note: Bot API has limitations. For now, we'll work with users we have
      // and mark this for future enhancement with proper MTProto implementation
      console.log('Bot API limitations: Cannot fetch all members directly');
      console.log('Using existing database users and will enhance later');
    } catch (e) {
      console.log('Could not fetch additional members:', e);
    }

    // Get all users with usernames from database
    const { data: allUsers, error: usersError } = await supabase
      .from('telegram_users')
      .select('username, telegram_id, first_name')
      .not('username', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users with usernames found in database');
      return new Response(
        JSON.stringify({ error: 'No users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`Found ${allUsers.length} users with usernames in database`);

    // Get users mentioned in the last hour to avoid duplicate mentions
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentMentions } = await supabase
      .from('user_mentions')
      .select('telegram_user_id')
      .gte('mentioned_at', oneHourAgo);

    const recentlyMentionedIds = new Set(
      recentMentions?.map(m => m.telegram_user_id) || []
    );
    console.log(`${recentlyMentionedIds.size} users were mentioned in the last hour`);

    // Filter out recently mentioned users to cycle through all users
    const availableUsers = allUsers.filter(
      u => !recentlyMentionedIds.has(u.telegram_id)
    );
    console.log(`${availableUsers.length} users available for mention (not mentioned in last hour)`);

    // If we've cycled through everyone, reset and use all users
    const usersToMentionFrom = availableUsers.length >= 5 ? availableUsers : allUsers;

    // Randomly select 5-10 users to mention
    const numberOfMentions = Math.floor(Math.random() * 6) + 5; // 5 to 10 users
    const shuffled = usersToMentionFrom.sort(() => 0.5 - Math.random());
    const selectedUsers = shuffled.slice(0, Math.min(numberOfMentions, usersToMentionFrom.length));

    // Create mention message
    const mentions = selectedUsers.map(u => `@${u.username}`).join(' ');
    const phrases = [
      '👋 Hey team!',
      '🔥 What\'s happening?',
      '💪 How\'s everyone doing?',
      '🚀 Who\'s ready to go?',
      '⚡ Let\'s get it!',
      '✨ Good vibes only!',
      '🎯 Stay focused!',
      '💯 Keep pushing!',
      '🌟 Rise and shine!',
      '💎 Stay awesome!',
      '🎉 Let\'s make it count!',
      '🔊 Time to shine!'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const messageText = `${randomPhrase} ${mentions}`;

    // Send the mention message via Telegram
    const telegramResponse = await sendTelegramMessage(chatId, messageText);

    console.log('Mention message sent:', telegramResponse);

    // Record the mentions in the database
    const mentionRecords = selectedUsers.map(u => ({
      telegram_user_id: u.telegram_id,
      username: u.username,
      chat_id: chatId,
    }));

    const { error: insertError } = await supabase
      .from('user_mentions')
      .insert(mentionRecords);

    if (insertError) {
      console.error('Error recording mentions:', insertError);
    } else {
      console.log('Successfully recorded', mentionRecords.length, 'mentions');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mentioned_users: selectedUsers.map(u => u.username),
        total_users_in_db: allUsers.length,
        note: 'MTProto API integration pending for full member sync'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mention-users function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function sendTelegramMessage(chatId: number, text: string) {
  const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  const response = await fetch(
    `https://api.telegram.org/bot${telegramToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    }
  );

  return await response.json();
}
