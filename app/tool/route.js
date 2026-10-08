import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 教案工具 HTML 原檔不動；只在回應時於 <head> 後注入 window.claude.complete 橋接，
// 讓「AI 起草」在 Claude artifact 以外的環境也能呼叫 /api/complete。
const SHIM = `<script>
window.claude = window.claude || {
  complete: async function (prompt) {
    var res = await fetch('/api/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: String(prompt) })
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
    return data.text;
  }
};
</script>`;

export async function GET() {
  const file = path.join(process.cwd(), 'lesson-designer-standalone.html');
  const html = await readFile(file, 'utf8');
  const m = html.match(/<head[^>]*>/i);
  const i = m ? m.index + m[0].length : 0;
  // slice 而非 replace，避免 $ 樣式被當成替換語法
  const body = html.slice(0, i) + SHIM + html.slice(i);
  return new Response(body, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
