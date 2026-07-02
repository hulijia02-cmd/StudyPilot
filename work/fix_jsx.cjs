const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");

const pmtIdx = txt.indexOf("function parseMindmapToKnowledgeTree");
if (pmtIdx < 0) { console.log("PMT not found"); process.exit(1); }

const returnJsx = [
  '  return (',
  '    <main className="flex min-h-screen items-center justify-center px-3 py-4 sm:px-6">',
  '      <section className="relative h-[calc(100vh-32px)] w-full max-w-[430px] overflow-hidden rounded-[38px] border border-white bg-white shadow-[0_24px_80px_rgb(15_23_42/14%)]">',
  '        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-3">',
  '          <div className="h-1.5 w-20 rounded-full bg-slate-200" />',
  '        </div>',
  '        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />',
  '        <div className="relative flex h-full flex-col">',
  '          <div className="flex items-center justify-between px-5 pb-3 pt-8">',
  "            <div>",
  '              <p className="text-xs font-semibold text-slate-400">StudyPilot</p>',
  '              <p className="text-lg font-bold text-slate-950">{title}</p>',
  "            </div>",
  '            <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">',
  '              <p className="text-[10px] font-semibold text-slate-400">\u76ee\u6807</p>',
  '              <p className="max-w-32 truncate text-xs font-bold text-sky-700">{program?.goal ?? "\u672a\u8bbe\u7f6e"}</p>',
  "            </div>",
  "          </div>",
  '          <p className="px-5 pb-2 text-right text-[10px] font-semibold text-slate-400">{aiStatus}</p>',
  '          <div className="relative flex-1 overflow-y-auto px-4 pb-28">',
  "            {activeTab === \"material\" ? (<MaterialPage />) : null}",
  "            {activeTab === \"home\" ? (<HomePage aiSuggestion={program?.aiSuggestion} error={error} goal={goalInput} isLoading={isPlanning} onGoalChange={setGoalInput} onStartLearning={handleStartLearning} progress={program?.progress} recommendedTasks={program?.recommendedTasks ?? []} />) : null}",
  "            {activeTab === \"plan\" ? (<PlanPage expandedDay={expandedDay} goal={program?.goal} onDayToggle={(day) => setExpandedDay((c) => (c === day ? 0 : day))} onGoHome={() => setActiveTab(\"home\")} onStartToday={handleStartToday} plans={program?.plan ?? []} />) : null}",
  "            {activeTab === \"tree\" ? (<KnowledgeTreePage expandedModuleId={expandedModuleId} explanation={knowledgeExplanation} goal={program?.goal} isLoadingExplanation={isKnowledgeLoading} onGoHome={() => setActiveTab(\"home\")} onModuleToggle={handleModuleToggle} onNodeSelect={handleNodeSelect} selectedNode={selectedNode} tree={program?.tree ?? []} />) : null}",
  "            {activeTab === \"teacher\" ? (<AiTeacherPage draft={draft} goal={program?.goal} isLoading={isTeacherLoading} messages={messages} onDraftChange={setDraft} onGoHome={() => setActiveTab(\"home\")} onQuickAction={handleQuickAction} onSend={handleSend} />) : null}",
  "          </div>",
  "          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />",
  "        </div>",
  "      </section>",
  "    </main>",
  "  );",
  "}",
].join("\r\n");

const newTxt = txt.substring(0, pmtIdx) + returnJsx + "\r\n\r\n" + txt.substring(pmtIdx);
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", newTxt, "utf8");
console.log("Inserted return JSX. Length:", newTxt.length);
