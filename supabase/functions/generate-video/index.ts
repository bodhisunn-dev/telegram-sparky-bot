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
      // Text to video using ZeroScope
      output = await replicate.run(
        "anotherjesse/zeroscope-v2-xl",
        {
          input: {
            prompt: prompt,
            num_frames: 24,
            num_inference_steps: 50,
          }
        }
      );
    } else if (type === 'image-to-video') {
      // Image to video using Stable Video Diffusion
      output = await replicate.run(
        "stability-ai/stable-video-diffusion",
        {
          input: {
            input_image: imageUrl,
            cond_aug: 0.02,
            decoding_t: 14,
            video_length: "14_frames_with_svd",
            sizing_strategy: "maintain_aspect_ratio",
            motion_bucket_id: 127,
            frames_per_second: 6,
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
