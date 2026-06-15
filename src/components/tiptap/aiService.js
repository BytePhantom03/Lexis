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
  evaluate_article: (text, category) =>
    `You are an expert editor. Evaluate the following article for the category: "${category}".
1. Rate its relevance to the category from 0 to 100. (0-20 = totally unrelated, 40-60 = partially related, 80-100 = highly relevant).
2. Provide 1 or 2 specific, actionable writing tips (no structural tips like 'write more').

Return ONLY valid JSON matching this structure exactly, with no markdown or preamble:
{
  "relevanceScore": 85,
  "tips": ["Tip 1", "Tip 2"]
}

Article Text:
"${text}"`,
  apply_tip: (text, tip) =>
    `You are an expert editor. You have been given an article and a specific piece of writing advice (a "tip"). Your task is to rewrite the article to incorporate this tip flawlessly. 
Maintain the original author's voice and structure. You MUST output your response as valid, beautifully structured HTML. 
Crucially: Wrap all paragraphs in <p> tags. Use <ul> and <li> tags for bullet points. Use <h1>, <h2>, and <strong> for headings and emphasis. DO NOT output raw plain text or Markdown. DO NOT add any preamble, explanation, or markdown code blocks (like \`\`\`html). Output ONLY the rewritten HTML.

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
/**
 * Calls the Groq API to evaluate article engagement.
 * Returns an object: { aiScore: number, aiTips: string[] }
 */
export async function evaluateArticleAI(text, category) {
  if (!text || text.length < 50) return { aiScore: 100, aiTips: [] };

  const promptFn = PROMPTS["evaluate_article"];
  const apiKey = localStorage.getItem("lexis_groq_api_key") || import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return { 
      aiScore: 0, 
      aiTips: ["⚠️ AI features are offline. Please add your Groq API Key in the Settings panel or configure your deployment environment variables."] 
    };
  }

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
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "{}";
    
    let result = { relevanceScore: 100, tips: [] };
    try {
      result = JSON.parse(content);
    } catch (parseErr) {
      console.warn("Failed to parse JSON strictly", parseErr);
    }
    
    const aiScore = typeof result.relevanceScore === "number" ? Math.max(0, Math.min(100, result.relevanceScore)) : 100;
    const aiTips = Array.isArray(result.tips) ? result.tips.slice(0, 2) : [];
    
    return { aiScore, aiTips };
  } catch (err) {
    console.error("AI Evaluation failed", err);
    return { aiScore: 100, aiTips: [] };
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

  if (!apiKey) {
    throw new Error("Missing Groq API Key. Please add it in Settings.");
  }

  try {
    let retries = 2;
    while (retries >= 0) {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: promptFn(text, tip) }],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim() || text;
        
        // Remove markdown code blocks if the AI accidentally added them
        content = content.replace(/^```html\n?/i, "").replace(/^```\n?/i, "").replace(/\n?```$/i, "");
        
        return content;
      }

      const errText = await response.text();
      if (response.status === 429 && retries > 0) {
        console.warn("Rate limited on applyTip. Retrying...", errText);
        await new Promise(r => setTimeout(r, 1500));
        retries--;
      } else {
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }
    }
  } catch (err) {
    console.error("AI apply tip failed", err);
    throw err; // Let the UI handle and show the toast
  }
}


