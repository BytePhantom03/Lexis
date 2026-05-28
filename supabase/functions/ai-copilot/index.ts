// supabase/functions/ai-copilot/index.ts
// Supabase Edge Function — streams Groq LLM responses to the frontend.
// Deploy: supabase functions deploy ai-copilot --no-verify-jwt

const PROMPTS: Record<string, (text: string) => string> = {
  autocomplete: (text) =>
    `You are a writing assistant. Continue this paragraph naturally in the same voice and style. Write only 1-2 sentences. Do NOT repeat the original text. Only output the continuation.\n\nText: "${text}"`,
  expand: (text) =>
    `You are a writing assistant. Expand this into 2 rich, detailed paragraphs while maintaining the same author voice and style. Do NOT repeat the original text. Only output the expansion.\n\nText: "${text}"`,
  shorten: (text) =>
    `You are a writing assistant. Rewrite this in roughly half the words while keeping the core idea intact. Do NOT add any preamble. Only output the shortened version.\n\nText: "${text}"`,
  rewrite_professional: (text) =>
    `Rewrite the following text in a professional, formal tone. Do NOT add any preamble or explanation. Only output the rewritten text.\n\nText: "${text}"`,
  rewrite_casual: (text) =>
    `Rewrite the following text in a casual, friendly, conversational tone. Do NOT add any preamble or explanation. Only output the rewritten text.\n\nText: "${text}"`,
  rewrite_witty: (text) =>
    `Rewrite the following text with dry wit, humor, and personality. Do NOT add any preamble or explanation. Only output the rewritten text.\n\nText: "${text}"`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { command, text } = await req.json();

    if (!command || !text) {
      return new Response(
        JSON.stringify({ error: "Missing command or text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const promptFn = PROMPTS[command];
    if (!promptFn) {
      return new Response(
        JSON.stringify({ error: `Unknown command: ${command}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Groq API with streaming
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptFn(text) }],
          stream: true,
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();
      return new Response(
        JSON.stringify({ error: "Groq API error", details: errorBody }),
        { status: groqResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the SSE response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(
                    new TextEncoder().encode(`data: [DONE]\n\n`)
                  );
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ content })}\n\n`
                      )
                    );
                  }
                } catch {
                  // Skip malformed JSON chunks
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
