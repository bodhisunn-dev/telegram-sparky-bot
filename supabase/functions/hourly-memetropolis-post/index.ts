import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const CHAT_ID = -1002342027931; // Same chat as random facts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const degenMessages = [
  "🚀 GM DEGENS! 🌟 Memetropolis.ai is the ONLY Omnichain OFT Launchpad you need! 💎\n\n✨ 6 CHAINS united with Native Interoperability between Solana & EVM! 🔥\n\n🎯 Time to SMASH those raids and SHILL like your bags depend on it! 💰\n\n👉 Follow & engage: https://x.com/memetropolis_ai\n\n#Memetropolis #OmnichainRevolution 🌊",
  
  "⚡️ ATTENTION ALPHA HUNTERS! 🎯\n\nMemetropolis.ai isn't just a launchpad... it's THE BRIDGE between Solana & EVM! 🌉\n\n🔥 6 chains, infinite possibilities\n💎 Native interoperability = GAME CHANGER\n🚀 Your next 100x starts HERE\n\n💪 SMASH that raid button! SHILL with passion!\n\n📱 https://x.com/memetropolis_ai\n\n#DeFi #Omnichain #WAGMI 🎰",
  
  "🌟 YO DEGENS! Ready for the OMNICHAIN revolution? 🔥\n\n🎪 Memetropolis.ai = Where Solana MEETS EVM magic! ✨\n\n🎯 6 chains locked & loaded\n💰 OFT Launchpad on steroids\n🔗 Native interop = NO BRIDGES NEEDED!\n\n👊 Time to RAID! Time to SHILL! LFG! 🚀\n\n🐦 https://x.com/memetropolis_ai\n\n#Memetropolis #CrossChainKing 💎",
  
  "🎰 DEGEN ALERT! 🚨\n\nWhy choose ONE chain when you can have SIX? 🎯\n\n🌈 Memetropolis.ai bringing that OMNICHAIN heat! 🔥\n✨ Solana + EVM = UNSTOPPABLE\n💎 The only OFT Launchpad that matters\n🚀 Native interoperability = SMOOTH AF\n\n⚔️ RAID MODE: ACTIVATED\n📢 SHILL LEVEL: MAXIMUM\n\n💫 https://x.com/memetropolis_ai\n\n#OmnichainGang #Memetropolis 🎪",
  
  "🔥 GM to the REAL ONES! 💎\n\nMemetropolis.ai just hits DIFFERENT! 🎯\n\n🌟 6 CHAINS unified\n🌉 Solana ↔️ EVM seamlessly\n🎪 THE Omnichain OFT Launchpad\n💰 Zero friction, pure gains\n\n💪 Let's SMASH those raids!\n📣 Let's SHILL to the moon!\n\n🐦 Drop engagement here: https://x.com/memetropolis_ai\n\n#Memetropolis #DeFiRevolution 🚀",
  
  "⚡️ WAKE UP DEGENS! ⚡️\n\n🎪 Memetropolis.ai = Your ticket to OMNICHAIN domination! 👑\n\n✅ 6 chains in ONE ecosystem\n✅ Solana + EVM living in harmony\n✅ Native OFT Launchpad power\n✅ Interoperability like you've NEVER seen\n\n🎯 Mission: RAID EVERYTHING\n📢 Mission: SHILL EVERYWHERE\n\n💎 https://x.com/memetropolis_ai\n\n#CrossChain #Memetropolis #LFG 🌊"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    console.log('Starting hourly Memetropolis post...');

    // Select random message
    const randomMessage = degenMessages[Math.floor(Math.random() * degenMessages.length)];

    console.log('Sending animation to chat:', CHAT_ID);

    // Fetch video from Supabase Storage with cache busting
    const VIDEO_URL = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/bot-media/memetropolis-animation.mp4?t=${Date.now()}`;
    console.log('Fetching video from:', VIDEO_URL);
    
    const videoResponse = await fetch(VIDEO_URL, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    
    const videoBlob = await videoResponse.blob();
    console.log('Video fetched, size:', videoBlob.size, 'bytes (', (videoBlob.size / 1024 / 1024).toFixed(2), 'MB)');

    // Create FormData to send file
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID.toString());
    formData.append('animation', videoBlob, 'animation.mp4');
    formData.append('caption', randomMessage);

    // Send animation to Telegram using multipart/form-data
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await telegramResponse.json();
    console.log('Telegram API response:', result);

    if (!result.ok) {
      console.error('Failed to send animation:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send animation', details: result }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in hourly-memetropolis-post:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
