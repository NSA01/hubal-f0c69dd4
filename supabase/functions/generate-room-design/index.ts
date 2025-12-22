import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { imageUrl, prompt, roomDesignId } = await req.json();

    if (!imageUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Image URL and prompt are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating room design with prompt:', prompt);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to generating
    if (roomDesignId) {
      await supabase
        .from('room_designs')
        .update({ status: 'generating' })
        .eq('id', roomDesignId);
    }

    // Use Lovable AI with Gemini image generation model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              },
              {
                type: "text",
                text: `Generate a new image of this room redesigned as: "${prompt}". 

IMPORTANT: You MUST generate and output an actual image showing the redesigned room. Transform this room photo into a beautiful, realistic redesigned version that incorporates the requested style while maintaining the room's basic structure and dimensions. Output the redesigned room as an image.`
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || '';

    if (!generatedImageUrl) {
      console.error('No image generated, response:', JSON.stringify(data));
      
      if (roomDesignId) {
        await supabase
          .from('room_designs')
          .update({ status: 'failed' })
          .eq('id', roomDesignId);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: textResponse }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the room design with generated image
    if (roomDesignId) {
      await supabase
        .from('room_designs')
        .update({ 
          generated_image_url: generatedImageUrl,
          status: 'completed'
        })
        .eq('id', roomDesignId);
    }

    return new Response(
      JSON.stringify({ 
        generatedImageUrl,
        description: textResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-room-design:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
