import os, re
project = r"C:\Users\hlj2498\Documents\Codex\2026-06-26\figma-plugin-figma-openai-curated-remote"
path = os.path.join(project, "components/mindmap/mindmap-page.tsx")
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

bs = chr(92)
count = 0

# Fix 1: Replace "\\ uXXXX" (broken backslash-space-u pattern) with wrapped u-sequences
# Pattern: \ uXXXX\ uXXXX... in JSX text
def fix_escaped_bs_u(m):
    txt = m.group(0)
    # Remove the spaces after backslashes: \ uXXXX -> \uXXXX
    fixed = txt.replace(bs + " u", bs + "u")
    return "{'" + fixed + "'}"

content = re.sub(r'>((?:' + bs + r' u[0-9a-fA-F]{4})+)[^<]*<', fix_escaped_bs_u, content)
count += 1

# Fix 2: Replace broken "\\ u" patterns (outside JSX text context)
content = content.replace(bs + " u", bs + "u")

# Fix 3: Fix specific known corrupted text patterns
fixes = {
    # Mode toggle buttons
    chr(92) + " u6587" + chr(92) + " u6863": chr(92) + "u6587" + chr(92) + "u6863",
    chr(92) + " u5bfc" + chr(92) + " u56fe": chr(92) + "u5bfc" + chr(92) + "u56fe", 
    chr(92) + " u8282" + chr(92) + " u70b9": chr(92) + "u8282" + chr(92) + "u70b9",
}

# Actually, all \\ u patterns will be in either JSX text or inside expressions
# For patterns inside JSX text like ">\\ uXXXX<", they need to be wrapped in {}
# Let me do another pass
content2, n1 = re.subn(r'>((?:' + bs + r' u[0-9a-fA-F]{4})+)[^<]*<', 
    lambda m: ">{'" + m.group(1).replace(" ", "") + "'}<", content)
if n1:
    content = content2
    count += n1

# Fix 4: Fix the mode toggle button - change 导图 to 完整导图
# First find "导图" in button context and change to "完整导图"
# But we need to handle both the corrupted and fixed versions
for pattern in [chr(92) + "u5bfc" + chr(92) + "u56fe", "导图"]:
    if pattern in content:
        # Only replace inside mode toggle button (not in MindmapNode)
        content = content.replace(
            "\u5bfc\u56fe",
            "\u5b8c\u6574\u5bfc\u56fe"
        )
        print(f"Fixed: 导图 -> 完整导图")
        break

# Fix 5: Actually use literal approach - replace the u sequences with wrapped versions
content3, n2 = re.subn(
    r'>((?:' + bs + r' u[0-9a-fA-F]{4})+)<',
    lambda m: ">{'" + m.group(1).replace(" ", "") + "'}<",
    content
)
if n2:
    content = content3
    count += n2

if count:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Applied {count} fixes")
else:
    print("No changes needed")
print("Fix all text done")
