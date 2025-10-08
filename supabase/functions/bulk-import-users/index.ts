import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserRow {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { users } = await req.json();
    
    if (!users || !Array.isArray(users)) {
      throw new Error('Invalid users data');
    }

    console.log(`Bulk importing ${users.length} users...`);

    // Process in batches of 100
    const batchSize = 100;
    let totalImported = 0;
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('telegram_users')
        .upsert(
          batch.map((user: UserRow) => ({
            telegram_id: user.telegram_id,
            username: user.username || null,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
          })),
          { onConflict: 'telegram_id' }
        );

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      totalImported += batch.length;
      console.log(`Imported ${totalImported}/${users.length} users`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: totalImported,
        message: `Successfully imported ${totalImported} users`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk-import-users:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
