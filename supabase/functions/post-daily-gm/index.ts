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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Posting daily GM to Twitter...');

    const gmMessages = [
      "GM Degens, hope you make it out the trenches today 💪",
      "GM! Another day, another chance to not get rekt 🚀",
      "GM fam, let's secure these gains today 💎",
      "GM kings! Time to stack sats and dodge rugs 👑",
      "GM! May your bags pump and your losses be minimal 📈",
      "GM degens! Stay sharp, the market's spicy today 🌶️",
      "GM! Remember: DYOR before you get REKT 🔍",
      "GM! Exit liquidity szn or generational wealth? You decide 💰",
      "GM crew! Don't fade the alpha today 🧠",
      "GM! Wen moon? Today we find out 🌙",
      "GM legends! Let's catch some pumps today 🎯",
      "GM! May your entries be perfect and exits timely 🎲",
      "GM degens! Time to hunt for 100x gems 💎",
      "GM! Stay based, stay humble, stack harder 🔥",
      "GM fam! Another day surviving in these markets 🛡️",
      "GM! Your portfolio might be down but your spirits stay up 💪",
      "GM kings! Let's turn those losses into lessons 📚",
      "GM! WAGMI if we stick together 🤝",
      "GM degens! May your trades be profitable today 🎰",
      "GM! Time to prove the haters wrong again 💯"
    ];

    const randomMessage = gmMessages[Math.floor(Math.random() * gmMessages.length)];
    
    console.log('Posting GM:', randomMessage);
    const result = await sendTweet(randomMessage);
    console.log('Twitter GM posted successfully:', result.data?.id);

    return new Response(JSON.stringify({ ok: true, message: randomMessage, tweet_id: result.data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in post-daily-gm function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});