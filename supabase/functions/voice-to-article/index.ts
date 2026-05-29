// supabase/functions/voice-to-article/index.ts
// Supabase Edge Function — receives audio, transcribes via Whisper, cleans via Llama.
// Deploy: supabase functions deploy voice-to-article --no-verify-jwt

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    // Parse the multipart form data
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size — reject over 10MB (~20 min of speech)
    if (audioFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          error: "Audio file too large. Maximum 10MB (about 20 minutes).",
        }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Stage 4: Whisper transcription via Groq ──────────────────────────
    const whisperFormData = new FormData();
    whisperFormData.append("file", audioFile, "recording.webm");
    whisperFormData.append("model", "whisper-large-v3-turbo");
    whisperFormData.append("response_format", "text");
    whisperFormData.append("language", "en");

    const whisperResponse = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: whisperFormData,
      }
    );

    if (!whisperResponse.ok) {
      const errText = await whisperResponse.text();
      console.error("Whisper API error:", whisperResponse.status, errText);
      return new Response(
        JSON.stringify({
          error: "Transcription failed",
          details: errText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const rawTranscript = await whisperResponse.text();

    // If Whisper returned nothing useful
    if (!rawTranscript || rawTranscript.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "No speech detected",
          raw_transcript: "",
          cleaned_text: "",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Stage 5: LLM cleanup pass via Llama 3.3 ─────────────────────────
    const cleanupPrompt = CLEANUP_PROMPT.replace("{transcript}", rawTranscript);

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
          raw_transcript: rawTranscript.trim(),
          cleaned_text: rawTranscript.trim(),
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
      cleanupData.choices?.[0]?.message?.content?.trim() || rawTranscript.trim();

    return new Response(
      JSON.stringify({
        raw_transcript: rawTranscript.trim(),
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
