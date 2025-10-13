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

    // Random degen meme descriptions with variety - always unique and different
    const memeDescriptions = [
      "When you ape into a coin at ATH and it immediately dumps 50% 📉\n→ Split panel meme: left shows 'This is fine' dog in flames with RED background, right shows wallet with -69% in PURPLE",
      
      "POV: You're explaining your crypto losses to your wife 💀\n→ Sweating guy with BLUE shirt choosing between two RED buttons: 'Tell the truth' vs 'Say it's a long-term hold'",
      
      "That feeling when you wake up to GREEN candles 📈\n→ Leonardo DiCaprio in GOLD tuxedo laughing hysterically and pointing at NEON GREEN chart going up",
      
      "Me checking my portfolio every 5 seconds like it's gonna change 🤡\n→ Obsessive boyfriend with ORANGE hoodie staring at phone showing CoinMarketCap with RED numbers",
      
      "When someone asks if I'm still holding that coin from 2021 💎\n→ Skeleton with BLUE eye sockets sitting at computer desk with PURPLE gaming setup, caption: 'Still staking bro'",
      
      "Crypto Twitter be like: 'WAGMI' while losing everything 🚀\n→ House with YELLOW walls completely on fire with ORANGE flames: 'This is fine, we're all gonna make it'",
      
      "When you FOMO into a pump and it dumps the second you buy 🎪\n→ Clown with RED nose applying RAINBOW makeup in progressive stages, getting more ridiculous, CIRCUS tent background",
      
      "POV: You're diversifying into 50 different shitcoins 🎲\n→ NEON PINK and CYAN math equations floating around confused guy's head, caption: 'Risk management'",
      
      "That one coin in your portfolio carrying everything 💪\n→ Buff Spongebob in GOLD outfit carrying weak Spongebob labeled 'rest of portfolio' with GREY background",
      
      "When you ape the presale at 3am with zero DYOR 🌙\n→ Split panel: top = serious face with DARK BLUE night background, bottom = 'buys because logo looks cool' with NEON colors",
      
      "Checking charts during Thanksgiving dinner be like 📊\n→ Woman with BROWN hair yelling at confused cat with ORANGE fur, but cat is staring at RED price charts",
      
      "When the dev says 'trust the process' for the 47th time 🙏\n→ Disappointed cricket fan with GREEN jersey and thousand-yard stare in GREY stadium",
      
      "Me pretending I understand tokenomics in the voice chat 🧠\n→ Homer Simpson with YELLOW skin slowly backing into GREEN hedge bushes, BLUE sky background",
      
      "That feeling when you find a 1000x gem... in your dream 😴\n→ Waking up sweating meme with PURPLE bedsheets: 'It was all a dream, the coin doesn't exist'",
      
      "When someone FUDs your bags 😤\n→ Angry NPC wojak with RED popping veins, GREY skin, pointing and screaming with ORANGE background",
      
      "That moment you realize you bought the wrong token 🤦\n→ Dramatic zoom on guy's face with BLUE eyes realizing his mistake, caption: 'Wrong address', DARK background",
      
      "When the whale dumps right after you buy in 🐋\n→ Titanic sinking in ICY BLUE ocean but ship is labeled 'my portfolio' in RED letters",
      
      "POV: The dev team goes silent for 3 days 👻\n→ Jordan Peele in PURPLE shirt nervous sweating and looking around suspiciously with GREEN screen background",
      
      "Me after doing 5 minutes of research: 'Yeah I'm basically an expert' 🎓\n→ Brain expanding galaxy meme with RAINBOW colors but ironically small PINK brain",
      
      "When you time the bottom perfectly for once 🎯\n→ Wolf of Wall Street in NAVY BLUE suit chest pump celebration with GOLD watch, caption: 'Bought the dip'",
      
      "My portfolio during a bear market 📉\n→ Disaster girl with RED dress smiling in front of burning house labeled 'my bags' with ORANGE flames",
      
      "When you see your coin pumping but you sold yesterday 😭\n→ Crying behind GREY mask meme with BLUE tears, trying to act happy for others",
      
      "Explaining blockchain to your grandma 👵\n→ Charlie Day in GREEN shirt with RED string conspiracy board meme everywhere",
      
      "When gas fees cost more than your transaction 💸\n→ Angry keyboard slam meme with PURPLE rage, Ethereum logo in BLUE background",
      
      "POV: You're in a telegram group asking 'wen moon' 🌙\n→ Patrick Star with PINK skin asking 'Is mayonnaise an instrument?' in UNDERWATER BLUE setting",
      
      "That one guy who bought Bitcoin in 2010 🏆\n→ Gigachad with GREY beard sitting on throne made of GOLD coins, caption: 'Meanwhile the pizza guy'",
      
      "When you finally understand what a liquidity pool is 💡\n→ Monkey puppet with BROWN fur side-eye meme with YELLOW background, caption: 'Wait, I can lose money both ways?'",
      
      "Me watching my coin do a 10x after I sold 📈\n→ Elmo with RED fur on fire gif in ORANGE flames, internal screaming face",
      
      "When the audit comes back clean but price still dumps 📊\n→ Confused Nick Young with BLACK hair face with RAINBOW question marks on BASKETBALL COURT",
      
      "POV: You're explaining why you're still bullish down 80% 🎪\n→ Guy with straight face lying meme in BLUE shirt: 'It's just a healthy correction' with RED chart behind",
      
      "When you accidentally send to wrong wallet address 💀\n→ Dramatic anime character with SILVER hair reaching out as GOLDEN coins disappear into PURPLE void",
      
      "That feeling when airdrop is actually worth something 🎁\n→ Surprised Pikachu with YELLOW fur face but extremely exaggerated with ELECTRIC BLUE background",
      
      "Me acting like I knew it would pump all along 🤓\n→ Squidward with CYAN skin looking through WHITE blinds at Spongebob having fun with YELLOW and GREEN colors",
      
      "When stable coin depegs and you're 100x leveraged ⚡\n→ Mr. Krabs with RED shell having Vietnam flashback in SEPIA tones, sweating profusely",
      
      "POV: You're the exit liquidity again 💧\n→ Distracted boyfriend in DENIM jacket: boyfriend=whales, girlfriend=exit liquidity in PINK, other girl=you in RED",
      
      "When someone asks if crypto is a scam 🎭\n→ Two button choice meme with YELLOW buttons: 'Explain fundamentals' vs 'Just say HFSP' on GREY background",
      
      "My face when I see 'Protocol X is a revolutionary DeFi innovation' 🙄\n→ Roll Safe with BLACK skin thinking guy tapping head in ORANGE hoodie, caption: 'It's a fork of a fork'",
      
      "When you're trying to buy the dip but it keeps dipping 📉\n→ RAINBOW colored dominoes falling endlessly meme labeled with buy orders on BLACK background",
      
      "POV: Gas prices are higher than your portfolio value ⛽\n→ Man in BLUE jeans looking at ORANGE and BLACK butterfly: 'Is this financial freedom?'",
      
      "When your coin gets listed on a major exchange 🚀\n→ Excited seal with GREY fur clapping aggressively in ICY BLUE water, caption: 'Finally!'",
      
      "Me calculating profits before even buying 💰\n→ Person in RED shirt pointing at math on whiteboard but it's all wrong with MULTICOLOR markers, caption: 'Lambo calculator'",
      
      "When you see 'Not financial advice' after 50 paragraphs of advice 📝\n→ Drake in GOLD chain no/yes meme: No to 'seeking professional advice', Yes to 'trusting CT anon'",
      
      "That guy who says 'I told you so' after every pump 📢\n→ Armchair expert meme guy in GREEN recliner with BROWN background, caption: 'I called it' (narrator: he didn't)",
      
      "When you realize you've been staking the wrong token for 6 months 🔐\n→ Shocked face meme with hands on cheeks with PALE BLUE skin, existential crisis in PURPLE void",
      
      "POV: Another day of losing money you don't have 💸\n→ Pepe the frog with GREEN skin sad face in GREY rain, holding empty BLACK wallet",
      
      "When you buy a shitcoin because the logo has a dog 🐕\n→ Doge with TAN fur in astronaut helmet floating in DEEP SPACE with PURPLE and PINK nebula, caption: 'To the moon (it's going to zero)'",
      
      "That feeling when you're down 90% but refuse to sell 💎🙌\n→ Principal Skinner meme with BLUE suit: 'Am I out of touch? No, it's the market that's wrong' in YELLOW school setting",
      
      "Me explaining to my therapist why I bought another memecoin 🛋️\n→ Anakin and Padme in SAND colored clothes meme: 'I bought the fundamentals right?' 'Right?' on BRIGHT outdoor background",
      
      "When you see your coin listed on CoinMarketCap for the first time 🎉\n→ Baby yoda with GREEN skin and BEIGE robe with sparkling BLUE eyes full of wonder",
      
      "POV: You're checking if your shitcoin is still alive 💀\n→ Stick figure with BLACK lines checking pulse of GREY dead body labeled 'my investment' on WHITE background",
      
      "When someone asks about your trading strategy 📊\n→ Charlie from Always Sunny in GREEN army jacket with CIGARETTE: 'Wildcard, bitches!' in MESSY apartment",
      
      "That moment when you realize rug pull rhymes with tug pull ⚓\n→ Monkey puppet with BROWN fur looking away awkwardly with RED curtain background",
      
      "Me after reading 'DYOR' for the 100th time 📚\n→ Tired spongebob with YELLOW skin bags under eyes at DESK with PAPERS everywhere caption: 'Your Own Research'",
      
      "When you see 'Influencer Partnership Announcement' 🚩\n→ Admiral Ackbar with SALMON colored skin yelling: 'IT'S A TRAP!' in ORANGE alert setting",
      
      "POV: You just learned what slippage means the hard way 💧\n→ Mike Wazowski-Sulley face swap in TEAL and PURPLE, disturbing and confused in OFFICE",
      
      "When the coin you paper-handed pumps 1000% 😭\n→ Crying Michael Jordan meme in RED Bulls jersey with TEARS streaming down face in GREY background",
      
      "Me trying to time the market vs just holding 📈\n→ Medieval knight with SILVER armor hitting himself with his own sword in CASTLE background with STONE walls",
      
      "When you realize 'utility token' means nothing 🎪\n→ Joker with PURPLE suit slow clap in DARK room with GREEN hair",
      
      "POV: You're trying to explain NFTs to your boomer dad 🖼️\n→ Trying to explain to OLDER man with GREY hair meme format: 'It's a JPEG but on the blockchain' in LIVING ROOM",
      
      "That feeling when your coin survives a bear market 🐻\n→ Frodo with CURLY BROWN hair and Sam with BLONDE hair: 'It's over, it's done' on GREY ROCKY mountain",
      
      "When you see 'Doxxed Team' as a selling point 👥\n→ Kermit tea meme with GREEN felt sipping tea: 'But that's none of my business' in WINDOW seat",
      
      "Me watching whales manipulate the price 🐋\n→ Squidward with TEAL face watching through window at SpongeBob with YELLOW skin having fun in UNDERWATER setting",
      
      "When someone says 'Just stake it for passive income' 💰\n→ Anakin with DARK BROWN hair smiling, Padme with BROWN hair worried on VERANDA: 'And I'll get my principal back right?'",
      
      "POV: You're experiencing your first crypto winter ❄️\n→ Jack Nicholson with GREY beard nodding approvingly in PURPLE seat at BASKETBALL game",
      
      "When you finally break even after 2 years 🎯\n→ Leonardo DiCaprio in WHITE shirt raising glass cheers in LAVISH party with GOLD decorations",
      
      "That moment you discover DeFi yields are not sustainable 📉\n→ Bernie Sanders with GREY hair in BLUE winter coat: 'I am once again asking for my funds' at PODIUM",
      
      "Me after one green candle: 'I'm a trading genius' 🧠\n→ Tony Stark with BLACK goatee in IRON MAN suit: 'Genius, billionaire, playboy, philanthropist' in HIGH TECH lab",
      
      "When the whitepaper is just buzzword soup 📄\n→ Confused Travolta in BLACK suit looking around in PULP FICTION scene with RETRO colors",
      
      "POV: You're trying to explain your leverage trade gone wrong 📊\n→ Math lady with BLONDE hair confused meme with FLOATING white math equations around her head",
      
      "That feeling when you survive a 90% drawdown 💪\n→ Thanos with PURPLE skin: 'I used the stones to destroy the stones' in ORANGE sunset wasteland",
      
      "When someone asks if you're worried about regulation 🏛️\n→ Fast and Furious meme with BALD Vin Diesel in BLACK shirt: 'I don't have regulation, I have family' at DINNER table",
      
      "Me after watching one YouTube video on technical analysis 📺\n→ I know kung fu Neo in BLACK coat and sunglasses from Matrix in GREEN code background",
      
      "When you realize the 'team' is just one guy with Canva 🎨\n→ Two Spider-Men with RED and BLUE suits pointing at each other but both labeled 'CEO, CTO, CMO' on STREET",
      
      "POV: You're explaining why you need 'just one more' altcoin 🎰\n→ Gollum with PALE GREY skin: 'We needs it' holding GOLDEN ring in DARK cave with BLUE glow",
      
      "That moment when 'When Lambo?' becomes 'When Honda?' 🚗\n→ Pablo Escobar with BLACK hair waiting meme looking sad and bored in OUTDOOR setting with GREY concrete",
      
      "When you see 'Community Driven' in the roadmap 🗺️\n→ Troy from Community in ORANGE shirt walking into burning PIZZA place with FLAMES everywhere",
      
      "Me pretending to understand tokenomics during AMAs 🎤\n→ Elmo with RED fur shrugging with hands up with YELLOW background: 'I don't know what's going on'",
      
      "When your moon bag becomes a crater bag 🌙\n→ Doge in GOLD and BROWN looking unimpressed: 'Much loss, very sad, wow' in SIMPLE background",
      
      "POV: You're bag holding through another cycle 💼\n→ Waiting skeleton in GREY bones at desk with COBWEBS: 'Still accumulating' with DUSTY computer",
      
      "That feeling when gas fees eat your entire profit 😤\n→ Arthur fist meme with YELLOW clenched fist on WOODEN table with BEIGE sleeve",
      
      "When the 'dip' keeps dipping for 6 months straight 📉\n→ This is fine dog with BROWN fur in burning ORANGE room with COFFEE mug: 'This is fine'",
      
      "Me after reading 'Smart Contracts' for the first time 🤓\n→ Pointing Rick Dalton in ORANGE and BROWN 70s outfit: 'That's exactly what I'm talking about!'",
      
      "When you realize your portfolio is 90% memecoins 🎪\n→ Everything is fine dolphin with GREY skin floating belly-up in BLUE water",
      
      "POV: You're trying to explain impermanent loss 💧\n→ Pepe with GREEN skin at whiteboard with RED marker: 'It's not a loss if...' then trails off looking confused",
      
      "That moment when 'Soon™' becomes a year later ⏰\n→ Grandpa Simpson with GREY hair walking in with HAT then walking out in YELLOW house meme",
      
      "When you discover your coin's subreddit has 47 members 👥\n→ John Travolta in BLACK confused meme looking around empty GREY space",
      
      "Me after one successful trade: 'Maybe I should quit my job' 💼\n→ Office Space with GREY cubicles guy: 'Yeah, I'm gonna need you to come in...' but guy is already gone",
      
      "When 'Hold for 5 years' becomes 'Hold my bags' 💰\n→ Disappointed Black guy in ORANGE shirt blinking with WHITE eyes meme in CONFUSION",
      
      "POV: Your stop loss triggers then it pumps 🎯\n→ Thomas the Tank Engine with BLUE body and RED buffers shocked face with WIDE eyes",
      
      "That feeling when you realize ponzinomics too late 💀\n→ Bernie Mac in BROWN suit side-eye with JUDGEMENTAL look in COMEDY show setting",
      
      "When 'Locked liquidity' unlocks next week 🔓\n→ Chuckles the clown: 'I'm in danger' with YELLOW Simpsons character looking nervous",
      
      "Me explaining why this time is different 🔄\n→ Bike fall meme with stick figure in BLACK falling off bike then blaming stick in the WHEELS",
      
      "When you're down so bad you become a long-term investor 📚\n→ Hide the pain Harold with GREY hair and beard forcing smile with BLUE office background",
      
      "POV: You just discovered what 'diluted market cap' means 💦\n→ Shocked Chris Pratt in ORANGE vest from Jurassic World: 'Oh my god' in JUNGLE",
      
      "That moment when your TA says moon but it dumps 🌙\n→ Guy tapping head knowingly: 'Can't be wrong about TA if you pretend you never made predictions'",
      
      "When 'Certik Audited' still gets exploited 🛡️\n→ Surprised Pikachu with BRIGHT YELLOW fur and RED cheeks with mouth wide open on PLAIN background",
      
      "Me after one economics podcast: 'Let me tell you about macro' 🎙️\n→ Always Sunny title card with YELLOW text: 'The Gang Doesn't Understand Macro'",
      
      "When your coin's only use case is buying more of the coin 🔄\n→ Confused Jackie Chan in BLUE jacket with hands up surrounded by ASIAN text: 'But why?'",
      
      "POV: You're reading the 50th protocol's docs 📖\n→ Stanley from The Office in TAN shirt looking directly at camera with DEAD expression in BEIGE office"
    ];

    // Get last 40 used descriptions to avoid repetition
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
    
    // Filter out the last 40 descriptions and select a new one
    const availableDescriptions = memeDescriptions.filter(desc => !lastDescriptions.includes(desc));
    const randomDescription = availableDescriptions.length > 0 
      ? availableDescriptions[Math.floor(Math.random() * availableDescriptions.length)]
      : memeDescriptions[Math.floor(Math.random() * memeDescriptions.length)];
    
    console.log('Generating meme with prompt:', randomDescription);

    // Update the last used descriptions (keep last 40)
    const updatedHistory = [randomDescription, ...lastDescriptions].slice(0, 40);
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
