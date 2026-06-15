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
  rewrite_professional: (text, context) =>
    `You are an expert editor. Rewrite the following paragraph. Maintain all factual content, increase sentence formality, use precise vocabulary, eliminate contractions, and target someone reading in a business or academic context. Do NOT add any preamble. Only output the rewritten paragraph.\n\nContext:\n${context}\n\nParagraph to rewrite:\n"${text}"`,
  rewrite_casual: (text, context) =>
    `You are an expert editor. Rewrite the following paragraph to read like the author is talking to a smart friend. Use contractions, make sentences shorter and punchier, make the first person feel natural. A single sentence can stand alone for emphasis. Keep conversational warmth without losing the core argument. Do NOT add any preamble. Only output the rewritten paragraph.\n\nContext:\n${context}\n\nParagraph to rewrite:\n"${text}"`,
  rewrite_witty: (text, context) =>
    `You are an expert editor. Rewrite the following paragraph. Keep the core idea but introduce one moment of dry observation, unexpected word choice, or ironic framing. This is NOT comedy writing or stand-up—just add a texture of personality that makes someone pause and re-read. Do NOT add any preamble. Only output the rewritten paragraph.\n\nContext:\n${context}\n\nParagraph to rewrite:\n"${text}"`,
  evaluate_engagement: (text, category) =>
    `You are an expert semantic evaluator for a blogging platform. Determine how relevant the following text is to the category: "${category}".
Scoring rules:
- 0-20: Text has absolutely no semantic overlap with the category, or is unformatted gibberish. (Output 0-10 if totally unrelated).
- 40-60: Text partially touches on the category but is mostly generic or off-topic.
- 80-100: Text is highly relevant to the category, insightful, and well-written.
Return ONLY a single integer between 0 and 100. Do NOT return any other text or punctuation.

Article Text:
"${text}"`,
  generate_tips: (text, category) =>
    `You are an expert editor for a blogging platform. Read the following article text (Category: ${category}). Provide exactly 1 or 2 short, highly specific, and actionable writing tips to improve the content, tone, or hook. Do NOT provide structural tips like "add headings" or "write more words". Focus purely on the craft of writing and the ideas presented. Return ONLY a valid JSON array of strings. Do NOT return any markdown formatting, preamble, or explanation.
Example output: ["Consider opening with a personal anecdote to hook the reader.", "Expand on your second point about interest rates to provide more value."]

Article Text:
"${text}"`,
  apply_tip: (text, tip) =>
    `You are an expert editor. You have been given an article and a specific piece of writing advice (a "tip"). Your task is to rewrite the article to incorporate this tip flawlessly. 
Maintain the original author's voice and as much of the original HTML formatting as possible. DO NOT add any preamble, explanation, or markdown formatting blocks (like \`\`\`html). Output ONLY the rewritten HTML.

Tip to Apply: "${tip}"

Original Article HTML:
"${text}"`,
};

export class MissingKeyError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingKeyError";
  }
}

export class InvalidKeyError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidKeyError";
  }
}

/**
 * Calls the Groq API directly and streams the response.
 * @param {string} command - One of: autocomplete, expand, shorten, rewrite_professional, rewrite_casual, rewrite_witty
 * @param {string} text - The paragraph text to process
 * @param {string} contextWindow - The surrounding context text
 * @param {(chunk: string) => void} onChunk - Callback fired for each streamed text chunk
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the stream
 * @returns {Promise<string>} - The full generated text
 */
export async function streamAIResponse(command, text, contextWindow, onChunk, signal) {
  const promptFn = PROMPTS[command];
  if (!promptFn) {
    throw new Error(`Unknown AI command: ${command}`);
  }

  // Fallback to env key if localStorage is empty (for backwards compatibility/testing)
  const apiKey = localStorage.getItem("lexis_groq_api_key") || import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new MissingKeyError("Please add your Groq API key in Settings to use the AI Copilot.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: promptFn(text, contextWindow) }],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new InvalidKeyError("Your Groq API key is invalid or expired. Please update it in Settings.");
    }
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

/**
 * Calls the Groq API to evaluate article engagement.
 * Returns an integer score (0-100).
 */
export async function getAIEngagementScore(text, category) {
  if (!text || text.length < 50) return 0;

  const promptFn = PROMPTS["evaluate_engagement"];
  const apiKey = localStorage.getItem("lexis_groq_api_key") || import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new MissingKeyError("No API key");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: promptFn(text, category) }],
      temperature: 0.1,
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error (${response.status})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "0";
  const score = parseInt(content.replace(/[^0-9]/g, ""), 10);
  
  if (isNaN(score)) return 0;
  return Math.max(0, Math.min(100, score));
}

/**
 * Calls the Groq API to generate actionable content tips.
 * Returns an array of strings.
 */
export async function getAITips(text, category) {
  if (!text || text.length < 50) return [];

  const promptFn = PROMPTS["generate_tips"];
  const apiKey = localStorage.getItem("lexis_groq_api_key") || import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) return [];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptFn(text, category) }],
        temperature: 0.4,
        max_tokens: 150,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";
    
    // Parse the JSON array
    let tips = JSON.parse(content);
    if (!Array.isArray(tips)) {
      // Fallback extraction if LLM failed strict JSON formatting
      tips = content.split('\n').filter(line => line.length > 5).map(line => line.replace(/^-\s*|^\d+\.\s*|\[|\]|"/g, '').trim());
    }
    
    return tips.slice(0, 2); // Max 2 tips
  } catch (err) {
    console.error("AI Tips extraction failed", err);
    return [];
  }
}

/**
 * Calls the Groq API to rewrite text based on a specific tip.
 * Returns the new HTML string.
 */
export async function applyTipToText(text, tip) {
  if (!text || !tip) return text;

  const promptFn = PROMPTS["apply_tip"];
  const apiKey = localStorage.getItem("lexis_groq_api_key") || import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) return text;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptFn(text, tip) }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || text;
    
    // Remove markdown code blocks if the AI accidentally added them
    content = content.replace(/^```html\n?/i, "").replace(/^```\n?/i, "").replace(/\n?```$/i, "");
    
    return content;
  } catch (err) {
    console.error("AI apply tip failed", err);
    return text;
  }
}


