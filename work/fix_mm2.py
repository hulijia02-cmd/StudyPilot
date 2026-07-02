# -*- coding: utf-8 -*-
import os
project = r"C:\Users\hlj2498\Documents\Codex\2026-06-26\figma-plugin-figma-openai-curated-remote"
path = os.path.join(project, "components/mindmap/mindmap-page.tsx")

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# === Fix 1: Replace generatePracticeForTopic ===
old_start = "function generatePracticeForTopic(topic, definition)"
if old_start not in content:
    old_start = "function generatePracticeForTopic(topic: string, definition: string)"
idx_start = content.find(old_start)
idx_end = content.find("function countAll", idx_start)

if idx_start >= 0 and idx_end >= 0:
    # TypeScript u escapes that JavaScript evaluates at runtime
    Q = chr(34)  # double quote
    def ts(s): return Q + s + Q  # TypeScript string literal
    
    new_func = """function generatePracticeForTopic(topic: string, definition: string): Array<{
  id: string; type: string; typeLabel: string; question: string; answer: string; explanation: string; showAnswer: boolean;
}> {
  const Q = """ + Q + Q + Q + """;
  return [
    { id: "q1", type: "single_choice", typeLabel: """ + ts("\u5355\u9009") + """, question: """ + ts("\u5173\u4e8e\u300c") + """ + topic + """ + ts("\u300d\uff0c\u4ee5\u4e0b\u54ea\u4e2a\u63cf\u8ff0\u662f\u6b63\u786e\u7684\uff1f") + """, answer: """ + ts("\u300c") + """ + topic + """ + ts("\u300d\u662f\u5b66\u4e60\u8fc7\u7a0b\u4e2d\u7684\u91cd\u8981\u6982\u5ff5\uff0c\u9700\u8981\u7406\u89e3\u5176\u6838\u5fc3\u5b9a\u4e49\u548c\u5e94\u7528\u573a\u666f\u3002") + """, explanation: """ + ts("\u8fd9\u4e2a\u95ee\u9898\u8003\u5bdf\u5bf9\u300c") + """ + topic + """ + ts("\u300d\u57fa\u672c\u5b9a\u4e49\u7684\u7406\u89e3\uff0c\u5e94\u56f4\u7ed5\u5176\u6838\u5fc3\u7279\u5f81\u56de\u7b54\u3002") + """, showAnswer: false },
    { id: "q2", type: "true_false", typeLabel: """ + ts("\u5224\u65ad") + """, question: """ + ts("\u300c") + """ + topic + """ + ts("\u300d\u53ea\u9700\u8981\u80cc\u4e0b\u5b9a\u4e49\u5c31\u7b49\u4e8e\u638c\u63e1\u4e86\u3002\u5bf9\u8fd8\u662f\u9519\uff1f") + """, answer: """ + ts("\u9519\u8bef") + """, explanation: """ + ts("\u5149\u80cc\u5b9a\u4e49\u4e0d\u591f\uff0c\u8fd8\u9700\u8981\u901a\u8fc7\u7ec3\u4e60\u3001\u4e3e\u4f8b\u548c\u5e94\u7528\u6765\u9a8c\u8bc1\u662f\u5426\u771f\u6b63\u638c\u63e1\u3002") + """, showAnswer: false },
    { id: "q3", type: "short_answer", typeLabel: """ + ts("\u7b80\u7b54") + """, question: """ + ts("\u8bf7\u7528\u4e00\u53e5\u8bdd\u89e3\u91ca\u300c") + """ + topic + """ + ts("\u300d\u662f\u4ec0\u4e48\uff0c\u5e76\u4e3e\u4e00\u4e2a\u751f\u6d3b\u4e2d\u7684\u4f8b\u5b50\u3002") + """, answer: """ + ts("\u300c") + """ + topic + """ + ts("\u300d\u662f\u6307") + """ + (definition || "") + """ + ts("\u3002\u4f8b\u5982\uff0c\u5728\u5b9e\u9645\u5b66\u4e60\u4e2d\u53ef\u4ee5\u901a\u8fc7\u7ec3\u4e60\u6765\u52a0\u6df1\u7406\u89e3\u3002") + """, explanation: """ + ts("\u56de\u7b54\u65f6\u5e94\u5305\u542b\u5b9a\u4e49\u548c\u5177\u4f53\u4f8b\u5b50\u4e24\u4e2a\u8981\u7d20\u3002") + """, showAnswer: false },
    { id: "q4", type: "choice", typeLabel: """ + ts("\u591a\u9009") + """, question: """ + ts("\u5b66\u4e60\u300c") + """ + topic + """ + ts("\u300d\u65f6\uff0c\u4ee5\u4e0b\u54ea\u4e9b\u65b9\u6cd5\u662f\u6709\u6548\u7684\uff1f") + """, answer: """ + ts("\u7406\u89e3\u5b9a\u4e49\u3001\u5b8c\u6210\u7ec3\u4e60\u3001\u4e3e\u4f8b\u5b50\u3001\u6559\u7ed9\u522b\u4eba") + """, explanation: """ + ts("\u4e3b\u52a8\u5b66\u4e60\u65b9\u6cd5\u5305\u62ec\u7406\u89e3\u3001\u5e94\u7528\u3001\u8f93\u51fa\u548c\u53cd\u9988\uff0c\u5355\u7eaf\u9605\u8bfb\u4e0d\u7b97\u3002") + """, showAnswer: false },
    { id: "q5", type: "project", typeLabel: """ + ts("\u5b9e\u64cd") + """, question: """ + ts("\u8bf7\u8bbe\u8ba1\u4e00\u4e2a 5 \u5206\u949f\u7684\u5c0f\u7ec3\u4e60\uff0c\u5e2e\u52a9\u521d\u5b66\u8005\u638c\u63e1\u300c") + """ + topic + """ + ts("\u300d\u3002") + """, answer: """ + ts("\u63a8\u8350\u7ec3\u4e60\uff1a1.\u7528\u81ea\u5df1\u7684\u8bdd\u89e3\u91ca\u300c") + """ + topic + """ + ts("\u300d 2.\u627e\u4e00\u4e2a\u751f\u6d3b\u4e2d\u7684\u5e94\u7528\u573a\u666f 3.\u5b8c\u6210\u4e00\u9053\u76f8\u5173\u7ec3\u4e60\u9898") + """, explanation: """ + ts("\u5b9e\u64cd\u7ec3\u4e60\u80fd\u5e2e\u52a9\u5c06\u77e5\u8bc6\u70b9\u8f6c\u5316\u4e3a\u5b9e\u9645\u80fd\u529b\u3002") + """, showAnswer: false },
  ];
}"""
    content = content[:idx_start] + new_func + content[idx_end:]
    print("Fixed 1: generatePracticeForTopic")

# === Fix 2: Add knowledge state and fetch API ===
if "const [knowledgeExp, setKnowledgeExp]" not in content:
    old = "const [canvasSize, setCanvasSize] = useState({ w: 2000, h: 2000 });"
    new = old + "\n  const [knowledgeExp, setKnowledgeExp] = useState(null);\n  const [expLoading, setExpLoading] = useState(false);\n  const loadExplanation = useCallback(async (node) => {\n    setExpLoading(true);\n    try {\n      const res = await fetch(\"/api/ai/knowledge\", {\n        method: \"POST\", headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ goal, topic: node.title }),\n      });\n      if (!res.ok) throw new Error(\"API error\");\n      const json = await res.json();\n      setKnowledgeExp(json.data || null);\n    } catch { setKnowledgeExp(null); }\n    finally { setExpLoading(false); }\n  }, [goal]);"
    content = content.replace(old, new)
    print("Fixed 2: Added knowledgeExp state + loadExplanation")

# === Fix 3: Update selectNode to call loadExplanation ===
old_sel = "const selectNode = useCallback((node: KnowledgeNode) => {\n    setSelectedNode(node);\n  }, []);"
if old_sel in content:
    new_sel = "const selectNode = useCallback((node: KnowledgeNode) => {\n    setSelectedNode(node);\n    if (goal) loadExplanation(node);\n  }, [goal, loadExplanation]);"
    content = content.replace(old_sel, new_sel)
    print("Fixed 3: selectNode calls loadExplanation")
elif "loadExplanation(node)" not in content:
    print("WARN: Could not fix selectNode - pattern not found")

# === Fix 4: Update ExplanationPanel to receive new props ===
old_panel = "<ExplanationPanel\n                node={selectedNode}\n                onClose={closeExplanation}\n              />"
new_panel = "<ExplanationPanel\n                node={selectedNode}\n                explanation={knowledgeExp}\n                isLoading={expLoading}\n                goal={goal}\n                onClose={closeExplanation}\n              />"
if old_panel in content:
    content = content.replace(old_panel, new_panel)
    print("Fixed 4: ExplanationPanel gets new props")
elif "explanation={knowledgeExp}" not in content:
    print("WARN: Could not fix ExplanationPanel props - pattern not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("\nDone!")
