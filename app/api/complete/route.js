export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const MAX_PROMPT = 20000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map(); // ip -> timestamps（單一實例的簡易限流）

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: '伺服器尚未設定 ANTHROPIC_API_KEY' }, 503);

  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  if (limited(ip)) return json({ error: '請求太頻繁，請稍後再試' }, 429);

  let prompt;
  try {
    ({ prompt } = await req.json());
  } catch {
    return json({ error: '格式錯誤' }, 400);
  }
  if (typeof prompt !== 'string' || !prompt.trim()) return json({ error: '缺少 prompt' }, 400);
  if (prompt.length > MAX_PROMPT) return json({ error: 'prompt 過長' }, 413);

  const upstream = await fetch((process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return json({ error: data?.error?.message || `上游錯誤 ${upstream.status}` }, 502);
  }
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  return json({ text });
}
