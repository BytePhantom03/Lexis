// supabase/functions/voice-to-article/index.ts
// Supabase Edge Function — receives audio, transcribes via Whisper, cleans via Llama.
// Deploy: supabase functions deploy voice-to-article --no-verify-jwt

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Max-Age": "86400",
};

const CLEANUP_PROMPT = `You are a transcription editor.
Clean the following raw speech transcript into blog-ready text.

Rules:
- Remove filler words: "uh", "um", "like", "you know", "so", "right", "basically", "actually"
- Remove false starts and repeated phrases
- Add punctuation and capitalization
- Break into paragraphs at natural topic shifts
- Keep ALL the writer's ideas and their order exactly
- Do NOT add new ideas, examples, or sentences
- Do NOT improve the writing — only clean it
- Do NOT change the writer's vocabulary or voice
- If the transcript is in a non-English language, keep it in that language

Raw transcript:
"{transcript}"

Return only the cleaned text, no preamble.`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight — must return 200 with all headers
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse JSON body containing raw_text
    const body = await req.json();
    const rawText = body?.raw_text;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No raw_text provided or text is empty" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── LLM cleanup pass via Llama 3.3 ─────────────────────────
    const cleanupPrompt = CLEANUP_PROMPT.replace("{transcript}", rawText);

    const cleanupResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: cleanupPrompt }],
          max_tokens: 2000,
          temperature: 0.1, // Low temp = literal, no creative additions
        }),
      }
    );

    if (!cleanupResponse.ok) {
      const errText = await cleanupResponse.text();
      console.error("LLM cleanup error:", cleanupResponse.status, errText);
      // Fallback: return raw transcript without cleanup
      return new Response(
        JSON.stringify({
          raw_transcript: rawText.trim(),
          cleaned_text: rawText.trim(),
          cleanup_failed: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanupData = await cleanupResponse.json();
    const cleanedText =
      cleanupData.choices?.[0]?.message?.content?.trim() || rawText.trim();

    return new Response(
      JSON.stringify({
        raw_transcript: rawText.trim(),
        cleaned_text: cleanedText,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Voice-to-article error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
