import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const CHAT_ID = -1002958177388; // MEMETROPOLIS - Global chat

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

    // Get the video URL (using the deployed app URL)
    const videoUrl = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || ''}/memetropolis-animation.mp4`;
    
    console.log('Sending animation to chat:', CHAT_ID);

    // Send animation to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          animation: videoUrl,
          caption: randomMessage,
          parse_mode: 'HTML',
        }),
      }
    );

    const result = await telegramResponse.json();
    console.log('Telegram API response:', result);

    if (!result.ok) {
      // If URL doesn't work, try sending as file upload
      console.log('Trying file upload method...');
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID.toString());
      formData.append('caption', randomMessage);
      formData.append('parse_mode', 'HTML');
      
      // Fetch the video file
      const videoFile = await fetch(videoUrl);
      const videoBlob = await videoFile.blob();
      formData.append('animation', videoBlob, 'animation.mp4');
      
      const retryResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const retryResult = await retryResponse.json();
      console.log('Retry response:', retryResult);
      
      return new Response(
        JSON.stringify({ success: true, result: retryResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
