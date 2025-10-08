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

    // Get last used description to avoid repetition
    const { data: lastState } = await supabase
      .from('bot_state')
      .select('value')
      .eq('id', 'last_meme_description')
      .single();

    const lastDescription = lastState?.value || '';
    
    // Filter out the last description and select a new one
    const availableDescriptions = memeDescriptions.filter(desc => desc !== lastDescription);
    const randomDescription = availableDescriptions[Math.floor(Math.random() * availableDescriptions.length)];
    
    console.log('Generating meme with prompt:', randomDescription);

    // Update the last used description
    await supabase
      .from('bot_state')
      .upsert({ id: 'last_meme_description', value: randomDescription, updated_at: new Date().toISOString() });

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
