import os, re
p = r"C:\Users\hlj2498\Documents\Codex\2026-06-26\figma-plugin-figma-openai-curated-remote\components\mindmap\mindmap-page.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()
bs = chr(92)
# Match >\uXXXX< where \u is literal backslash-u
pat = ">" + bs + bs + "u[0-9a-fA-F]{4}(?:" + bs + bs + "u[0-9a-fA-F]{4})*<"
def wrap(m):
    t = m.group()[1:-1]
    return ">{'" + t + "'}<"
c2, n = re.subn(pat, wrap, c)
if n > 0:
    with open(p, "w", encoding="utf-8") as f:
        f.write(c2)
    print(f"Fixed {n} u-sequences")
else:
    print("No u-sequences found")
# Also fix the same pattern in generatePracticeForTopic (inside JS strings, NOT literal JSX)
# Those are already inside "" so JS evaluates them correctly
print("Script done")
