/*
LLM wrapper supporting multiple modes:
 - OPENAI: uses OpenAI API (needs OPENAI_API_KEY) - cost: $0.001/req, free $5 trial
 - GEMINI: uses Google Gemini API (needs GOOGLE_API_KEY) - free: 60 req/min
 - GROQ: uses Groq API (needs GROQ_API_KEY) - very generous free tier, super fast
 - LOCAL: call a local LLM HTTP endpoint (needs LOCAL_LLM_URL)
 - MOCK: deterministic sample (no key needed)

Free tiers available for all!
*/

import OpenAI from 'openai';

function getLLMMode() {
  return (process.env.LLM_MODE || 'openai').toLowerCase();
}

function getOpenAIClient() {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

export async function callLLM(prompt: string) {
  const system = `You are to output ONLY valid JSON: an array of tasks. Each task must be an object with keys: id (string), description (string), priority (string), dependencies (array of ids). Return only JSON, nothing else.`;
  const mode = getLLMMode();

  if (mode === 'mock') {
    // deterministic sample useful for local hosting / tests
    const sample = [
      { id: 'task-1', description: 'Initialize repo', priority: 'high', dependencies: [] },
      { id: 'task-2', description: 'Implement API', priority: 'medium', dependencies: ['task-1'] },
      { id: 'task-3', description: 'Write tests', priority: 'low', dependencies: ['task-2'] }
    ];
    return JSON.stringify(sample);
  }

  if (mode === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set for gemini mode');

    try {
      // require at runtime so TypeScript doesn't fail if package not installed yet
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const ai = new GoogleGenerativeAI(apiKey);

      // Try a list of likely model names (some keys support different names)
      const candidates = [
        process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-1.5-mini',
        'gemini-1.5-flash',
        'gemini-pro'
      ];

      const combined = `${system}\n\n${prompt}`;
      let lastErr: any = null;

      for (const modelName of candidates) {
        try {
          const model = ai.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(combined, {
            temperature: 0.2,
            maxOutputTokens: 1500
          } as any);
          const text = typeof result?.response?.text === 'function'
            ? result.response.text()
            : (result?.response?.text || result?.response || '');
          // If we got a non-empty response, return it
          if (text) return String(text);
        } catch (err: any) {
          lastErr = err;
          const msg = String(err?.message || err);
          // If model not found, try next candidate
          if (/not found|404|is not found|model not found/i.test(msg)) {
            // continue to next candidate
            continue;
          }
          // For other errors, rethrow to surface useful diagnostics
          throw err;
        }
      }

      // If we tried all candidates and failed, throw the last error with hint
      const msg = lastErr?.message || String(lastErr || 'unknown error');
      throw new Error(`Gemini (@google/generative-ai) request failed after trying models ${candidates.join(', ')}: ${msg}`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      // Provide helpful hints for common Gemini 404 / model-name issues
      let hint = '';
      if (/not found|404/i.test(msg)) {
        hint = ' Check model name (use gemini-1.5-mini or gemini-1.5-flash) and ensure key is from aistudio.google.com.';
      }
      throw new Error(`Gemini (@google/generative-ai) request failed: ${msg}${hint}`);
    }
  }

  if (mode === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set for groq mode');
    
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const body = JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body
    });
    
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Groq API failed: ${res.status} ${txt}`);
    }
    
    const data = await res.json() as any;
    const text = data?.choices?.[0]?.message?.content || '';
    return text;
  }

  if (mode === 'local') {
    const url = process.env.LOCAL_LLM_URL;
    if (!url) throw new Error('LOCAL_LLM_URL not set for local LLM mode');
    const method = (process.env.LOCAL_LLM_METHOD || 'POST').toUpperCase();
    const body = JSON.stringify({ prompt, system });
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Local LLM request failed: ${res.status} ${txt}`);
    }
    const text = await res.text();
    return text;
  }

  // Default: OPENAI
  const openaiClient = getOpenAIClient();
  if (!openaiClient) throw new Error('OpenAI client not configured (set OPENAI_API_KEY or change LLM_MODE)');

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const res = await openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1500
    });
    const text = res?.choices?.[0]?.message?.content || '';
    if (!text) throw new Error('OpenAI returned empty completion');
    return text;
  } catch (err: any) {
    // surface more helpful message
    const msg = err?.message || String(err);
    throw new Error(`OpenAI request failed: ${msg}`);
  }
}
