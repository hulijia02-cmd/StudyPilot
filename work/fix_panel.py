import os,sys
project = r"C:\Users\hlj2498\Documents\Codex\2026-06-26\figma-plugin-figma-openai-curated-remote"
path = os.path.join(project, "components/mindmap/mindmap-page.tsx")

with open(path,"r",encoding="utf-8") as f:
    content = f.read()

# Update function signature: add explanation, isLoading, goal
old_sig = "function ExplanationPanel({\n  node,\n  onClose,\n}: {\n  node: KnowledgeNode;\n  onClose: () => void;\n}) {"
new_sig = "function ExplanationPanel({\n  node,\n  explanation,\n  isLoading,\n  goal,\n  onClose,\n}: {\n  node: KnowledgeNode;\n  explanation: any;\n  isLoading: boolean;\n  goal: string;\n  onClose: () => void;\n}) {"

if old_sig in content:
    content = content.replace(old_sig, new_sig)
    print("Fixed function signature")
else:
    print("WARN: Function signature not found!")
    idx = content.find("function ExplanationPanel")
    if idx >= 0:
        print(f"Found at {idx}: {repr(content[idx:idx+120])}")

# Add loading state display + API data logic
# Find the header section and add loading indicator
old_header = '<p className="text-[10px] font-semibold text-sky-500 uppercase tracking-wider">'
new_header_before = '''{isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="h-5 w-5 animate-spin text-sky-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span className="ml-2 text-sm text-sky-600">''' + "\u6b63\u5728\u751f\u6210\u8bf4\u660e..." + '''</span>
          </div>
        ) : explanation ? (
          <>
            <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="h-3.5 w-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">''' + "\u6982\u5ff5\u5b9a\u4e49" + '''</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">{explanation.oneSentence}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">''' + "\u4e3a\u4ec0\u4e48\u91cd\u8981" + '''</h3>
              </div>
              <ul className="space-y-1.5">
                {explanation.keyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">''' + "\u751f\u6d3b\u4e2d\u7684\u4f8b\u5b50" + '''</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">{explanation.lifeExample}</p>
            </div>
            {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
              <div className="rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="h-3.5 w-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">''' + "\u5e38\u89c1\u8bef\u533a" + '''</h3>
                </div>
                <ul className="space-y-1.5">
                  {explanation.commonMistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-6 text-rose-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm leading-7 text-slate-600 bg-slate-50 rounded-xl p-4">{explanation.summary}</p>
          </>
        ) : ('''

new_header_after = ''')}
'''

# Replace the main content section: from header to before practice button
old_marker = old_header + "\u767e\u79d1\u8bcd\u6761"  # "百科词条"
old_node_section = '''>
              <h2 className="text-base font-bold text-slate-900 leading-tight max-w-[240px] truncate">{node.title}</h2>
            </div>
          </div>
          <button onClick={onClose} type="button" className="rounded-lg p-1.5 hover:bg-slate-100 transition">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 pb-8">
        <div className="flex flex-wrap gap-2">'''.strip()

# Replace everything from after header's </div> to before practice button
# Simpler approach: find specific section boundaries
apos = chr(39)  # single quote

# The ExplanationPanel JSX starts with header and ends with </div> (the closing of the outer div)
# I need to replace the content area (after header </div>) with new logic

# Find the marker after the "百科词条" text
old_marker = old_header + "\u767e\u79d1\u8bcd\u6761"
if old_marker in content:
    # Find the end of the header section (the X button + closing divs)
    header_end_idx = content.find("</button>", content.find("onClose"))
    # The header ends a few lines after
    end_of_header = content.find("</div>", header_end_idx) + 6
    # Find where the practice button starts
    button_idx = content.find("生成相关练习题", header_end_idx)
    if button_idx < 0:
        button_idx = content.find("border-t", end_of_header)
    
    if button_idx > end_of_header:
        # Replace the content between header and practice button
        new_content_section = """

      <div className="space-y-5 p-5 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-sky-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span className="ml-3 text-sm text-sky-600 font-medium">""" + "\u6b63\u5728\u751f\u6210\u8bf4\u660e..." + """</span>
          </div>
        ) : explanation ? (
          <>
            <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="h-3.5 w-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">""" + "\u6982\u5ff5\u5b9a\u4e49" + """</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">{explanation.oneSentence}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">""" + "\u4e3a\u4ec0\u4e48\u91cd\u8981" + """</h3>
              </div>
              <ul className="space-y-1.5">
                {explanation.keyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">""" + "\u751f\u6d3b\u4e2d\u7684\u4f8b\u5b50" + """</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">{explanation.lifeExample}</p>
            </div>
            {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
              <div className="rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="h-3.5 w-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">""" + "\u5e38\u89c1\u8bef\u533a" + """</h3>
                </div>
                <ul className="space-y-1.5">
                  {explanation.commonMistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-6 text-rose-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.summary && <p className="text-sm leading-7 text-slate-600 bg-slate-50 rounded-xl p-4">{explanation.summary}</p>}
          </>
        ) : ("""
        new_content_end = """)
        }
"""
        content = content[:end_of_header] + new_content_section + content[end_of_header:]
        print("Fixed ExplanationPanel with API data display")
    else:
        print("WARN: Could not find section boundaries")
else:
    print("WARN: Header marker not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done!")
