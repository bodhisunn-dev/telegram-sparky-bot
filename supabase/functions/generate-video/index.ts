import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageUrl, type } = await req.json();
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY not configured');
    }

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    console.log(`Generating ${type} video...`);

    let output;

    if (type === 'text-to-video') {
      // Text to video using Minimax video-01
      output = await replicate.run(
        "minimax/video-01",
        {
          input: {
            prompt: prompt,
          }
        }
      );
    } else if (type === 'image-to-video') {
      // Image to video using Luma Dream Machine
      output = await replicate.run(
        "lucataco/animate-diff",
        {
          input: {
            path: imageUrl,
            seed: 255224557,
            steps: 25,
            prompt: "high quality, best quality",
            n_prompt: "worst quality, low quality",
            motion_module: "mm_sd_v15_v2",
            guidance_scale: 7.5,
          }
        }
      );
    } else {
      throw new Error('Invalid video generation type');
    }

    console.log('Video generated successfully:', output);

    return new Response(JSON.stringify({ video: output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-video function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
