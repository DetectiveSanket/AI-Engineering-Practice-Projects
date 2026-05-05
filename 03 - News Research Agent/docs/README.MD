# 🗞️ News Research Agent

> **Project 3 — AI Engineering Practice**
> Phase 2 · Weeks 5–7

An AI agent that takes a research question, **autonomously decides** which tools to call (web search, summarizer, fact-checker), reasons step by step using the **ReAct pattern**, and produces a structured report.

**Built from scratch — no LangChain.**

---

## What makes this an "agent" (not just an LLM app)?

| LLM App | AI Agent |
|---|---|
| You decide which functions to call | The LLM decides which tools to call |
| You run one prompt → get one answer | The LLM loops: Thought → Action → Observation → repeat |
| You control every step | The agent controls its own flow until it has enough information |

---

## Architecture

```
User Input (CLI)
      │
      ▼
Context Builder (contextBuilder.js)
  → injects system prompt + tool definitions
      │
      ▼
┌─────────────────────────────────────────┐
│         ReAct Loop (agentLoop.js)       │ ◄── loops until done
│                                         │
│  Thought → Action → Observation         │
│  (LLM reasons)  (tool call)  (result)   │
└─────────────────────────────────────────┘
      │
      ▼
Action Dispatcher (toolDispatcher.js)
  → parses "Action: toolName(args)" string
      │
      ├── webSearch()     → tools/webSearch.js   (calls news API)
      ├── summarize()     → tools/summarize.js   (Gemini condenses text)
      └── checkClaim()    → tools/checkClaim.js  (verifies against search)
      │
      ▼
Memory + Scratchpad (memory.js)
  → stores observations, trims oldest when context is too long
      │
      ▼
Report Generator (reportBuilder.js)
  → structured JSON report + terminal print
```

---

## Build Order (Tasks)

| # | Task | File(s) | Status |
|---|---|---|---|
| ✅ 0 | Project scaffold | `package.json`, `.gitignore`, `.env` | Done |
| ✅ 1 | Entry point & CLI loop | `index.js` | Done |
| ✅ 2 | Gemini client abstraction | `src/geminiClient.js` | Done |
| ✅ 3 | Context builder + ReAct system prompt | `src/contextBuilder.js` | Done |
| ⬜ 4 | ReAct agent loop | `src/agentLoop.js` | Pending |
| ⬜ 5 | Tool dispatcher | `src/toolDispatcher.js` | Pending |
| ⬜ 6 | Tool: Web search | `src/tools/webSearch.js` | Pending |
| ⬜ 7 | Tool: Summarize | `src/tools/summarize.js` | Pending |
| ⬜ 8 | Tool: Check claim | `src/tools/checkClaim.js` | Pending |
| ⬜ 9 | Memory & scratchpad | `src/memory.js` | Pending |
| ⬜ 10 | Report generator | `src/reportBuilder.js` | Pending |

> **Day 1 complete ✅** — Tasks 0–3 done. Gemini now outputs ReAct-format text (Thought/Action) in response to research questions.

---

## Key Concepts Practiced

- **ReAct pattern** — Reason + Act, the foundation of all agent frameworks
- **Tool definition & call parsing** — LLM outputs `Action: webSearch(query)` → code parses and executes
- **Agent loop** — Thought → Action → Observation → repeat
- **Working memory / scratchpad** — accumulating observations across loop iterations
- **Context window management** — trimming old observations when the prompt gets too long
- **Context engineering** — crafting the system prompt to shape the LLM's output format and behaviour
- **Verbalized sampling** — using the LLM's own chain-of-thought output inside the agent loop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| LLM | Google Gemini API (`@google/genai`) |
| CLI input | Node `readline/promises` |
| Environment | `dotenv` |
| Framework | **None** — built from scratch |

---

## Documentation

| File | Purpose |
|---|---|
| `docs/code-explained.md` | Teaching guide — line-by-line explanations for first-time readers |
| `docs/code-explained.md.resolved` | Session log — what was built, what failed, and what was fixed |

---

## Running the Project

```bash
# Install dependencies
npm install

# Run (requires GEMINI_API_KEY in .env)
npm start

# Development mode (auto-restart on file changes)
npm run dev
```

`.env` file format:
```
GEMINI_API_KEY=your_api_key_here
```
