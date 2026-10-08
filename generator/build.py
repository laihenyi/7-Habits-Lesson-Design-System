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
assert '</script' not in dg
out = t.replace('__HABITS__', hj).replace('__DG__', dg)
open(os.path.join(here, '..', 'lesson-generator.html'), 'w', encoding='utf8').write(out)
print(len(out))
