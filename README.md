<div align="center">

# 🧠 AI Engineering Practice Projects

### A hands-on journey from AI theory to production-ready systems

[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)](.)
[![Projects](https://img.shields.io/badge/Projects-7_Planned-blue?style=flat-square)](.)
[![Stack](https://img.shields.io/badge/Primary_Stack-Node.js_|_Python-yellow?style=flat-square)](.)
[![Book](https://img.shields.io/badge/Based_On-AI_Engineering_2025-purple?style=flat-square)](.)

<br/>

> *"30% theory, 70% practice. Every project here is a concept I actually understand — built from scratch, no shortcuts."*

<br/>

**Sanket Talekar** — Final Year B.Tech CSE @ D.Y. Patil College of Engineering & Technology, Kolhapur  
AI Automation Engineer & Full Stack Developer (AI Focus)

[LinkedIn](https://www.linkedin.com/in/sanket-talekar-94087a263/) · [Portfolio](https://sanketprogrammer.netlify.app/) 

</div>

---

## 📖 About This Repository

This repo is my structured, self-driven AI Engineering practice ground. After completing the full **AI Engineering 2025** book by Akshay Pachaar & Avi Chawla (DailyDoseofDS), I shifted from theory-first to **practice-first learning**.

Every project here is:
- **Standalone** — independent codebase, independent domain, no copy-paste between projects
- **Progressive** — each project introduces new concepts while building on previous ones
- **From scratch** — no LangChain abstractions until I understand what's being abstracted
- **Job-signal focused** — built to demonstrate real AI engineering skills to product-first companies

---

## 🗺️ Full Roadmap

| # | Project | Concepts Covered | Stack | Status |
|---|---------|-----------------|-------|--------|
| 01 | [AI Study Buddy](#-project-01--ai-study-buddy) | LLM params, generation strategies, prompt engineering, JSON output, CoT, session memory | Node.js | 🟡 In Progress |
| 02 | [Study Buddy v2 — Stateful Tutor](#-project-02--study-buddy-v2--stateful-tutor) | Multi-turn memory, G-eval, LLM-as-judge, self-evaluation loop, component evals | Node.js | ⚪ Planned |
| 03 | [News Research Agent](#-project-03--news-research-agent) | ReAct pattern, tool use, agent loop, agentic memory, context engineering | Node.js | ⚪ Planned |
| 04 | [Research Agent + Knowledge Base](#-project-04--research-agent--knowledge-base) | RAG from scratch, chunking strategies, ChromaDB, HyDE, Agentic RAG | Node.js + Python | ⚪ Planned |
| 05 | [MCP Server + Observability](#-project-05--mcp-server--observability) | MCP architecture, MCP tools/resources, LLM tracing, Opik, multi-turn evals | Python | ⚪ Planned |
| 06 | [AI Code Review System](#-project-06--ai-code-review-system) | Multi-agent orchestration, A2A protocol, red teaming, FastAPI deployment | Python | ⚪ Planned |
| 07 | [LoRA Fine-tuning Experiment](#-project-07--lora-fine-tuning-experiment) | LoRA, IFT dataset generation, SFT, FT vs RAG vs prompting comparison | Python | ⚪ Planned |

**Legend:** 🟢 Complete · 🟡 In Progress · 🔴 Blocked · ⚪ Planned

---

## 📁 Repository Structure

```
ai-engineering-practice/
│
├── README.md                        ← You are here
├── .gitignore                       ← Covers all projects (node_modules, .env, logs)
│
├── 01 Study Buddy/                  ← Node.js · LLM fundamentals
│   ├── README.md
│   ├── .env.example
│   ├── package.json
│   ├── index.js
│   └── src/
│       ├── geminiClient.js
│       ├── promptBuilder.js
│       ├── explain.js
│       ├── quiz.js
│       ├── params.js
│       ├── strategies.js
│       ├── memory.js
│       └── logger.js
│
├── 02 Study Buddy v2/               ← Node.js · Evaluation & memory
├── 03 News Research Agent/          ← Node.js · Agents from scratch
├── 04 Agent + Knowledge Base/       ← Node.js + Python · RAG pipeline
├── 05 MCP Server/                   ← Python · MCP + Observability
├── 06 Code Review Agents/           ← Python · Multi-agent systems
└── 07 LoRA Finetuning/              ← Python · Fine-tuning experiments
```

---

## 🔬 Project Details

---

### 📦 Project 01 — AI Study Buddy

> **The foundation. Direct LLM interaction — no frameworks, no abstractions.**

**Domain:** Education / CLI tool  
**Language:** Node.js (JavaScript)  
**Duration:** 3 weeks  
**Status:** 🟡 In Progress

#### What it does
A command-line tool where you type any technical topic and the system generates an explanation, an interactive quiz, and comparative outputs across different generation strategies. Every API call is written by hand — no wrapper libraries hiding what's happening.

#### CLI Commands
| Command | What it does |
|---------|-------------|
| `explain <topic>` | Plain-text explanation with LLM |
| `quiz <topic>` | JSON-structured interactive quiz |
| `compare <topic>` | Same prompt, 3 different temperature configs |
| `strategies <topic>` | Greedy vs sampling vs CoT comparison |
| `history` | Show topics asked this session |
| `exit` | Save session log and quit |

#### Concepts Learned
- `temperature`, `top_p`, `max_tokens` — what they actually do to output
- Greedy decoding vs nucleus sampling vs beam search
- Zero-shot, few-shot, chain-of-thought prompting
- Forcing JSON output and parsing it reliably
- Verbalized sampling technique
- In-memory session state (no database)
- LLM self-evaluation as a first eval loop

#### Key Files
| File | Responsibility |
|------|---------------|
| `geminiClient.js` | All Gemini API calls — single source of truth |
| `promptBuilder.js` | Prompt templates — explain, quiz, CoT |
| `strategies.js` | Generation strategy comparison via `Promise.all()` |
| `quiz.js` | JSON output forcing + safe parsing with retry |
| `memory.js` | In-memory session store (plain JS object) |
| `logger.js` | Writes `session-[timestamp].json` on exit |

#### Book Chapters → Practice
| Book Chapter | Implemented In |
|-------------|---------------|
| 7 LLM Generation Parameters | `params.js`, `geminiClient.js` |
| 4 LLM Text Generation Strategies | `strategies.js` |
| What is Prompt Engineering | `promptBuilder.js` |
| 3 Prompting Techniques for Reasoning | `strategies.js` (CoT) |
| JSON Prompting for LLMs | `quiz.js` |
| Verbalized Sampling | Day 8 experiment |

---

### 📦 Project 02 — Study Buddy v2 — Stateful Tutor

> **Same project, upgraded. Evaluation and persistent memory layer added.**

**Domain:** Education / CLI tool  
**Language:** Node.js (JavaScript)  
**Duration:** 2 weeks  
**Status:** ⚪ Planned

#### What it adds over Project 01
- Full multi-turn conversation history passed to every API call
- G-eval style self-scoring: after every explanation, the LLM grades itself on accuracy, clarity, and completeness (1–5 each), returning structured JSON
- Auto-regeneration: if any score is below 3, retry with chain-of-thought prompt
- Running score average displayed in terminal
- Session data includes scores alongside responses in `session.json`

#### Concepts Learned
- Multi-turn conversation management
- G-eval evaluation framework
- LLM-as-judge pattern
- Component-level evaluation
- Iterative self-improvement loop

---

### 📦 Project 03 — News Research Agent

> **First real agent. ReAct loop built entirely by hand — no LangChain.**

**Domain:** News research / automated reporting  
**Language:** Node.js (JavaScript)  
**Duration:** 3 weeks  
**Status:** ⚪ Planned

#### What it does
Takes a research question. Autonomously decides which tools to call. Reasons step-by-step using the ReAct pattern (Thought → Action → Observation → repeat). Produces a structured JSON report with sources.

#### Tools the agent can use
- `web_search(query)` — searches for current information
- `summarize_text(text)` — condenses long content
- `check_claim(claim)` — verifies a statement against search results

#### Concepts Learned
- ReAct agent loop implemented from scratch
- Tool definition and tool-call parsing
- Agent working memory (scratchpad)
- Context window management (trimming old observations)
- Agentic design patterns

---

### 📦 Project 04 — Research Agent + Knowledge Base

> **RAG pipeline from scratch. The agent gets a long-term memory.**

**Domain:** Personal knowledge base + research  
**Language:** Node.js + Python  
**Duration:** 3 weeks  
**Status:** ⚪ Planned

#### What it adds over Project 03
- 4th tool added: `knowledge_base_search(query)` — searches a local vector store
- Chunking pipeline: fixed-size, sentence-based, and semantic chunking — compared
- Embeddings via Gemini `embedding-001`
- Local vector store: ChromaDB
- HyDE (Hypothetical Document Embeddings): generate a hypothetical answer, embed it, then retrieve — compared against direct query retrieval

#### Concepts Learned
- RAG architecture from scratch
- 5 chunking strategies and their tradeoffs
- Vector databases (ChromaDB locally)
- HyDE vs standard retrieval
- Agentic RAG vs traditional RAG
- When to use RAG vs prompting vs fine-tuning

---

### 📦 Project 05 — MCP Server + Observability

> **Expose the agent as a service. Add full tracing so every call is visible.**

**Domain:** Developer tooling  
**Language:** Python  
**Duration:** 2 weeks  
**Status:** ⚪ Planned

#### What it does
Wraps the Research Agent from Project 04 as an MCP (Model Context Protocol) server. Any MCP-compatible client (Claude Desktop, etc.) can call it. Every LLM call, tool call, and retrieval step is traced and logged using Opik.

#### MCP Tools Exposed
- `research(question)` — runs the full agent
- `add_to_kb(pdf_path)` — ingests a document into the knowledge base
- `get_report(topic)` — returns a cached report

#### Concepts Learned
- MCP architecture (host, client, server)
- MCP primitives: tools, resources, prompts
- LLM observability vs evaluation
- Trace instrumentation with Opik
- Latency, cost, and quality metrics per call

---

### 📦 Project 06 — AI Code Review System

> **Multi-agent. An orchestrator spawns specialist sub-agents in parallel.**

**Domain:** Developer tooling / code quality  
**Language:** Python  
**Duration:** 4 weeks  
**Status:** ⚪ Planned

#### Architecture
```
GitHub PR diff
      ↓
 Orchestrator Agent
  ├── Agent 1: Logic reviewer    → finds bugs
  ├── Agent 2: Security reviewer → finds vulnerabilities  
  └── Agent 3: Style reviewer    → checks naming, complexity
      ↓
 Synthesized final review (JSON + Markdown)
      ↓
 FastAPI endpoint
```

#### Concepts Learned
- Multi-agent orchestration pattern
- Agent-to-Agent (A2A) communication protocol
- 7 patterns in multi-agent systems
- Red teaming LLM apps
- FastAPI deployment of agent systems
- 5 levels of agentic AI systems

---

### 📦 Project 07 — LoRA Fine-tuning Experiment

> **Fine-tuning last, not first. Because now I have an evaluator to measure if it actually helps.**

**Domain:** Code review (same as Project 06 — for direct comparison)  
**Language:** Python  
**Duration:** 4 weeks  
**Status:** ⚪ Planned

#### What it does
Fine-tunes Phi-3-mini using LoRA on a dataset of (code, review) pairs. Runs the same evaluation harness from Projects 02 and 06 on: base model vs fine-tuned model. Documents where fine-tuning wins, where RAG wins, where prompting wins.

#### Concepts Learned
- LoRA (Low-Rank Adaptation) from scratch understanding
- IFT (Instruction Fine-Tuning) dataset generation
- SFT vs RFT
- Full fine-tuning vs LoRA vs RAG — practical comparison
- Hugging Face `transformers` + `peft`

---

## 🛠️ Tech Stack Overview

| Layer | Projects 01–03 | Projects 04–07 |
|-------|---------------|----------------|
| Language | Node.js (JS) | Python |
| LLM | Gemini 1.5 Flash (free tier) | Gemini 1.5 Flash (free tier) |
| Vector DB | — | ChromaDB (local) |
| Agent Framework | None — from scratch | None — from scratch |
| Observability | — | Opik |
| Serving | — | FastAPI |
| Fine-tuning | — | HuggingFace + PEFT |

---

## 📊 Learning Progress

| Concept Area | Theory | Practice | Project |
|-------------|--------|----------|---------|
| LLM fundamentals & generation | ✅ | 🟡 | 01 |
| Prompt engineering | ✅ | 🟡 | 01 |
| LLM evaluation | ✅ | ⚪ | 02 |
| AI Agents (ReAct) | ✅ | ⚪ | 03 |
| Context engineering | ✅ | ⚪ | 03 |
| RAG pipeline | ✅ | ⚪ | 04 |
| MCP protocol | ✅ | ⚪ | 05 |
| LLM observability | ✅ | ⚪ | 05 |
| Multi-agent systems | ✅ | ⚪ | 06 |
| Fine-tuning (LoRA) | ✅ | ⚪ | 07 |

---

## 🔑 Setup & Usage

Each project is self-contained. Navigate into any project folder and follow its own `README.md`.

**General pattern for JS projects (01–03):**
```bash
cd "01 Study Buddy"
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
node index.js
```

**General pattern for Python projects (04–07):**
```bash
cd "04 Agent + Knowledge Base"
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
python main.py
```

> ⚠️ **Never commit your `.env` file.** Always use `.env.example` to share required variable names.

---

## 📚 Reference

**Book:** AI Engineering 2025 Edition — Akshay Pachaar & Avi Chawla (DailyDoseofDS.com)

**Topics covered in the book (all studied before starting this practice):**
LLMs · Prompt Engineering · Fine-tuning · RAG · Context Engineering · AI Agents · MCP · LLM Optimization · LLM Evaluation · LLM Deployment · LLM Observability

---

## 📬 Connect

If you're a recruiter, hiring manager, or fellow builder — feel free to reach out.

**Sanket Talekar**  
B.Tech CSE · D.Y. Patil College of Engineering & Technology, Kolhapur  
Graduating: June 2026 · CGPA: 8.32
Experience: Junior Software Developer at 'The Business Legacy' -- Pune , Maharashtra (Jan 2026 - Present) 
</br>
Targeting: AI Automation Engineer · Full Stack Developer (AI Focus)

· [LinkedIn](https://www.linkedin.com/in/sanket-patil-b2867128a/) 
· [Email](sankettalekar896@gmail.com)
· [Portfolio ](https://sanketprogrammer.netlify.app/)
· [GitHub](https://github.com/DetectiveSanket)


---

<div align="center">
<sub>Built with curiosity. Every line written to understand, not just to ship.</sub>
</div>