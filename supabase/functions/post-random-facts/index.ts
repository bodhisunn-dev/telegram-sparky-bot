import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Generate a random fact using Lovable AI
    const topics = [
      "cryptocurrency and blockchain technology",
      "memecoins and their impact on crypto culture",
      "social media trends and viral content",
      "artificial intelligence and machine learning",
      "tech innovations and startups",
      "Web3 and decentralized applications",
      "NFTs and digital art",
      "online communities and internet culture"
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

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
            content: 'You are a fun and engaging bot that shares interesting facts. Keep facts concise (2-3 sentences), accurate, and entertaining. Add relevant emojis.'
          },
          {
            role: 'user',
            content: `Share an interesting and little-known fact about ${randomTopic}. Make it engaging and fun!`
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
    const fact = aiData.choices[0].message.content;

    // Send the fact to Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `💡 *Random Fact* 💡\n\n${fact}`,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    console.log('Fact posted:', result);

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
