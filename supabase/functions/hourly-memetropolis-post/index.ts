import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    console.log('Starting hourly Memetropolis post to Twitter...');

    // Select random message
    const randomMessage = degenMessages[Math.floor(Math.random() * degenMessages.length)];
    
    console.log('Posting to Twitter:', randomMessage);
    const result = await sendTweet(randomMessage);
    console.log('Twitter post successful:', result.data?.id);

    return new Response(JSON.stringify({ ok: true, message: randomMessage, tweet_id: result.data?.id }), {
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
