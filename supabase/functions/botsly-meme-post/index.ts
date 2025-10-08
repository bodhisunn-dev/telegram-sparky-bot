const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Missing Telegram configuration');
    }

    // Random degen meme descriptions
    const memeDescriptions = [
      "When you ape into a coin at ATH and it immediately dumps 50% 📉\n→ Split panel: left = \"This is fine\" dog in flames / right = wallet showing -69%",
      
      "POV: You're explaining your crypto losses to your wife 💀\n→ Guy sweating with two buttons: \"Tell the truth\" vs \"Say it's a long-term hold\"",
      
      "That feeling when you wake up to green candles 📈\n→ Leonardo DiCaprio laughing and pointing at the chart",
      
      "Me checking my portfolio every 5 seconds like it's gonna change 🤡\n→ Obsessive boyfriend meme but it's checking CMC",
      
      "When someone asks if I'm still holding that coin from 2021 💎\n→ Skeleton waiting at computer, caption: \"Still staking\"",
      
      "Crypto Twitter be like: \"WAGMI\" while losing everything 🚀\n→ House on fire meme: \"This is fine, we're all gonna make it\"",
      
      "When you FOMO into a pump and it dumps the second you buy 🎪\n→ Clown putting on makeup in stages",
      
      "POV: You're diversifying into 50 different shitcoins 🎲\n→ Guy with math equations floating around, caption: \"Risk management\"",
      
      "That one coin in your portfolio carrying everything 💪\n→ Strong Spongebob carrying weak Spongebob (rest of portfolio)",
      
      "When you ape the presale at 3am with zero DYOR 🌙\n→ Split-screen: top = serious \"I will research next time\" / bottom = \"buys because logo looks cool\"",
      
      "Checking charts during Thanksgiving dinner be like 📊\n→ Woman yelling at cat meme, but cat is looking at charts",
      
      "When the dev says \"trust the process\" for the 47th time 🙏\n→ Disappointed cricket fan meme",
      
      "Me pretending I understand tokenomics in the voice chat 🧠\n→ Homer Simpson backing into bushes",
      
      "That feeling when you find a 1000x gem... in your dream 😴\n→ Waking up meme: \"It was all a dream\"",
      
      "When someone FUDs your bags 😤\n→ Angry NPC wojak pointing and screaming"
    ];

    const randomDescription = memeDescriptions[Math.floor(Math.random() * memeDescriptions.length)];
    
    const message = `/generate ${randomDescription}\n\n#MEMETROPOLIS`;

    console.log('Posting BotslyAI meme description:', message);

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    const result = await telegramResponse.json();
    console.log('Posted successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Meme description posted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in botsly-meme-post:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
