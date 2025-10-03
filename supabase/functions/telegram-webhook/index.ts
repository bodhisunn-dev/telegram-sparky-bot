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
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const update = await req.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Extract message data
    const message = update.message || update.edited_message;
    if (!message) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const chatId = message.chat.id;
    const telegramUserId = message.from.id;
    const username = message.from.username || '';
    const firstName = message.from.first_name || '';
    const lastName = message.from.last_name || '';
    const messageText = message.text || message.caption || '';

    // Upsert user
    const { data: userData, error: userError } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: telegramUserId,
        username,
        first_name: firstName,
        last_name: lastName,
        last_active_at: new Date().toISOString()
      }, {
        onConflict: 'telegram_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (userError) {
      console.error('Error upserting user:', userError);
    }

    // Update message count
    if (userData) {
      await supabase
        .from('telegram_users')
        .update({
          message_count: (userData.message_count || 0) + 1,
          engagement_score: (userData.engagement_score || 0) + 1
        })
        .eq('id', userData.id);
    }

    // Store message
    await supabase.from('messages').insert({
      telegram_user_id: userData?.id,
      chat_id: chatId,
      message_text: messageText,
      is_bot_message: false
    });

    // React to every message with a random emoji
    if (messageText && !messageText.startsWith('/')) {
      const reactions = ['👍', '❤️', '👏', '🔥', '⭐', '💯', '🎉', '🚀', '⚡', '✨', '🎯', '💪', '🌟'];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
      await setMessageReaction(chatId, message.message_id, randomReaction);
    }

    // Get bot config
    const { data: config } = await supabase.from('bot_config').select('*');
    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>) || {};

    // Handle pinned messages command
    if (messageText.startsWith('/pinned')) {
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
      
      // Get chat info to see if it's a forum
      const chatInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`);
      const chatInfo = await chatInfoResponse.json();
      
      let pinnedMessages = [];
      
      if (chatInfo.result?.is_forum) {
        // For forum chats, we need to get pinned messages from the general topic
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getForumTopicIconStickers`);
        await sendTelegramMessage(chatId, '📌 Pinned messages in forum chats require viewing each topic individually. Please check the pinned icon in each topic!');
      } else {
        // For regular groups, get pinned message
        if (chatInfo.result?.pinned_message) {
          const msg = chatInfo.result.pinned_message;
          const text = msg.text || msg.caption || '(Media message)';
          await sendTelegramMessage(chatId, `📌 *Pinned Message:*\n\n${text}`);
        } else {
          await sendTelegramMessage(chatId, '📌 No pinned messages found in this chat.');
        }
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle Twitter raid links command
    if (messageText.startsWith('/x')) {
      // Query recent messages from raidshark bot for raid links
      const { data: raidMessages } = await supabase
        .from('messages')
        .select('message_text, created_at')
        .eq('chat_id', chatId)
        .ilike('message_text', '%twitter.com%')
        .order('created_at', { ascending: false })
        .limit(20);

      if (raidMessages && raidMessages.length > 0) {
        let raidLinks = '🐦 *Active Twitter Raids* 🐦\n\n';
        let linkCount = 0;
        
        for (const msg of raidMessages) {
          // Extract Twitter/X links
          const twitterRegex = /(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[^\s]+/gi;
          const matches = msg.message_text.match(twitterRegex);
          
          if (matches && linkCount < 10) {
            for (const link of matches) {
              if (linkCount < 10) {
                raidLinks += `${linkCount + 1}. ${link}\n\n`;
                linkCount++;
              }
            }
          }
        }
        
        if (linkCount > 0) {
          await sendTelegramMessage(chatId, raidLinks);
        } else {
          await sendTelegramMessage(chatId, '🐦 No active Twitter raid links found. Start raiding! 🚀');
        }
      } else {
        await sendTelegramMessage(chatId, '🐦 No Twitter raid links found yet. Let\'s get raiding! 🚀');
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle top users command
    if (messageText.startsWith('/top')) {
      const { data: topUsers } = await supabase
        .from('telegram_users')
        .select('id, first_name, username, message_count, engagement_score')
        .order('engagement_score', { ascending: false })
        .order('message_count', { ascending: false })
        .limit(10);

      if (topUsers && topUsers.length > 0) {
        let leaderboardText = '🏆 *Top Chads/Chadettes* 🏆\n\n';
        
        for (const [index, user] of topUsers.entries()) {
          const name = user.first_name || user.username || 'Anonymous';
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          
          // Count image generations for this user
          const { count: imageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('telegram_user_id', user.id)
            .ilike('message_text', '/generate%');
          
          leaderboardText += `${medal} ${name}\n`;
          leaderboardText += `   💬 ${user.message_count} messages | 🔥 ${user.engagement_score} engagement`;
          if (imageCount && imageCount > 0) {
            leaderboardText += ` | 🎨 ${imageCount} images`;
          }
          leaderboardText += '\n\n';
        }
        
        await sendTelegramMessage(chatId, leaderboardText);
      } else {
        await sendTelegramMessage(chatId, 'No users yet! Start chatting to get on the leaderboard! 🚀');
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle gm/gn auto-responses
    const lowerText = messageText.toLowerCase().trim();
    if (configMap.gm_enabled && (lowerText === 'gm' || lowerText.includes('good morning'))) {
      await sendTelegramMessage(chatId, `Good morning ${firstName}! ☀️ Have a great day!`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (configMap.gn_enabled && (lowerText === 'gn' || lowerText.includes('good night'))) {
      await sendTelegramMessage(chatId, `Good night ${firstName}! 🌙 Sweet dreams!`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle image remix requests
    if (messageText.startsWith('/remix')) {
      const description = messageText.replace('/remix', '').trim();
      
      // Check if message has a photo
      if (message.photo && message.photo.length > 0) {
        const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
        
        // Get the largest photo
        const photo = message.photo[message.photo.length - 1];
        
        // Get file path from Telegram
        const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${photo.file_id}`);
        const fileData = await fileResponse.json();
        
        if (fileData.ok) {
          const filePath = fileData.result.file_path;
          const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
          
          await sendTelegramMessage(chatId, `🎨 Remixing your image with: "${description}"...`);
          
          // Call remix-image function
          const { data: remixData, error: remixError } = await supabase.functions.invoke('remix-image', {
            body: { imageUrl: fileUrl, description }
          });

          if (remixError) {
            console.error('Image remix error:', remixError);
            await sendTelegramMessage(chatId, 'Sorry, I had trouble remixing that image. Please try again!');
          } else if (remixData?.image) {
            // Send remixed image back to Telegram
            await sendTelegramPhoto(chatId, remixData.image);
          }
        }
      } else {
        await sendTelegramMessage(chatId, '📸 Please upload an image with the /remix command!\n\nExample: Send a photo with caption "/remix make it cyberpunk style"');
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle image generation requests
    if (configMap.image_gen_enabled && messageText.includes('/generate')) {
      const prompt = messageText.replace('/generate', '').trim();
      if (prompt) {
        await sendTelegramMessage(chatId, `Generating image: "${prompt}"...`);
        
        // Call image generation function
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
          body: { prompt }
        });

        if (imageError) {
          console.error('Image generation error:', imageError);
          await sendTelegramMessage(chatId, 'Sorry, I had trouble generating that image.');
        } else if (imageData?.image) {
          // Send image back to Telegram
          await sendTelegramPhoto(chatId, imageData.image);
        }
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle AI conversation
    if (configMap.conversation_mode && messageText && !messageText.startsWith('/')) {
      // Get recent conversation history
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('message_text, is_bot_message')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Call AI function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: messageText,
          chatId,
          history: recentMessages || []
        }
      });

      if (aiError) {
        console.error('AI chat error:', aiError);
      } else if (aiData?.response) {
        await sendTelegramMessage(chatId, aiData.response);
        
        // Store bot response
        await supabase.from('messages').insert({
          telegram_user_id: userData?.id,
          chat_id: chatId,
          message_text: aiData.response,
          is_bot_message: true
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}

async function sendTelegramPhoto(chatId: number, photoBase64: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    // Remove data URL prefix if present
    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('photo', new Blob([bytes], { type: 'image/png' }), 'image.png');
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram sendPhoto error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error sending photo:', error);
  }
}

async function setMessageReaction(chatId: number, messageId: number, emoji: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/setMessageReaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reaction: [{ type: 'emoji', emoji }],
      }),
    });
  } catch (error) {
    console.error('Error setting reaction:', error);
  }
}
