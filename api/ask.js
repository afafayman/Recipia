/* ═══════════════════════════════════════════════════════════
   RECIPIA — Vercel Serverless Function
   Endpoint: /api/ask
   Uses 3 Groq API keys with Round Robin + Fallback strategy.
   Supports both text prompts and image analysis.
═══════════════════════════════════════════════════════════ */

const API_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean);

let currentKeyIndex = 0;

function getNextKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

async function callGroq(userContent, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens:  8000,
      messages: [
        {
          role:    'system',
          content: `You are a recipe assistant for Recipia. Your ONLY job is to suggest recipes based on food ingredients.
CRITICAL RULE: If the user input is NOT a list of food ingredients (e.g. jokes, poems, greetings, questions, random text, code, math), you MUST respond with ONLY this exact JSON and nothing else:
{"error":"not_food"}
Do NOT generate recipes for non-food input under ANY circumstances, in ANY language.`,
        },
        {
          role:    'user',
          content: userContent,
        },
      ],
    }),
  });

  const data = await response.json();

  if (data.error?.type === 'rate_limit_exceeded' || response.status === 429) {
    throw new Error('rate_limit');
  }

  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  // prompt can be a string or a JSON array (for image analysis)
  let userContent;
  try {
    userContent = JSON.parse(prompt);
  } catch {
    userContent = prompt;
  }

  if (API_KEYS.length === 0) {
    return res.status(500).json({ error: 'No API keys configured' });
  }

  const startIndex = currentKeyIndex;

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const keyIndex = (startIndex + attempt) % API_KEYS.length;
    const apiKey   = API_KEYS[keyIndex];

    try {
      const data = await callGroq(userContent, apiKey);
      currentKeyIndex = (keyIndex + 1) % API_KEYS.length;
      return res.status(200).json(data);
    } catch (err) {
      if (err.message === 'rate_limit') {
        console.log(`Key ${keyIndex + 1} rate limited, trying next...`);
        continue;
      }
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(429).json({
    error: 'All API keys are currently rate limited. Please try again in a minute.'
  });
}
