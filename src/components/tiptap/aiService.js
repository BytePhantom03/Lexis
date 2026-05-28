// src/components/tiptap/aiService.js
// Client-side service that calls Groq API directly using .env key.

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const PROMPTS = {
  autocomplete: (text) =>
    `You are a writing assistant. Read the following sentences to understand the voice and thought direction. Continue writing from exactly where it left off. Write exactly one natural sentence. Do NOT repeat the existing text. Do NOT add any preamble.\n\nContext:\n"${text}"`,
  expand: (text) =>
    `You are a writing assistant. Take this rough idea or bullet point and build it into a full, detailed, and rich paragraph. Maintain the author's voice. Do NOT add any preamble or explanation.\n\nSeed text:\n"${text}"`,
  shorten: (text) =>
    `You are a writing assistant. Strip this text down to its core idea in roughly half the words. Remove filler but keep the most important details and original tone. Do NOT add any preamble.\n\nOriginal text:\n"${text}"`,
  rewrite_professional: (text) =>
    `Rewrite the following text in a professional, formal, and polished tone. Do NOT add any preamble or explanation. Only output the rewritten text.\n\nText: "${text}"`,
  rewrite_casual: (text) =>
    `Rewrite the following text in a casual, friendly, and conversational tone. Do NOT add any preamble or explanation. Only output the rewritten text.\n\nText: "${text}"`,
  rewrite_witty: (text) =>
    `Rewrite the following text with dry wit, humor, and personality. Do NOT add any preamble or explanation. Only output the rewritten text.\n\nText: "${text}"`,
};

/**
 * Calls the Groq API directly and streams the response.
 * @param {string} command - One of: autocomplete, expand, shorten, rewrite_professional, rewrite_casual, rewrite_witty
 * @param {string} text - The paragraph text to process
 * @param {(chunk: string) => void} onChunk - Callback fired for each streamed text chunk
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the stream
 * @returns {Promise<string>} - The full generated text
 */
export async function streamAIResponse(command, text, onChunk, signal) {
  const promptFn = PROMPTS[command];
  if (!promptFn) {
    throw new Error(`Unknown AI command: ${command}`);
  }

  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY is not set in your .env file");
  }

  const response = await fetch(GROQ_API_URL, {
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
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
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
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(content);
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
