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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ALL users from the database (including those with no recent activity)
    const { data: allUsers, error: usersError } = await supabase
      .from('telegram_users')
      .select('username, telegram_id, first_name');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found in database');
      return new Response(
        JSON.stringify({ error: 'No users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`Found ${allUsers.length} total users in database`);

    // Filter users who have usernames (for @mentions)
    const usersWithUsernames = allUsers.filter(u => u.username);
    console.log(`Found ${usersWithUsernames.length} users with usernames for mentions`);

    // Randomly select 5-10 users to mention
    const numberOfMentions = Math.floor(Math.random() * 6) + 5; // 5 to 10 users
    const shuffled = usersWithUsernames.sort(() => 0.5 - Math.random());
    const selectedUsers = shuffled.slice(0, Math.min(numberOfMentions, usersWithUsernames.length));

    // Get a recent chat_id to send the message to
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
      '💯 Keep pushing!'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const messageText = `${randomPhrase} ${mentions}`;

    // Send the mention message via Telegram
    const telegramResponse = await sendTelegramMessage(recentMessage.chat_id, messageText);

    console.log('Mention message sent:', telegramResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mentioned_users: selectedUsers.map(u => u.username),
        total_users_in_db: allUsers.length
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
