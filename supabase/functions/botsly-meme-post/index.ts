import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing configuration');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Random degen meme descriptions with variety
    const memeDescriptions = [
      "When you ape into a coin at ATH and it immediately dumps 50% 📉\n→ Split panel meme: left shows 'This is fine' dog in flames, right shows wallet with -69%",
      
      "POV: You're explaining your crypto losses to your wife 💀\n→ Sweating guy choosing between two buttons: 'Tell the truth' vs 'Say it's a long-term hold'",
      
      "That feeling when you wake up to green candles 📈\n→ Leonardo DiCaprio laughing hysterically and pointing at chart going up",
      
      "Me checking my portfolio every 5 seconds like it's gonna change 🤡\n→ Obsessive boyfriend meme but he's checking CoinMarketCap",
      
      "When someone asks if I'm still holding that coin from 2021 💎\n→ Skeleton sitting at computer desk, caption: 'Still staking bro'",
      
      "Crypto Twitter be like: 'WAGMI' while losing everything 🚀\n→ House completely on fire meme: 'This is fine, we're all gonna make it'",
      
      "When you FOMO into a pump and it dumps the second you buy 🎪\n→ Clown applying makeup in progressive stages, getting more ridiculous",
      
      "POV: You're diversifying into 50 different shitcoins 🎲\n→ Math equations floating around confused guy's head, caption: 'Risk management'",
      
      "That one coin in your portfolio carrying everything 💪\n→ Buff Spongebob carrying weak Spongebob labeled 'rest of portfolio'",
      
      "When you ape the presale at 3am with zero DYOR 🌙\n→ Split panel: top = serious face 'I will research next time', bottom = 'buys because logo looks cool'",
      
      "Checking charts during Thanksgiving dinner be like 📊\n→ Woman yelling at confused cat, but cat is staring at price charts",
      
      "When the dev says 'trust the process' for the 47th time 🙏\n→ Disappointed cricket fan with thousand-yard stare",
      
      "Me pretending I understand tokenomics in the voice chat 🧠\n→ Homer Simpson slowly backing into hedge bushes",
      
      "That feeling when you find a 1000x gem... in your dream 😴\n→ Waking up sweating meme: 'It was all a dream, the coin doesn't exist'",
      
      "When someone FUDs your bags 😤\n→ Angry NPC wojak with veins popping, pointing and screaming",
      
      "That moment you realize you bought the wrong token 🤦\n→ Dramatic zoom on guy's face realizing his mistake, caption: 'Wrong address'",
      
      "When the whale dumps right after you buy in 🐋\n→ Titanic sinking but it's labeled 'my portfolio'",
      
      "POV: The dev team goes silent for 3 days 👻\n→ Nervous sweating Jordan Peele looking around suspiciously",
      
      "Me after doing 5 minutes of research: 'Yeah I'm basically an expert' 🎓\n→ Brain expanding galaxy meme but ironically small brain",
      
      "When you time the bottom perfectly for once 🎯\n→ Wolf of Wall Street chest pump celebration, caption: 'Bought the dip'",
      
      "My portfolio during a bear market 📉\n→ Disaster girl smiling in front of burning house labeled 'my bags'",
      
      "When you see your coin pumping but you sold yesterday 😭\n→ Crying behind mask meme, trying to act happy for others",
      
      "Explaining blockchain to your grandma 👵\n→ Charlie Day conspiracy board meme with red strings everywhere",
      
      "When gas fees cost more than your transaction 💸\n→ Angry keyboard slam meme, Ethereum logo in background",
      
      "POV: You're in a telegram group asking 'wen moon' 🌙\n→ Patrick Star asking 'Is mayonnaise an instrument?'",
      
      "That one guy who bought Bitcoin in 2010 🏆\n→ Gigachad sitting on throne made of gold, caption: 'Meanwhile the pizza guy'",
      
      "When you finally understand what a liquidity pool is 💡\n→ Monkey puppet side-eye meme, caption: 'Wait, I can lose money both ways?'",
      
      "Me watching my coin do a 10x after I sold 📈\n→ Elmo on fire gif, internal screaming face",
      
      "When the audit comes back clean but price still dumps 📊\n→ Confused Nick Young face with question marks",
      
      "POV: You're explaining why you're still bullish down 80% 🎪\n→ Guy with straight face lying meme: 'It's just a healthy correction'",
      
      "When you accidentally send to wrong wallet address 💀\n→ Dramatic anime character reaching out as coins disappear into void",
      
      "That feeling when airdrop is actually worth something 🎁\n→ Surprised Pikachu face but extremely exaggerated",
      
      "Me acting like I knew it would pump all along 🤓\n→ Squidward looking through blinds at Spongebob having fun",
      
      "When stable coin depegs and you're 100x leveraged ⚡\n→ Mr. Krabs having Vietnam flashback, sweating profusely",
      
      "POV: You're the exit liquidity again 💧\n→ Distracted boyfriend meme: boyfriend=whales, girlfriend=exit liquidity, other girl=you",
      
      "When someone asks if crypto is a scam 🎭\n→ Two button choice meme: 'Explain fundamentals' vs 'Just say HFSP'",
      
      "My face when I see 'Protocol X is a revolutionary DeFi innovation' 🙄\n→ Roll Safe thinking guy tapping head, caption: 'It's a fork of a fork'",
      
      "When you're trying to buy the dip but it keeps dipping 📉\n→ Dominoes falling endlessly meme labeled with buy orders",
      
      "POV: Gas prices are higher than your portfolio value ⛽\n→ Man looking at butterfly: 'Is this financial freedom?'",
      
      "When your coin gets listed on a major exchange 🚀\n→ Excited seal clapping aggressively, caption: 'Finally!'",
      
      "Me calculating profits before even buying 💰\n→ Person pointing at math on whiteboard but it's all wrong, caption: 'Lambo calculator'",
      
      "When you see 'Not financial advice' after 50 paragraphs of advice 📝\n→ Drake no/yes meme: No to 'seeking professional advice', Yes to 'trusting CT anon'",
      
      "That guy who says 'I told you so' after every pump 📢\n→ Armchair expert meme guy, caption: 'I called it' (narrator: he didn't)",
      
      "When you realize you've been staking the wrong token for 6 months 🔐\n→ Shocked face meme with hands on cheeks, existential crisis setting in",
      
      "POV: Another day of losing money you don't have 💸\n→ Pepe the frog sad face in rain, holding empty wallet"
    ];

    // Get last 15 used descriptions to avoid repetition
    const { data: lastState } = await supabase
      .from('bot_state')
      .select('value')
      .eq('id', 'last_meme_description')
      .maybeSingle();

    let lastDescriptions: string[] = [];
    try {
      lastDescriptions = lastState?.value ? JSON.parse(lastState.value) : [];
      // Ensure it's an array
      if (!Array.isArray(lastDescriptions)) {
        lastDescriptions = [];
      }
    } catch (e) {
      console.log('Error parsing last descriptions, resetting:', e);
      lastDescriptions = [];
    }
    
    // Filter out the last 15 descriptions and select a new one
    const availableDescriptions = memeDescriptions.filter(desc => !lastDescriptions.includes(desc));
    const randomDescription = availableDescriptions.length > 0 
      ? availableDescriptions[Math.floor(Math.random() * availableDescriptions.length)]
      : memeDescriptions[Math.floor(Math.random() * memeDescriptions.length)];
    
    console.log('Generating meme with prompt:', randomDescription);

    // Update the last used descriptions (keep last 15)
    const updatedHistory = [randomDescription, ...lastDescriptions].slice(0, 15);
    await supabase
      .from('bot_state')
      .upsert({ id: 'last_meme_description', value: JSON.stringify(updatedHistory), updated_at: new Date().toISOString() });

    // Call Lovable AI to generate the image
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: randomDescription
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('Image generated successfully');

    // Convert base64 to binary
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Post image to Telegram
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', new Blob([binaryData], { type: 'image/png' }), 'meme.png');
    formData.append('caption', `${randomDescription}\n\n#MEMETROPOLIS`);

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    const result = await telegramResponse.json();
    console.log('Posted successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Meme generated and posted' }),
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
