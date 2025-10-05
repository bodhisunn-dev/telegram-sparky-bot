import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const degenMessages = [
  "🚀 GM DEGENS! Memetropolis.ai is the ONLY Omnichain OFT Launchpad! 6 CHAINS united 💎\n\nFollow: https://x.com/memetropolis_ai\n\n#Memetropolis #Omnichain",
  
  "⚡️ ALPHA HUNTERS! Memetropolis.ai = THE BRIDGE between Solana & EVM! 6 chains, infinite possibilities 🔥\n\nhttps://x.com/memetropolis_ai\n\n#DeFi #Omnichain",
  
  "🌟 YO DEGENS! Ready for OMNICHAIN revolution? Memetropolis.ai = Solana MEETS EVM magic! LFG! 🚀\n\nhttps://x.com/memetropolis_ai\n\n#Memetropolis",
  
  "🎰 DEGEN ALERT! Why choose ONE chain when you can have SIX? Memetropolis.ai bringing OMNICHAIN heat! 🔥\n\nhttps://x.com/memetropolis_ai\n\n#OmnichainGang",
  
  "🔥 GM REAL ONES! Memetropolis.ai hits DIFFERENT! 6 CHAINS unified, THE Omnichain OFT Launchpad 💎\n\nhttps://x.com/memetropolis_ai\n\n#Memetropolis",
  
  "⚡️ WAKE UP DEGENS! Memetropolis.ai = Your ticket to OMNICHAIN domination! 6 chains in ONE 👑\n\nhttps://x.com/memetropolis_ai\n\n#CrossChain"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting hourly Memetropolis post to Telegram...');

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!botToken || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get chat_id from messages table
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('chat_id')
      .limit(1)
      .single();

    if (messageError || !messageData) {
      throw new Error('Could not find chat_id');
    }

    const chatId = messageData.chat_id;

    // Select random message
    const randomMessage = degenMessages[Math.floor(Math.random() * degenMessages.length)];
    
    // Get video from Supabase Storage
    const { data: videoData, error: storageError } = await supabase
      .storage
      .from('bot-media')
      .download('memetropolis-animation.mp4');

    if (storageError) {
      console.error('Storage error:', storageError);
      throw new Error(`Failed to fetch video from storage: ${storageError.message}`);
    }

    // Convert blob to array buffer for Telegram
    const videoBuffer = await videoData.arrayBuffer();

    // Send video with caption to Telegram
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), 'memetropolis-animation.mp4');
    formData.append('caption', randomMessage);

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
      method: 'POST',
      body: formData,
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram API response:', telegramResult);

    if (!telegramResult.ok) {
      throw new Error(`Telegram API error: ${telegramResult.description}`);
    }

    return new Response(JSON.stringify({ ok: true, message: randomMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in hourly-memetropolis-post function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
