// src/components/tiptap/aiService.js
// Client-side service to call the Supabase Edge Function and stream the response.

import supabase from "../../config/supabaseClient";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Calls the AI copilot edge function and streams the response.
 * @param {string} command - One of: autocomplete, expand, shorten, rewrite_professional, rewrite_casual, rewrite_witty
 * @param {string} text - The paragraph text to process
 * @param {(chunk: string) => void} onChunk - Callback fired for each streamed text chunk
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the stream
 * @returns {Promise<string>} - The full generated text
 */
export async function streamAIResponse(command, text, onChunk, signal) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-copilot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    },
    body: JSON.stringify({ command, text }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullText += parsed.content;
            onChunk(parsed.content);
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}
