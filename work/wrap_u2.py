import os, re
project = r"C:\Users\hlj2498\Documents\Codex\2026-06-26\figma-plugin-figma-openai-curated-remote"
path = os.path.join(project, "components/mindmap/mindmap-page.tsx")
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
bs = chr(92)
count = 0
while True:
    m = re.search(r'>' + bs + r'u[0-9a-fA-F]{4}', content)
    if not m:
        break
    start = m.start()
    full_start = start + 1
    after = content[m.end():]
    next_lt = after.find('<')
    if next_lt < 0:
        break
    full_text = content[full_start:m.end()+next_lt]
    content = content[:start] + ">{'" + full_text + "'}<" + content[m.end()+next_lt+1:]
    count += 1
if count:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed {count}")
else:
    print("None found")
