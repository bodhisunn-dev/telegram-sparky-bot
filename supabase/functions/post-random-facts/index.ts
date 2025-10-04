import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twitter OAuth 1.0a helper functions
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  return signature;
}

function generateOAuthHeader(
  method: string, 
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    consumerSecret,
    accessTokenSecret
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function sendTweet(tweetText: string): Promise<any> {
  const CONSUMER_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
  const CONSUMER_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
  const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
  const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

  if (!CONSUMER_KEY || !CONSUMER_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    throw new Error("Missing Twitter credentials");
  }

  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  
  const oauthHeader = generateOAuthHeader(
    method, 
    url, 
    CONSUMER_KEY, 
    CONSUMER_SECRET, 
    ACCESS_TOKEN, 
    ACCESS_TOKEN_SECRET
  );

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: tweetText }),
  });

  const responseText = await response.text();
  console.log("Twitter API Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `Twitter API error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Generating random fact...');

    // Get the chat ID from recent messages
    const { data: recentMessage } = await supabase
      .from('messages')
      .select('chat_id')
      .limit(1)
      .single();

    if (!recentMessage) {
      console.log('No chat found');
      return new Response(JSON.stringify({ ok: true, message: 'No chat found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const chatId = recentMessage.chat_id;

    // Generate a random fact using Lovable AI focused on crypto trends
    const topics = [
      "cryptocurrency market manipulation and pump-and-dump schemes",
      "DeFi protocol hacks and rug pulls that cost millions", 
      "Layer 1 blockchain wars and competition",
      "Layer 2 scaling solutions and rollups",
      "memecoin launches and moonshot stories",
      "crypto scams and how to spot them",
      "decentralized exchanges (DEX) vs centralized exchanges",
      "liquidity pools and impermanent loss",
      "tokenomics and supply/demand dynamics",
      "smart contract vulnerabilities and exploits",
      "NFT flipping and trading strategies",
      "whale wallets and their market impact",
      "crypto influencer pump schemes",
      "decentralized autonomous organizations (DAOs)",
      "cross-chain bridges and bridge hacks",
      "stablecoin depegging events",
      "crypto airdrops and farming strategies",
      "meme coin culture and viral tokens",
      "on-chain analytics and wallet tracking",
      "MEV (Maximal Extractable Value) and sandwich attacks",
      "crypto Twitter (CT) trends and alpha calls",
      "presales, ICOs, and token generation events",
      "crypto regulation news and government crackdowns",
      "blockchain gaming and play-to-earn models",
      "real-time crypto market trends and hot coins"
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    const promptStyles = [
      `About ${randomTopic}: Give me ONE spicy fact in 10 words or less.`,
      `${randomTopic}: Drop a hot take in 8 words max.`,
      `Give the wildest truth about ${randomTopic} in under 10 words.`,
      `${randomTopic}: Most degen thing in 8 words or less.`,
      `Expose ${randomTopic} in ONE ultra-short sentence. Max 10 words.`
    ];
    
    const randomPrompt = promptStyles[Math.floor(Math.random() * promptStyles.length)];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You write ONE ultra-short crypto fact. MAXIMUM 100 characters including emojis. One sentence only. Use degen slang. Be spicy. NO long explanations.'
          },
          {
            role: 'user',
            content: randomPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI response error:', aiResponse.status);
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiResponse.json();
    let fact = aiData.choices[0].message.content;
    
    // Aggressively trim if too long
    if (fact.length > 100) {
      fact = fact.substring(0, 97) + '...';
    }
    
    console.log('Generated fact:', fact, '- Length:', fact.length);

    // Check if this fact was posted recently (within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentFacts } = await supabase
      .from('posted_facts')
      .select('fact_text')
      .gte('posted_at', sevenDaysAgo);

    // Check for similarity (simple substring check)
    const isDuplicate = recentFacts?.some(rf => 
      rf.fact_text.toLowerCase().includes(fact.toLowerCase().substring(0, 50)) ||
      fact.toLowerCase().includes(rf.fact_text.toLowerCase().substring(0, 50))
    );

    if (isDuplicate) {
      console.log('Fact too similar to recent post, skipping');
      return new Response(JSON.stringify({ ok: true, message: 'Duplicate fact skipped' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send the fact to Telegram with simple format
    const telegramText = `🔥 Crypto Truth: ${fact}`;
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram posted:', telegramResult.ok);

    // Post to Twitter/X (keep under 280 chars)
    try {
      // Simple format for Twitter - just the fact with emojis
      const tweetText = `🔥 ${fact}`;
      
      // Double check character count (emojis count as 2 chars on Twitter)
      if (tweetText.length > 280) {
        console.error('Tweet too long:', tweetText.length, 'chars');
        throw new Error('Tweet exceeds 280 character limit');
      }
      
      console.log('Posting tweet:', tweetText, '- Length:', tweetText.length);
      const twitterResult = await sendTweet(tweetText);
      console.log('Twitter fact posted:', twitterResult);
    } catch (twitterError) {
      console.error('Failed to post to Twitter:', twitterError);
      // Continue execution even if Twitter fails
    }

    // Store the posted fact
    await supabase
      .from('posted_facts')
      .insert({
        fact_text: fact,
        chat_id: chatId
      });

    return new Response(JSON.stringify({ ok: true, fact }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in post-random-facts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
