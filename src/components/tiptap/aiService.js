// src/components/tiptap/aiService.js
// Client-side service that calls Groq API directly using .env key.

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const PROMPTS = {
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
