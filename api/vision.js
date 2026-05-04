/* ═══════════════════════════════════════════════════════════
   RECIPIA — Vision Endpoint
   Uses Gemini API for image analysis only.
   Round Robin + Fallback across 3 API keys.
═══════════════════════════════════════════════════════════ */

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${key}`;

let currentKeyIndex = 0;

/**
 * Calls Gemini Vision API with a specific key.
 * @param {Array} images - array of {mediaType, data}
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
async function callGemini(images, apiKey) {
  // Build Gemini-format image parts
  const imageParts = images.map(({ mediaType, data }) => ({
    inline_data: { mime_type: mediaType, data },
  }));

  const response = await fetch(GEMINI_URL(apiKey), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          ...imageParts,
          {
            text: 'Look at these images carefully and list every food ingredient you can identify. Return ONLY a valid JSON object: {"ingredients":["ingredient1","ingredient2",...]}. Be specific (e.g. "cherry tomatoes" not just "tomatoes"). No extra text.',
          },
        ],
      }],
      generationConfig: {
        temperature:     0.1,
        maxOutputTokens: 500,
      },
    }),
  });

  const data = await response.json();

  // Check for rate limit
  if (response.status === 429 || data.error?.code === 429) {
    throw new Error('rate_limit');
  }

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { images } = req.body;
  if (!images || !images.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  if (GEMINI_KEYS.length === 0) {
    return res.status(500).json({ error: 'No Gemini API keys configured' });
  }

  const startIndex = currentKeyIndex;

  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const keyIndex = (startIndex + attempt) % GEMINI_KEYS.length;
    const apiKey   = GEMINI_KEYS[keyIndex];

    try {
      const data = await callGemini(images, apiKey);
      currentKeyIndex = (keyIndex + 1) % GEMINI_KEYS.length;

      // Extract text from Gemini response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.status(200).json({ text });

    } catch (err) {
      if (err.message === 'rate_limit') {
        console.log(`Gemini key ${keyIndex + 1} rate limited, trying next...`);
        continue;
      }
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(429).json({
    error: 'All Gemini API keys are currently rate limited. Please try again in a minute.',
  });
}
