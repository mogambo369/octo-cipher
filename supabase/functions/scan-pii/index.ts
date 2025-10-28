import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textContent } = await req.json();
    
    if (!textContent || typeof textContent !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid text content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scanning text for PII, length:', textContent.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a security analyst specializing in detecting Personally Identifiable Information (PII).
Analyze the provided text and identify ALL instances of sensitive data including:
- Email addresses
- Phone numbers (any format)
- Credit card numbers
- Social Security Numbers
- Street addresses
- IP addresses
- Dates of birth
- Full names (when appearing with other PII)
- Passport numbers
- Driver's license numbers
- Bank account numbers
- Any other identifiable personal information

Return ONLY a JSON array. Each object must have exactly two properties:
- "type": The category of PII (e.g., "Email Address", "Phone Number", "Credit Card")
- "value": The actual sensitive data found (redact middle digits for credit cards/SSN)

If no PII is found, return an empty array: []`
          },
          {
            role: 'user',
            content: `Scan this text for PII:\n\n${textContent.substring(0, 10000)}` // Limit to first 10k chars
          }
        ],
        temperature: 0.1, // Low temperature for consistent detection
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('Invalid AI response format');
    }

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from the AI
    let piiResults;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      piiResults = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Try to extract any JSON array from the response
      const arrayMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        piiResults = JSON.parse(arrayMatch[0]);
      } else {
        piiResults = [];
      }
    }

    // Validate the response format
    if (!Array.isArray(piiResults)) {
      console.warn('AI response was not an array, wrapping in array');
      piiResults = [];
    }

    console.log('Scan complete, found', piiResults.length, 'PII items');

    return new Response(
      JSON.stringify({ 
        piiResults,
        scannedLength: textContent.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in scan-pii function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
