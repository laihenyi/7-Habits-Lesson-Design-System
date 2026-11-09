#!/usr/bin/env python3
"""把習慣範例資料與領導力工具圖（diagrams.js）內嵌進 template.html，輸出 ../lesson-generator.html。
習慣範例來自 ../lesson-designer-standalone.html（解開 bundle 內的 window.HABITS）。"""
import re, json, base64, gzip, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, '..', 'lesson-designer-standalone.html'), encoding='utf8').read()
man = json.loads(re.search(r'<script type="__bundler/manifest">\s*(.*?)\s*</script>', src, re.S).group(1))
habits = None
for v in man.values():
    d = base64.b64decode(v['data'])
    if v.get('compressed'): d = gzip.decompress(d)
    d = d.decode('utf8', 'ignore')
    m = re.match(r'\s*window\.HABITS\s*=\s*(.*?);?\s*$', d, re.S)
    if m: habits = json.loads(m.group(1)); break
assert habits and len(habits) == 8
hj = json.dumps(habits, ensure_ascii=False).replace('</', '<\\/')
t = open(os.path.join(here, 'template.html'), encoding='utf8').read()
dg = open(os.path.join(here, 'diagrams.js'), encoding='utf8').read()
ws = open(os.path.join(here, 'worksheet.js'), encoding='utf8').read()
assert '</script' not in dg and '</script' not in ws
import re as _re
wscss = _re.search(r"var CSS = \[\n(.*?)\n  \]\.join", ws, _re.S).group(1)
wscss = '\n'.join(l.strip().strip(',').strip("'") for l in wscss.split('\n'))
out = t.replace('__HABITS__', hj).replace('__DG__', dg).replace('__WS__', ws).replace('__WSCSS__', wscss)
open(os.path.join(here, '..', 'lesson-generator.html'), 'w', encoding='utf8').write(out)

# 完整文件版：給 claude.ai 聊天 artifact（上傳後請 Claude 原封不動建立）或一般靜態網站用。
# 內容與上面相同，只是補上 doctype、head 與基本重設（Claude Code 的 Artifact 工具會自動補，聊天 artifact 不會）。
cut = out.index('<div class="wrap">')
head_part, body_part = out[:cut], out[cut:]
full = ('<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<style>[hidden]{display:none!important}img{max-width:100%}</style>\n'
        + head_part + '</head>\n<body>\n' + body_part + '\n</body>\n</html>\n')
open(os.path.join(here, '..', 'lesson-generator-chat.html'), 'w', encoding='utf8').write(full)
print(len(out))
