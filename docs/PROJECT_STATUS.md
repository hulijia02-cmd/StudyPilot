 # StudyPilot - Project Status
 
 ## Overview
 - **Project**: StudyPilot - AI Learning OS (AI-native learning operating system)
 - **Stack**: Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS
 - **Auth/DB**: Supabase (schema exists, not integrated in UI)
 - **AI**: DeepSeek API (local proxy at 127.0.0.1:15721), also supports OpenAI / Qwen / mock
 - **Package Manager**: pnpm 11.7
 - **Deploy**: Vercel-ready (vercel.json configured, not deployed)
 
 ## Routes
 | Route | Type | Description |
 |-------|------|-------------|
 | `/` | page | Main mobile app (StudyPilotMobileApp) |
 | `/mindmap` | page | Standalone mindmap viewer |
 | `/dashboard` | page | Dashboard (placeholder) |
 | `/onboarding/diagnosis` | page | Learning diagnosis flow |
 | `/onboarding/goal` | page | Goal setting |
 | `/api/health` | API | Health check |
 | `/api/chat` | API | AI teacher chat |
 | `/api/generate-plan` | API | Generate learning plan |
 | `/api/mindmap` | API | Generate mindmap |
 | `/api/practice` | API | Generate practice questions |
 | `/api/review` | API | Generate review content |
 | `/api/ai/knowledge` | API | Knowledge explanation |
 | `/api/ai/diagnose` | API | Diagnose learning goal |
 | `/api/ai/planner` | API | Deep planner (agent) |
 | `/api/ai/mindmap` | API | Deep mindmap (agent) |
 | `/api/ai/practice` | API | Deep practice (agent) |
 | `/api/ai/practice/score` | API | Score practice answers |
 
 ## Architecture
 
 ### AI Layer
 - `lib/aiClient.ts` — Unified AI client with OpenAI-compatible API (supports DeepSeek/OpenAI/Qwen) + mock fallback
 - `lib/ai/orchestrator.ts` — Routes 12 task types to agent names
 - `lib/ai/agents/` — 4 agent implementations (knowledge/planner/mindmap/practice) with deterministic fallbacks
 - `lib/ai/prompts/` — System prompts for each agent
 - `lib/ai/schemas/` — Zod validation for agent input/output
 
 ### State Management
 - React useState with debounced (800ms) localStorage persistence via `lib/storage.ts`
 - State restored on mount via `useEffect`
 - Persisted: goal, activeTab, program, messages, practiceQuestions, selectedNode, etc.
 
 ### UI Architecture
 - Mobile-app style (max-w-[430px] container, phone frame)
 - 5 bottom tabs: Home / Plan / Knowledge Tree / AI Teacher / Practice
 - Separate profile page (Tab 5)
 - Desktop version (`components/home/`) exists but NOT used (root page routes to mobile app)
 
 ### Data Flow
 1. User enters goal → `POST /api/generate-plan` (learning plan) + `POST /api/mindmap` (mindmap)
 2. → `parseMindmapToKnowledgeTree()` parses markdown → `KnowledgeNode[]` tree
 3. → Tree stored in React state + localStorage
 4. Node click → `POST /api/ai/knowledge` (knowledge explanation)
 5. AI Teacher → `POST /api/chat` (multi-turn, context-aware)
 6. Practice → `POST /api/practice` (generates 5 question types)
 
 ## Components
 | Component | File | Status |
 |-----------|------|--------|
 | Main App Shell | `components/mobile-app/studypilot-mobile-app.tsx` | Complete |
 | Home Page | `components/mobile-app/home-page.tsx` | Complete |
 | Plan Page | `components/mobile-app/plan-page.tsx` | Complete |
 | Knowledge Tree Page | `components/mobile-app/knowledge-tree-page.tsx` | Complete (recently recovered from encoding corruption) |
 | AI Teacher Page | `components/mobile-app/ai-teacher-page.tsx` | Complete |
 | Practice Page | `components/mobile-app/practice-page.tsx` | Complete |
 | Profile Page | `components/mobile-app/profile-page.tsx` | Basic |
 | Bottom Tab Bar | `components/mobile-app/bottom-tab-bar.tsx` | Complete |
 | Mindmap (standalone) | `components/mindmap/mindmap-page.tsx` | Complete (with document/mindmap modes) |
 | Desktop Shell | `components/layout/app-shell.tsx` | Exists, unused |
 | Desktop Home | `components/home/studypilot-home.tsx` | Exists, unused |
 | AI Diagnosis Flow | `components/ai/diagnosis-flow.tsx` | Exists |
 | Button UI | `components/ui/button.tsx` | Minimal |
 
 ## Build Status (2026-07-01)
- Build: ✅ Successful (all 20 pages generated)
- TypeScript: ✅ No errors
- ESLint: 1 warning (unused _goal in mindmap-page.tsx)
- Dev server: http://localhost:3000 (also accessible on LAN at http://192.168.43.6:3000)
- Knowledge-tree-page.tsx: ✅ Recovered from encoding corruption (41 U+FFFD remaining in display text)

## Last Session Changes
- Fixed knowledge-tree-page.tsx encoding corruption (CP936 round-trip via .NET)
- Fixed typeLabel values restored from webpack bundle cache
- Fixed class -> className in <a> tags
- Fixed unterminated strings (重要度, 易错点, 已掌握, etc.)
- Fixed TypeScript type errors in storage.ts (generic constraints)
- Fixed ESLint errors (<a> -> <Link>, ny[] -> typed array)
- Created docs/PROJECT_STATUS.md

## Current Issues
 1. `knowledge-tree-page.tsx` has remaining ~41 U+FFFD (replacement chars) from CP936 encoding corruption — these affect display text only, no syntax errors. Fix by doing .NET round-trip: `[System.Text.Encoding]::GetEncoding(936).GetBytes([System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($file)))`
 2. `mindmap-page.tsx` has unused `_goal` param in ExplanationPanel (minor ESLint warning)
 3. No real Supabase integration (schema exists, clients configured)
 4. No user authentication
 5. Not deployed to Vercel yet
 6. AI key is in .env.local (not shared with deployment)
 
 ## Priority Next Steps
 1. Fix remaining U+FFFD corruption in knowledge-tree-page.tsx
 2. Set up guest/anonymous login
 3. Integrate Supabase for persistent learning progress
 4. Wire up onboarding flow (diagnosis → goal → program)
 5. Deploy to Vercel (need real API key)
 6. Add user authentication (Supabase Auth)
 7. Progress tracking with backend persistence
