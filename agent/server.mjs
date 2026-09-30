import http from 'node:http';

const PORT = process.env.PORT || 8787;
const MAX_MESSAGES = 20;

const providers = {
  openai: { key: 'OPENAI_API_KEY', url: 'https://api.openai.com/v1/chat/completions', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' },
  groq: { key: 'GROQ_API_KEY', url: 'https://api.groq.com/openai/v1/chat/completions', model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' },
  google: { key: 'GOOGLE_API_KEY', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: process.env.GOOGLE_MODEL || 'gemini-2.5-flash' },
  anthropic: { key: 'ANTHROPIC_API_KEY', url: 'https://api.anthropic.com/v1/messages', model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5' },
  huggingface: { key: 'HF_TOKEN', url: 'https://router.huggingface.co/v1/chat/completions', model: process.env.HF_MODEL || 'Qwen/Qwen3-32B' }
};

const system = `You are Priyanshu AI, a capable general-purpose assistant for the Priyanshu project. Be accurate, concise, and transparent about uncertainty. Never expose secrets. Never claim a tool action happened unless it actually happened.`;

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(body));
}

async function callProvider(name, messages) {
  const p = providers[name] || providers.openai;
  const key = process.env[p.key];
  if (!key) throw new Error(`Provider ${name} is not configured. Set ${p.key}.`);

  if (name === 'anthropic') {
    const r = await fetch(p.url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: p.model, max_tokens: 2048, system, messages }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || 'Anthropic request failed');
    return data.content?.map(x => x.text || '').join('') || '';
  }

  const r = await fetch(p.url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify({ model: p.model, messages: [{ role: 'system', content: system }, ...messages], temperature: 0.3 }) });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `${name} request failed`);
  return data.choices?.[0]?.message?.content || '';
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method !== 'POST' || req.url !== '/api/chat') return json(res, 404, { error: 'Not found' });
  try {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || '{}');
    const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
    if (!messages.length) return json(res, 400, { error: 'messages is required' });
    const provider = typeof body.provider === 'string' ? body.provider.toLowerCase() : 'openai';
    const answer = await callProvider(provider, messages);
    json(res, 200, { provider, answer });
  } catch (e) {
    json(res, 500, { error: e.message || 'Agent request failed' });
  }
});

server.listen(PORT, () => console.log(`Priyanshu AI listening on ${PORT}`));
