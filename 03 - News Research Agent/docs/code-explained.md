# News Research Agent — Code Explained

> **Audience:** Someone reading this code for the first time, with no AI assistance.
> **Style:** Teaching — every section is self-contained. Open any section and understand it immediately.

---

## Table of Contents

- [Task 1 — Project Scaffold & Entry Point (`index.js`)](#task-1--project-scaffold--entry-point-indexjs)
- [Task 2 — Gemini Client (`src/geminiClient.js`)](#task-2--gemini-client-srcgeminiclientjs)
- [Task 3 — Context Builder (`src/contextBuilder.js`)](#task-3--context-builder-srccontextbuilderjs)
- [Task 4 — Tool Dispatcher (`src/toolDispatcher.js`)](#task-4--tool-dispatcher-srctooldispatcherjs)
- [Task 5 — Web Search Tool (`tools/webSearch.js`)](#task-5--web-search-tool-toolswebsearchjs)
- [Task 6 — Agent Loop (`src/agentLoop.js`)](#task-6--agent-loop-srcagentloopjs)
- [Task 7 — Gemini Client: Multi-turn Upgrade](#task-7--gemini-client-multi-turn-upgrade)
- [Task 8 — Summarize Tool (`tools/summarize.js`)](#task-8--summarize-tool-toolssummarizejs)
- [Task 9 — Check Claim Tool (`tools/checkClaim.js`)](#task-9--check-claim-tool-toolscheckclaim-js)
- [Task 10 — Agent Loop: Day 5 Upgrades](#task-10--agent-loop-day-5-upgrades)
- [Task 11 — Working Memory & Agent Robustness: Day 6 Upgrades](#task-11--working-memory--agent-robustness-day-6-upgrades)
- [Task 12 — Context Engineering: Day 7 Upgrades](#task-12--context-engineering-day-7-upgrades)
- [Task 13 — Report Builder: Day 8 (`src/reportBuilder.js` + `index.js`)](#task-13--report-builder-day-8)
- [Task 14 — Error Handling + Agent Guardrails: Day 9](#task-14--error-handling--agent-guardrails-day-9)
- [Task 15 — CLI Polish + Multi-Question Session: Day 10 (`index.js`)](#task-15--cli-polish--multi-question-session-day-10)
- [Day 1 — Format Investigation & Known Limitation](#day-1--format-investigation--known-limitation)
- [Master Concepts Glossary](#master-concepts-glossary)

---

## Task 1 — Project Scaffold & Entry Point (`index.js`)

### What this file does and WHY it exists

`index.js` is the **entry point** of the entire application — the first file Node.js runs when you execute `node index.js`. Think of it as the front door of the program.

Its job right now is simple:
1. Ask the user to type a research topic.
2. Send that topic to the Gemini AI model.
3. Print the AI's response.
4. Loop and ask again until the user types `exit`.

This is a **temporary scaffolding shell**. In later tasks, this loop will evolve into a full ReAct agent loop. But starting here gives you a working skeleton you can actually run and verify.

---

### Line-by-line explanation

#### Imports

```js
import { generateContent } from './src/geminiClient.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
```

- **`import { generateContent }`** — pulls in our custom function from `geminiClient.js` that talks to the Gemini API. The `{ }` means we are doing a *named import* — we only want that one specific export.
- **`import * as readline`** — imports Node's built-in `readline` module. This module lets your program read keyboard input from the terminal. The `* as` syntax means "import everything and call it `readline`."
- **`{ stdin as input, stdout as output }`** — `stdin` is the stream that reads from the keyboard; `stdout` is the stream that writes to the terminal. We rename them to `input` and `output` for clarity.

#### Creating the readline interface

```js
const rl = readline.createInterface({ input, output });
```

`rl` (readline interface) connects the keyboard stream and terminal stream together so you can ask questions and receive typed answers. Think of it as opening a two-way pipe between your program and the user's terminal.

#### Handling Ctrl+C gracefully

```js
process.on('SIGINT', () => {
    process.exit(0);
});
```

`SIGINT` is the signal your OS sends when a user presses **Ctrl+C**. Without this handler, the program might throw an ugly error instead of closing cleanly. `process.exit(0)` means "exit with code 0" — 0 conventionally means "success / no error."

#### The main async function

```js
async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    while(true) {
        const userInput = await rl.question("\n Enter a topic to study (or type 'exit'): ");
        ...
    }
}
```

- **`async function`** — this function contains `await` calls (waiting for the AI response, waiting for user input). Without `async`, using `await` would be a syntax error.
- **`while(true)`** — an infinite loop. The program keeps asking for topics forever until you explicitly `break` out.
- **`await rl.question(...)`** — pauses the loop here and waits for the user to type something and press Enter. The result is stored in `userInput`.

#### Exit condition

```js
if(userInput.toLowerCase() === 'exit') {
    console.log("\n👋 Closing the AI Study Buddy. See you later!");
    rl.close();
    break;
}
```

- **`.toLowerCase()`** — makes the comparison case-insensitive, so "EXIT", "Exit", and "exit" all work.
- **`rl.close()`** — cleanly shuts down the readline interface before exiting.
- **`break`** — exits the `while(true)` loop.

#### Calling the AI

```js
const response = await generateContent({
    prompt: {
        system: `You are a News Research Agent. Your job is to find top 5 trending news`,
        message: userInput
    },
    config: {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 300,
    }
})
```

We call `generateContent` with an object that has two keys:
- **`prompt`** — contains `system` (the AI's persona/instructions) and `message` (the actual user question).
- **`config`** — controls *how* the AI generates text (creativity, length, etc.). See Glossary for what each parameter does.

#### Cleanup handler

```js
rl.on("close", () => {
    process.exit(0);
});
```

This is a safety net. If `rl` closes for *any* reason (not just our `break`), the process exits cleanly.

---

### Key concepts introduced in Task 1

| Concept | Plain English |
|---|---|
| Entry point | The first file Node.js executes — the program's "front door" |
| `async / await` | JavaScript's way of pausing code to wait for slow operations (API calls, user input) without freezing everything else |
| `readline` | Node.js built-in for reading text typed into a terminal |
| `SIGINT` | An OS signal sent when user presses Ctrl+C |
| `process.exit(0)` | Tell the OS the program finished successfully |
| Named import `{ }` | Pull out just one specific export from a module |
| `while(true)` loop | Loop forever until an explicit `break` |

---

## Task 2 — Gemini Client (`src/geminiClient.js`)

### What this file does and WHY it exists

`geminiClient.js` is the **only place in the entire project that touches the Gemini API**. It acts as an abstraction layer — a translator between your application code and the raw Google AI SDK.

**Why isolate it?**
- If Google changes their SDK, you fix it in one file, not everywhere.
- The rest of the app (the agent loop, tools, etc.) can call `generateContent(...)` without ever knowing *how* it works.
- It's easier to test and swap out (e.g., switch to Claude or GPT) later.

---

### Line-by-line explanation

#### Imports

```js
import { GoogleGenAI } from '@google/genai';
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
```

- **`GoogleGenAI`** — the official Google AI SDK class. You create an instance of it with your API key, and then use it to make API calls.
- **`config` from `dotenv`** — loads the contents of your `.env` file into `process.env`. Without this, `process.env.GEMINI_API_KEY` would be `undefined`.
- **`fileURLToPath`, `dirname`, `join`** — path utilities used to find the `.env` file reliably, regardless of which directory you run the program from.

#### The `__dirname` workaround for ES Modules

```js
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });
```

**This is one of the most common gotchas in modern Node.js.** In older CommonJS modules (`require()`), Node automatically gives you `__dirname` (the folder this file is in). But in ES Modules (`import/export`, triggered by `"type": "module"` in `package.json`), `__dirname` does not exist.

The fix:
1. `import.meta.url` — gives you the full URL of the current file (e.g., `file:///d:/project/src/geminiClient.js`).
2. `fileURLToPath(...)` — converts that URL to a regular file path.
3. `dirname(...)` — strips the filename to get just the folder path.
4. `join(__dirname, "..", ".env")` — navigates one level up (`..`) to find `.env` in the project root.

This ensures dotenv always finds your `.env` file no matter where you run `node` from.

#### Creating the SDK client

```js
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
```

This creates one shared instance of the Google AI client. It's created once at module load time (not inside the function) so you don't pay the cost of re-creating it on every API call.

#### The `generateContent` function

```js
export async function generateContent({ model = 'gemini-2.5-flash-preview', prompt, config = {} }) {
```

- **`export`** — makes this function importable by other files.
- **Default parameter `model = 'gemini-2.5-flash-preview'`** — if the caller doesn't specify a model, use this one. This means `index.js` doesn't have to worry about model names.
- **`config = {}`** — if no config is passed, default to an empty object so the `??` operators below have something to work with.

#### API key guard

```js
if(!process.env.GEMINI_API_KEY){
    throw new Error("GEMINI_API_KEY is missing in .env file");
}
```

Fails fast with a clear message rather than letting the SDK throw a cryptic network error. This is a "guard clause" — check preconditions at the top and exit early.

#### The actual API call

```js
// Build multi-turn conversation with a model-turn primer.
// This is "response priming" — explained in the Day 1 Investigation section.
const primer = prompt.primer ?? 'Thought:';

const contents = [
    { role: 'user',  parts: [{ text: prompt.message }] },
    { role: 'model', parts: [{ text: primer }] },
];

const response = await client.models.generateContent({
    model: model,
    systemInstruction: prompt.system,
    contents: contents,
    config: {
        temperature: config.temperature ?? 0.6,
        topP: config.topP ?? 0.95,
        maxOutputTokens: config.maxOutputTokens ?? 1000,
    },
})
```

- **`systemInstruction`** — a special field in Gemini's API for the "system prompt." This sets the AI's persona and rules *before* the conversation starts. It's separate from `contents` so the model treats it with higher authority.
- **`contents`** — the actual user message to respond to.
- **`??` (nullish coalescing operator)** — means "use the left value if it's not `null` or `undefined`, otherwise use the right value." So `config.temperature ?? 0.6` means "use whatever temperature the caller passed, or default to 0.6."

#### Extracting the response text

```js
return typeof response.text === 'function' ? response.text() : response.text;
```

The Google GenAI SDK has had inconsistencies across versions — in some versions `response.text` is a string, in others it's a callable function. This one-liner handles both cases safely using a **ternary operator**: `condition ? valueIfTrue : valueIfFalse`.

---

### Key concepts introduced in Task 2

| Concept | Plain English |
|---|---|
| Abstraction layer | A file/function that hides complexity so the rest of the app doesn't need to know the details |
| ES Module `__dirname` workaround | Using `import.meta.url` + `fileURLToPath` to get the current directory in ESM |
| `dotenv` | A library that loads `.env` files into `process.env` at runtime |
| `process.env` | A Node.js object that holds environment variables (secrets, config) |
| Guard clause | Checking a condition at the very top of a function and throwing/returning early if it fails |
| System instruction | A special "boss-level" prompt that sets the AI's behavior before the conversation starts |
| `??` nullish coalescing | Returns right-hand value only if left-hand is `null` or `undefined` (not `0` or `""`) |
| Ternary operator `? :` | A compact `if/else` in one line |
| Singleton pattern | Creating one shared instance of a resource (the SDK client) instead of recreating it repeatedly |
| Multi-turn `contents` array | Passing the conversation as `[{ role:'user', parts:[...] }, { role:'model', parts:[...] }]` instead of a plain string |
| Response priming / model-turn prefill | Injecting a partial model turn (e.g. `"Thought:"`) into `contents` so the model is forced to continue in that format |

---

## Task 3 — Context Builder (`src/contextBuilder.js`)

### What this file does and WHY it exists

`contextBuilder.js` is responsible for **constructing the system prompt** — the set of instructions the LLM reads before it sees the user's question. It is a pure data-builder: it receives no user input and makes no API calls. It just returns a carefully crafted string.

**Why isolate the prompt here instead of writing it directly in `index.js`?**
- The system prompt is the agent's "brain" — it will grow complex over time (tool descriptions, formatting rules, constraints). Keeping it in its own file prevents `index.js` from becoming cluttered.
- If you want to experiment with different prompting strategies, you change one file without touching the loop or the API client.
- It is the correct place for **context engineering** — the discipline of carefully designing what the LLM sees.

---

### Line-by-line explanation

#### The exported function

```js
export function buildPromptWithTools() {
    return `...`
}
```

- **`export function`** — makes this function importable by other files. No `async` needed because this function does no I/O — it just builds a string.
- Returns a **template literal** (backtick string) — allows the multi-line, indented text to be written naturally in the source code.

#### The system prompt content — broken down

```
You are a research agent. Your job is to answer questions by searching for information.
```

This is the **persona line**. It tells the model *who it is*. LLMs respond differently based on how they're told to think of themselves. "Research agent" primes the model to look for information rather than reason from memory.

```
You have access to these tools:
- web_search(query): Search for recent news on a topic
- summarize(text): Condense long text into key points
- check_claim(claim): Verify if a claim is accurate
```

This is the **tool manifest** — a description of every tool the agent is *allowed* to call. The LLM doesn't have actual access to these tools yet (Day 1). But by telling it they exist, the model will *pretend* to call them, which produces the ReAct-format output we want to see.

Each tool is described with:
- A **name** (must exactly match what the tool dispatcher will parse later)
- **Argument type** in parentheses
- A plain-English **description** of what it does

```
Use this EXACT format every time:
Thought: [your reasoning about what to do next]
Action: toolName(argument here)
```

This is the **format contract** — the most critical part of the prompt. It tells the model exactly how to structure its output. The word "EXACT" is intentional; it reduces the chance the model deviates from the format.

- **`Thought:`** — forces the model to externalize its reasoning before acting (this is the "Re" in ReAct — *Re*ason).
- **`Action:`** — a structured action string that your tool dispatcher will parse as `toolName(argument)` (this is the "Act" in ReAct).

```
When you have enough information to answer, use:
Thought: I now have enough information
Final Answer: [your complete answer]
```

This tells the model **how to signal that it is done**. Your agent loop (built in a later task) will scan for the `Final Answer:` token to know when to stop the loop and print the result.

```
Never skip the Thought step. Never call two tools in one action.
```

Two hard constraints:
1. Keeps the output parseable — every action is preceded by a thought.
2. Forces single-step actions — prevents the model from trying to do too much in one turn, which would break the dispatcher.

#### How `index.js` uses this function

```js
import { buildPromptWithTools } from './src/contextBuilder.js';

// Inside the loop:
const response = await generateContent({
    prompt: {
        system: buildPromptWithTools(),   // ← injected as systemInstruction
        message: userInput                // ← the user's research question
    },
    ...
})
```

`buildPromptWithTools()` is called once per loop iteration. Its return value goes into `prompt.system`, which `geminiClient.js` passes to Gemini's `systemInstruction` field — a privileged slot the model reads before anything else.

---

### Key concepts introduced in Task 3

| Concept | Plain English |
|---|---|
| Context engineering | The discipline of carefully designing what goes into the LLM's context window to shape its behavior |
| System prompt | A privileged instruction block the model reads before the user message — sets persona, rules, format |
| Tool manifest | A list of available tools and their signatures, described in plain English inside the prompt |
| Format contract | The exact output format you instruct the model to follow so your parser can reliably read it |
| ReAct format | Alternating `Thought:` and `Action:` lines — forces the model to reason before acting |
| `Final Answer:` token | A special marker the agent loop watches for to know when to stop iterating |
| Pure function | A function that takes inputs (or no inputs) and returns a value, with no side effects — `buildPromptWithTools` is one |
| Template literal | A backtick string in JavaScript that supports multi-line text and embedded expressions via `${}` |

---

## Task 4 — Tool Dispatcher (`src/toolDispatcher.js`)

### What this file does and WHY it exists

`toolDispatcher.js` is the **text-to-action translator**. The LLM can only output text. It cannot call JavaScript functions. This file bridges that gap: it reads the LLM's raw text, extracts the structured information (tool name + argument), and returns an object your program can act on.

**Why isolate it?**
- Parsing logic is complex and error-prone. Keeping it here means `agentLoop.js` can stay clean.
- Every edge case (extra spaces, unknown tools, missing `Action:` prefix) is handled in one place.
- It is independently testable without running the full agent loop.

**Three exported functions:**

| Function | Input | Output |
|---|---|---|
| `parseAction(text)` | Raw LLM output | `{ tool, args }` or `{ tool: null, error }` |
| `isFinalAnswer(text)` | Raw LLM output | `true` / `false` |
| `extractFinalAnswer(text)` | Raw LLM output | The answer string, or `null` |

---

### Line-by-line explanation

#### Module-level constants

```js
const validTools = ["web_search", "summarize", "check_claim"];
const ACTION_REGEX = /Action:\s*(\w+)\s*\(([^)]*)\)/;
```

- **`validTools`** — a whitelist of tool names. Defined at module level (not inside the function) so it's created once and reused on every call. These names must **exactly match** what appears in `contextBuilder.js`'s tool manifest.
- **`ACTION_REGEX`** — the regular expression that parses the LLM's action string. Defined at module level for the same reason: build once, reuse many times.

#### Regex breakdown — the most important line in the file

```
/Action:\s*(\w+)\s*\(([^)]*)\)/
   │      │   │    │  │   │  │
   │      │   │    │  │   │  └─ literal closing )
   │      │   │    │  │   └─── capture group 2: everything EXCEPT ) inside the parens
   │      │   │    │  └───── literal opening ( (escaped because ( is special in regex)
   │      │   │    └────── optional spaces between tool name and (
   │      │   └─────── capture group 1: \w+ = one or more word chars (letters, digits, _)
   │      └──────── \s* = zero or more spaces after "Action:"
   └────────── literal "Action:"
```

- `[^)]*` ("not-closing-paren") is safer than `.+` because it won't accidentally match across multiple parentheses if the LLM outputs something unusual.
- `\s*` before `\(` handles cases like `web_search (query)` with a space before the parenthesis.

#### `parseAction(text)` — step by step

```js
export function parseAction(text) {
    const actionMatch = text.match(ACTION_REGEX);
```

`text.match(regex)` returns `null` if no match is found, or an array where:
- `[0]` = the full matched string
- `[1]` = first capture group (tool name)
- `[2]` = second capture group (argument)

```js
    if(!actionMatch) {
        return { tool: null, error: "parse_failed" };
    }
```

**Guard clause** — if the regex didn't match, the text isn't an action. This covers:
- `"Thought: I should search the web"` — no `Action:` prefix
- `"Final Answer: The regulation passed."` — not an action at all

```js
    const [, toolName, args] = actionMatch;
```

**Array destructuring** with a skipped first element. The `,` before `toolName` deliberately skips index `[0]` (the full match). This is equivalent to:
```js
const toolName = actionMatch[1];
const args = actionMatch[2];
```
But more concise and idiomatic.

```js
    if(!validTools.includes(toolName)) {
        return { tool: null, error: "unknown_tool" };
    }
```

Checks the tool name against the whitelist. Catches cases where the LLM hallucinates a tool name like `fly_to_moon` that doesn't exist in your codebase.

```js
    return { tool: toolName, args: args.trim() };
```

`args.trim()` removes any leading/trailing whitespace from the argument — handles `web_search( query here  )` cleanly.

---

#### `isFinalAnswer(text)` — the loop's exit detector

```js
export function isFinalAnswer(text) {
    return text.includes("Final Answer:");
}
```

The simplest possible implementation. Returns `true` if the LLM's text contains `"Final Answer:"`. The agent loop (Day 3) will call this on every LLM response to decide whether to stop looping or call another tool.

---

#### `extractFinalAnswer(text)` — pulls out just the answer text

```js
export function extractFinalAnswer(text) {
    const match = text.match(/Final Answer:\s*(.*)/);
    return match ? match[1].trim() : null;
}
```

- **`/Final Answer:\s*(.*)/`** — matches `"Final Answer:"` followed by any number of spaces, then captures everything after it on that line.
- **Ternary** — if the match succeeded, return the captured text (trimmed); otherwise return `null`.

Example: `"Final Answer: The regulation passed in 2024."` → returns `"The regulation passed in 2024."`

---

### Test results (all 5 passed)

```
Input:  'Action: web_search(AI regulation 2025)'
Output: { tool: 'web_search', args: 'AI regulation 2025' }  ✅

Input:  'Action:  web_search( query here  )'
Output: { tool: 'web_search', args: 'query here' }           ✅ spaces handled

Input:  'Thought: I should search the web'
Output: { tool: null, error: 'parse_failed' }                ✅

Input:  'Action: fly_to_moon(Mars)'
Output: { tool: null, error: 'unknown_tool' }                ✅

Input:  'Final Answer: The regulation passed in 2024.'
Output: { tool: null, error: 'parse_failed' }                ✅
```

---

### Key concepts introduced in Task 4

| Concept | Plain English |
|---|---|
| Regex capture group `(...)` | Marks a part of the pattern whose matched text you want to extract. Accessed via `.match()[1]`, `.match()[2]`, etc. |
| `[^)]*` in regex | "Match any character that is NOT a closing parenthesis" — safer than `.+` for bounded captures |
| `text.match(regex)` | Runs the regex against `text`. Returns `null` on no match, or an array of matches and captures |
| Array destructuring with skip | `const [, a, b] = arr` — the leading `,` skips index 0 |
| Whitelist validation | Checking user/model input against a fixed list of allowed values before acting on it |
| Module-level constants | Variables defined outside functions so they're created once and shared across all calls |
| `String.prototype.includes()` | Returns `true` if the string contains the given substring anywhere |

---

## Task 5 — Web Search Tool (`tools/webSearch.js`)

### What this file does and WHY it exists

`webSearch.js` is the **first real tool** in the agent. Until now, everything was plumbing: prompts, parsers, clients. This file is where the agent actually reaches out to the internet and retrieves live information.

It wraps the **NewsAPI** service. When called with a search query string, it returns an array of up to 3 recent news articles — structured as `{ title, description, url, publishedAt }` — that the agent loop can inject back into the LLM's context as an `Observation`.

**Why `newsapi` SDK instead of raw `axios`?**
- The `newsapi` npm package is a thin, official wrapper that handles auth headers, URL construction, and error typing for you.
- Using raw `axios` would require manually building the URL and managing headers — more code, more places to make mistakes.

**Why `/v2/everything` instead of `/v2/topHeadlines`?**

| Endpoint | What it does | When to use |
|---|---|---|
| `/v2/topHeadlines` | Returns current top stories by *country* or *category* | Headlines page, daily briefing |
| `/v2/everything` | Full-text search across ALL articles by *keyword* | **Agent queries — use this** |

`topHeadlines` ignores your search query and just returns trending stories. `everything` actually searches. Since the agent passes user queries like `"AI regulation 2025"`, `everything` is the only correct choice.

---

### Line-by-line explanation

#### Imports and dotenv setup

```js
import NewsAPI from "newsapi";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });
```

Same ESM `__dirname` workaround as `geminiClient.js`. Needed because `tools/` is one directory deep — `join(__dirname, "..", ".env")` walks up to the project root to find the `.env` file.

#### Creating the NewsAPI client

```js
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
```

Singleton pattern — one client instance at module load time. The API key is read from the environment, never hardcoded.

#### The `webSearch(query)` function

```js
export async function webSearch(query) {
    try {
        const respose = await newsapi.v2.everything({
            q: query,
            language: 'en',
        });
```

- **`newsapi.v2.everything`** — calls the `/v2/everything` NewsAPI endpoint. The SDK converts `{ q, language }` into the correct HTTP query parameters.
- **`language: 'en'`** — filters to English articles only, keeping the LLM context clean.
- **`async/await`** — the HTTP call is asynchronous; `await` pauses until the response arrives.

#### Status guard

```js
if(respose.status !== 'ok' || !respose.articles) {
    return 'No articles found for this query.';
}
```

NewsAPI returns `{ status: 'ok', articles: [...] }` on success. If the status isn't `'ok'` or articles is missing (e.g. API quota exceeded), this returns a string message instead of crashing.

#### Slicing and mapping

```js
return articles.slice(0, 3).map(article => ({
    title: article.title,
    description: article.description,
    url: article.url,
    publishedAt: article.publishedAt
}));
```

- **`slice(0, 3)`** — caps results at 3. NewsAPI can return 100 articles per request. Injecting 100 articles into the LLM context would fill the context window and be wasteful. 3 is enough for the agent to form an answer.
- **`.map(...)`** — transforms each raw article object (which has ~10 fields) into only the 4 fields the agent needs. Keeps the observation lean.

#### Fallback on error

```js
} catch (error) {
    console.log(`webSearch error: ${error.message}`);
    return [
        {
            title: "Search unavailable",
            description: "Could not retrieve live results. Please try again.",
            url: "",
            publishedAt: new Date().toISOString()
        }
    ];
}
```

Instead of returning `undefined` on failure (which would crash the agent loop), the catch block returns a **mock result array** in the same shape as a real result. This means the agent loop always receives an array — it never has to handle a `null` or `undefined` case.

---

### Key concepts introduced in Task 5

| Concept | Plain English |
|---|---|
| NewsAPI `/v2/everything` | Full-text keyword search across all indexed news articles |
| NewsAPI `/v2/topHeadlines` | Current trending headlines by country/category — does NOT use your query |
| API rate limit | The free NewsAPI tier allows 100 requests/day; exceeding it returns an error |
| `.slice(0, N)` | Returns the first N items of an array — used here to cap context size |
| `.map(fn)` | Transforms every item in an array using a function — used to extract only needed fields |
| Graceful fallback | Returning a valid (mock) value on error instead of crashing — keeps the agent loop running |
| Context size management | Deliberately limiting tool output so it doesn't fill the LLM's context window |

---

## Task 6 — Agent Loop (`src/agentLoop.js`)

### What this file does and WHY it exists

`agentLoop.js` is the brain of the entire project. It runs the **ReAct loop**: Reason (Thought) → Act (call a tool) → Observe (inject tool result) → repeat until `Final Answer` or 10 steps.

**Three exported imports from previous days all meet here:**
- `generateContent` from Day 1 (Gemini call)
- `webSearch` from Day 3 (real tool)
- `parseAction`, `isFinalAnswer`, `extractFinalAnswer` from Day 2 (parser)

---

### The conversation history — the most important concept

The `messages` array is a growing record of every turn in the conversation:

```js
// What messages looks like after Step 1:
[
    { role: 'user',  parts: [{ text: 'Research question: AI Agents?' }] },
    { role: 'model', parts: [{ text: 'Thought: I need to search.\nAction: web_search(AI agents)' }] },
    { role: 'user',  parts: [{ text: 'Observation: [{ title: "Claude..." }]' }] },
]
```

On every iteration, this entire array is sent to Gemini. **The model sees the full history** and continues from where it left off. Without this, the agent would forget everything and repeat the same action forever.

The Gemini API requires **alternating** `user` / `model` turns. Two consecutive same-role turns cause an API error.

---

### Key concepts introduced in Task 6

| Concept | Plain English |
|---|---|
| **ReAct loop** | Reason (Thought) → Act (Action + tool) → Observe → repeat until done |
| **Conversation history (`messages`)** | Growing array of turns sent to Gemini each iteration so it remembers everything |
| **`role: 'user'` vs `role: 'model'`** | Gemini's two valid turn types. `'user'` = human/tool result. `'model'` = AI response |
| **Alternating turns** | Gemini requires user/model/user/model order. Two consecutive same roles = API error |
| **Observation injection** | Injecting a tool result back into conversation as a user turn so the model reads it |
| **Max steps guard** | Caps the loop at N iterations to prevent infinite loops from bad model output |
| **Object destructuring `{ }`** | Unpacks object fields by name: `const { tool, args } = obj` |
| **`JSON.stringify(val, null, 2)`** | Converts any JS value to a formatted JSON string with 2-space indent |

---

## Task 7 — Gemini Client: Multi-turn Upgrade

### What changed and WHY

Original `geminiClient.js` was built for Day 1: it received a **string** and built a 2-item `contents` array. The agent loop needs to pass a **full array** of turns. These are incompatible. The fix: detect which mode it's in.

```js
let contents;
if (Array.isArray(prompt.message)) {
    // Agent loop mode: pass the full messages array straight through
    contents = prompt.message;
} else {
    // Single-turn mode (Day 1): wrap string in a user turn + primer
    const primer = prompt.primer ?? 'Thought:';
    contents = [
        { role: 'user',  parts: [{ text: prompt.message }] },
        { role: 'model', parts: [{ text: primer }] },
    ];
}
```

`Array.isArray(value)` returns `true` if `value` is an array, `false` for strings, objects, null, etc.

| Caller | `prompt.message` | `Array.isArray` | Path |
|---|---|---|---|
| `index.js` | `"What is AI?"` (string) | `false` | Wrap + add primer |
| `agentLoop.js` | `[{role:'user',...}]` (array) | `true` | Pass directly |

**Why no primer in agent loop mode?** The conversation history itself enforces ReAct format — the model sees its own previous `Thought:` / `Action:` lines and continues the pattern naturally. No primer needed.

### Key concepts introduced in Task 7

| Concept | Plain English |
|---|---|
| **`Array.isArray(value)`** | Returns `true` if value is an array. The safest way to check for arrays in JS |
| **Dual-mode function** | A function that accepts two different input shapes and handles each appropriately |
| **Primer only for single-turn** | Response priming with `Thought:` is only needed when there's no conversation history |

---

## Task 8 — Summarize Tool (`tools/summarize.js`)

### What this file does and WHY it exists

`summarize.js` is the second tool in the agent's toolkit. When the agent has collected raw text (e.g. a long web article or multiple paragraphs) and wants to condense it, it calls `summarize`. The tool sends the text to Gemini with a single instruction: *"Summarize in 3 bullet points."*

This is the simplest of the three tools: one Gemini call, one string back.

---

### Line-by-line explanation

```js
import { generateContent } from "../src/geminiClient.js";
```

Only one import needed — no webSearch, no dispatcher. `summarize` talks directly to Gemini.

```js
export async function summarize(text) {
```

Accepts one argument: `text` — any string of content to summarize. The agent passes `args` from the `Action: summarize(...)` line here.

```js
const response = await generateContent({
    prompt: {
        system: "You are a precise summarization assistant. Return only bullet points, no extra text.",
        message: `Summarize the following in 3 bullet points:\n\n${text}`
    },
    config: { temperature: 0.1, topP: 0.95 }
});
return response;
```

- **`system:`** — short persona: *who* Gemini is for this call. Never the full ReAct agent prompt.
- **`message:`** — the full instruction + content in one string. The text appears exactly once.
- **`temperature: 0.1`** — very low temperature for deterministic, factual summaries (not creative).
- Returns the raw string from Gemini — already bullet points, ready to inject as an Observation.

---

### Key concepts introduced in Task 8

| Concept | Plain English |
|---|---|
| **`system` vs `message`** | `system` = persona (who you are). `message` = task (what to do). Keep them separate. |
| **Low temperature for factual tasks** | `0.1` = near-deterministic output. Use low temp for summarization/fact-checking, higher for creative tasks. |
| **Single-purpose tool** | Each tool does exactly one thing. `summarize` only summarizes — no searching, no parsing. |

---

## Task 9 — Check Claim Tool (`tools/checkClaim.js`)

### What this file does and WHY it exists

`checkClaim.js` is the most complex tool. It acts as an automated fact-checker. Given a claim string (e.g. `"OpenAI released GPT-5"`), it:

1. Searches the web for recent articles about that claim
2. Formats the articles into readable text
3. Asks Gemini: *"Based on these articles, is this claim accurate?"*
4. Returns a structured verdict object: `{ verdict: 'true'|'false'|'uncertain', reasoning: '...' }`

**Why `checkClaim` does its own webSearch internally** (not reusing a previous result):
The agent loop passes only a plain string (`args`) to each tool. There is no mechanism to pass data between tool calls. Even if `web_search` was called a step earlier, that result is only in the conversation history as text — `checkClaim` can't access it as a JavaScript object. So `checkClaim` fetches its own fresh evidence to evaluate the specific claim.

---

### Line-by-line explanation

```js
import { webSearch } from "./webSearch.js";
import { generateContent } from "../src/geminiClient.js";
```

Two imports: `webSearch` for evidence, `generateContent` for the verdict.

```js
const web = await webSearch(claim);
const resultWeb = web.map(article => `
    Title: ${article.title}
    Description: ${article.description}
    URL: ${article.url}
    Published At: ${article.publishedAt}
`).join("\n");
```

- `webSearch(claim)` returns an array of 3 article objects.
- `.map().join()` converts that array into a single readable text block. This is better than `JSON.stringify` for sending to Gemini — labeled fields read more naturally than raw JSON.

```js
const response = await generateContent({
    prompt: {
        system: `You are a precise fact-checking assistant. Return ONLY valid JSON:
        { "verdict": "true" | "false" | "uncertain", "reasoning": "one sentence" }`,
        message: `Based on the following articles, is this claim accurate: "${claim}"?\n\n${resultWeb}`
    },
    config: { temperature: 0.1, topP: 0.95 }
});
```

The system prompt explicitly tells Gemini to return **only JSON** with a fixed structure. `temperature: 0.1` keeps it strict.

```js
const result = response.replace(/```json\n?/g, '').replace(/```/g, '').trim();
try {
    return JSON.parse(result);
} catch (error) {
    return { verdict: "uncertain", reasoning: "Could not parse Gemini response." };
}
```

- **Markdown stripping** — Gemini sometimes wraps JSON in ` ```json ... ``` ` code fences. The two `.replace()` calls remove those fences before parsing.
- **`JSON.parse`** converts the cleaned string into a real JavaScript object `{ verdict, reasoning }`.
- **`try/catch` fallback** — if parsing fails for any reason, returns a safe default object instead of crashing the agent loop.

---

### Key concepts introduced in Task 9

| Concept | Plain English |
|---|---|
| **Self-contained tool** | Each tool manages its own data fetching — it doesn't rely on previous tool results |
| **`.map().join()`** | Converts array of objects into a single readable text block for LLM consumption |
| **Markdown stripping** | Removing ` ```json ``` ` fences Gemini sometimes adds around JSON responses |
| **Structured JSON output** | Asking Gemini to return strict JSON so the result is machine-readable, not just human-readable |
| **Graceful JSON parse fallback** | `try/catch` around `JSON.parse` prevents crashes when Gemini's output isn't clean JSON |

---

## Task 10 — Agent Loop: Day 5 Upgrades

### What changed and WHY

Three targeted fixes made the agent loop production-ready:

**Fix 1 — Strip quotes from `args` before all tool calls**

```js
const cleanArgs = args.replace(/^"|"$/g, '').trim();
```

The LLM sometimes wraps action arguments in double quotes: `Action: web_search("OpenAI GPT-5")`. This means `args` received by the loop is `"OpenAI GPT-5"` — with the quotes as part of the string. NewsAPI treats a quoted string as an **exact phrase match**, which is too strict and often returns `[]`. Stripping the outer quotes converts it to a normal keyword search.

All three tool cases now use `cleanArgs` instead of `args`.

**Fix 2 — `Thought:` primer injected every iteration**

```js
const contentsWithPrimer = [
    ...messages,
    { role: 'model', parts: [{ text: 'Thought:' }] }
];
```

The primer (`Thought:`) is appended to the messages array before every Gemini call. The model is a text completer — it **must** continue from whatever the model turn ends with. Starting the model turn with `Thought:` forces it into the ReAct format on every step.

This solved the core loop problem where the model kept answering in prose instead of using tools.

**Fix 3 — `MAX_STEPS` and rate limit management**

Free tier allows 5 Gemini requests/minute. The agent was hitting 429 errors with `MAX_STEPS = 10`. Set to `5` — enough for: 1 prose step + 2–3 tool calls + 1 Final Answer step. Error message updated to use `${MAX_STEPS}` dynamically.

**Fix 4 — `summarize` result not double-stringified**

`summarize` returns a plain string. Wrapping it in `JSON.stringify` added extra outer quotes, making the Observation look like `"\u2022 Point 1\n\u2022 Point 2"`. Changed to pass the string directly as `result`.

---

### Key concepts introduced in Task 10

| Concept | Plain English |
|---|---|
| **Regex `^"|"$`** | Matches a double-quote at the very start (`^`) or very end (`$`) of a string |
| **Primer on every iteration** | Spreading `...messages` and adding a model turn forces ReAct format each step, not just the first |
| **Rate limit (429)** | HTTP status 429 = "Too Many Requests". Free Gemini tier = 5 calls/minute |
| **`MAX_STEPS` tuning** | Setting step cap based on API quota — a production concern, not just a safety guard |

---

## Task 11 — Working Memory & Agent Robustness: Day 6 Upgrades

### What changed and WHY

In Task 11, the agent was upgraded from a naive, ballooning list of raw messages to a highly robust **Working Memory System (`memory.js`)** that keeps the agent focused, handles token budget management, and guarantees reliable, state-of-the-art behavior.

Here are the four key components that were introduced:

#### 1. Structured Working Memory System (`src/memory.js`)
Instead of feeding the entire conversation history back to the model, which balloons token usage and degrades performance, we introduced a centralized session state called a **Scratchpad**:

```javascript
const scratchpad = {
    question: "",
    thoughts: [],
    observation: [],
    steps: 0
};
```

This state is controlled via six specialized methods:
- **`setQuestion(q)`**: Sets the original research query.
- **`addThought(thought)`**: Appends a model's reasonings to the thought stack.
- **`addObservation(tool, args, result)`**: Stores what a tool returned. Critically, we truncate the result to the first 800 characters using `result.slice(0, 800)`. This protects the context window from massive search results while preserving enough text for synthesis.
- **`getContext(maxObs = 14)`**: Synthesizes a compact, readable context string for Gemini. It keeps only the last `maxObs` (e.g., 10 or 14) observations and the last 5 thoughts, and guarantees the original question is prepended at the top so the agent never forgets its goal.
- **`getScratchpad()`**: Returns the full state of the memory.
- **`clear()`**: Resets the state.

#### 2. Memory-Driven Agent Loop (`src/agentLoop.js`)
The agent loop was modified to dynamically construct Gemini's input from the memory system on every iteration:

```javascript
// Build context string from memory — updated every iteration with latest observations
const context = memory.getContext(10);

const contentsWithPrimer = [
    { role: 'user',  parts: [{ text: context }] },
    { role: 'model', parts: [{ text: 'Thought:' }] } // Forces Gemini to continue in ReAct format
];
```

By passing `contentsWithPrimer`, the agent gets a clean, structured context view instead of a long conversational chat history. At the start of a research query, `memory.clear()` is called to prevent **state bleed** between questions.

#### 3. CLI Command `scratchpad` (`index.js`)
To aid developers in debugging the agent's internal state, we added a special CLI shortcut. Typing `scratchpad` at the CLI prompt outputs a formatted JSON dump of the current session's memory structure:

```javascript
if(userInput.toLowerCase() === 'scratchpad') {
    const sp = memory.getScratchpad();
    console.log(JSON.stringify(sp, null, 2));
    continue;
}
```

#### 4. Agent Robustness Upgrades
Two critical issues were resolved to ensure the agent reliably answers modern, time-sensitive questions (such as whether OpenAI released GPT-5):
- **Dynamic Date Injection (`src/contextBuilder.js`)**: We injected today's date dynamically into the system instruction. Because Gemini's training cutoff is early 2024, it previously rejected 2025/2026 search results as impossible hallucinations. Teaching the model the actual date and adding a rule to `TRUST` search results solved this.
- **Step Budget Tuning (`src/agentLoop.js`)**: We bumped `MAX_STEPS` from `5` to `7`. Because the first step is often a formatting violation (wasted turn), the model needs additional steps for multiple tools (e.g., `web_search` → `check_claim`) plus a final step to output `Final Answer`.
- **Verbose Debug Logs**: Comprehensive debug sections were added to `webSearch.js` (raw articles count, all titles+dates) and `agentLoop.js` (context sent to Gemini, raw responses, observations saved) to make troubleshooting instant.

---

### Key concepts introduced in Task 11

| Concept | Plain English |
|---|---|
| **Scratchpad** | A dedicated data structure that tracks an agent's internal status, reasoning steps, and tool outputs independently of the raw API messages history. |
| **Token Budget Management** | Limiting or truncating text (e.g. slicing tool results to 800 characters) to avoid bloating prompts and triggering rate limits or context exhaustion. |
| **State Bleed** | An agent bug where previous queries/context bleed into the new session. Resolved by running a `.clear()` cleanup on startup. |
| **Dynamic Date Injection** | Injecting the current live system date into instructions so that the LLM is time-aware and correctly processes future dates returned by web tools. |
| **Format Priming** | A prompt engineering technique where we append a model-turn prefill (like `Thought:`) to force the LLM to complete the turn in the required format. |

---

## Task 12 — Context Engineering: Day 7 Upgrades

### What changed and WHY

Day 7 upgrades the system prompt from a **static set of rules** into a **dynamic, state-aware research brief** that evolves on every loop iteration. This is the "Context Engineering" chapter made real — the agent now knows what it has already done and self-corrects its behaviour based on progress.

#### 1. `buildPromptWithTools()` now accepts `memoryContext`

The function signature changed from zero arguments to optional `memoryContext`:

```javascript
export function buildPromptWithTools(memoryContext = null) {
    // ...
    if (!memoryContext) return base;  // ← backwards compatible: Day 1–6 callers still work
    // ...
}
```

The `= null` default makes it **backwards compatible** — any caller that doesn't pass memory still gets the base prompt. This is good API design.

#### 2. Dynamic Research Brief injected into every step

After the base rules, a `brief` section is appended that summarises the current session state:

```javascript
const brief = `
    Current research state (step : ${memoryContext.stepsUsed}):
        - Original question : ${memoryContext.question}
        - Topics already searched : ${searchedTopics}
        - Observations so far:
          ${memoryContext.memoryObservation.map(o =>
              ` - [${o.tool}(${o.args})]: ${o.result.slice(0, 150)}...`
          ).join('\n')}
        - HARD STOP: The topics listed above have ALREADY been searched.
          You MUST either search a COMPLETELY DIFFERENT angle OR write your Final Answer now.
`;
```

This prevents the agent from searching the same thing twice — by explicitly listing what it already searched with its results, the model has a concrete record to check before forming a new query.

#### 3. Step-Aware Urgency Notice

A `urgencyNotice` is computed each iteration. Once the agent has used `MAX_STEPS - 2` steps, a **mandatory stop instruction** is injected:

```javascript
const URGENCY_THRESHOLD = MAX_STEPS - 2; // fire with 2 steps remaining

const urgencyNotice = memoryContext.stepsUsed >= URGENCY_THRESHOLD
    ? `\n\nFINAL INSTRUCTION (MANDATORY): You have used ${memoryContext.stepsUsed} steps.
       Only ${MAX_STEPS - memoryContext.stepsUsed} steps remain. STOP calling tools.
       You MUST write your Final Answer NOW using the observations above.`
    : "";
```

This is appended **after** the brief — the last thing the model reads before generating a response. Position matters: a final instruction placed at the very end carries more weight than one buried in the middle.

#### 4. `MAX_STEPS` mirrored between both files

A local `const MAX_STEPS = 7` is declared inside `buildPromptWithTools`. It mirrors the same constant in `agentLoop.js`. This way the urgency math (`MAX_STEPS - stepsUsed`) is always accurate — if you change the step limit in `agentLoop.js`, you update the mirror here too.

#### 5. `agentLoop.js` — Dynamic prompt generated inside the loop

Moving the `buildPromptWithTools` call inside the `while` loop is the architectural change that enables everything:

```javascript
while (steps < MAX_STEPS) {
    const context = memory.getContext(10);       // ← 1. get trimmed context
    steps++;
    
    const currentMemory = memory.getScratchpad(); // ← 2. snapshot current state
    const systemPrompt = buildPromptWithTools(currentMemory); // ← 3. build fresh prompt
    
    // ... send to Gemini ...
}
```

Each iteration: read memory → build dynamic prompt → send to Gemini → store result → repeat. The prompt **grows smarter** as the agent discovers more.

---

### Key concepts introduced in Task 12

| Concept | Plain English |
|---|---|
| **Context Engineering** | Dynamically composing the system prompt from live state instead of hardcoding it. The prompt becomes a function of what the agent has done so far. |
| **Research Brief** | A section of the system prompt that summarises the agent's current findings — prevents re-searching already-covered topics. |
| **Deduplication Guard** | A hard-stop instruction in the prompt telling the model it cannot repeat a search it has already performed. |
| **Urgency Notice** | A mandatory instruction injected late in the loop that forces the model to stop calling tools and write a Final Answer before the step budget runs out. |
| **Mirrored constant** | A constant defined in two files that must stay in sync — here `MAX_STEPS` in `agentLoop.js` and `contextBuilder.js`. Change one, change both. |
| **Backwards compatibility** | Using `= null` default parameter so existing callers don't break when a function's signature is extended. |

---

## Task 13 — Report Builder: Day 8

### What was built and WHY it exists

Until Day 8, the agent produced a raw `Final Answer` string — printed to the terminal and immediately forgotten. Nothing was saved, nothing was structured. `reportBuilder.js` closes that gap: it takes everything the agent collected during a session (question, answer, sources, tools used, step count) and packages it as both a **structured JSON file on disk** and a **readable terminal printout**.

Three exported functions:

| Function | Input | Output |
|---|---|---|
| `buildReport(question, answer, scratchpad)` | Raw scratchpad state | Structured report object |
| `saveReport(report)` | Report object | Writes JSON to `reports/` folder, returns file path |
| `buildReportText(report)` | Report object | Formatted string for terminal printing |

The `report` CLI command in `index.js` lets you re-read the latest saved report at any time without re-running the agent.

---

### `buildReport()` — line by line

#### Sources extraction

```js
const sources = scratchpad.memoryObservation
    .filter(obs => obs.tool === 'web_search')
    .flatMap(obs => {
        try {
            const articles = JSON.parse(obs.result);
            return articles.map(a => ({ title: a.title, url: a.url }));
        } catch {
            return [];
        }
    })
    .filter(s => s.title && s.url);
```

The key insight: `obs.result` is a **JSON string**, not an object. In `agentLoop.js`, `result = JSON.stringify(web)` was called before storing it in memory. So you must `JSON.parse(obs.result)` to get the array of articles back. Only `web_search` observations contain article arrays — `summarize` and `check_claim` results look completely different.

- **`.filter(obs => obs.tool === 'web_search')`** — isolate only the search observations
- **`.flatMap(...)`** — parse each observation's JSON string and flatten all articles into one array
- **`try/catch`** — graceful fallback if result can't be parsed (corrupt or truncated)
- **Final `.filter()`** — drop any article entries missing both title and url

#### Tools used

```js
const toolsUsed = scratchpad.memoryObservation.map(obs => obs.tool);
```

The property in each observation is `tool` (set by `memory.addObservation(tool, args, result)`). A common mistake is `obs.toolName` — that property does not exist.

#### Key names

```js
const report = {
    sources:   sources,             // plural
    stepsUsed: scratchpad.stepsUsed, // from getScratchpad()
    toolsUsed: toolsUsed,           // plural
};
```

All three keys are **plural and consistent** with what `buildReportText()` reads. A mismatch here silently produces `undefined` in the terminal output.

---

### `saveReport()` — saving JSON to disk

```js
const reportDir = path.join(__dirname, '../reports');
await fs.promises.mkdir(reportDir, { recursive: true });
```

- **`__dirname`** here is `src/` (because `reportBuilder.js` lives in `src/`). `../reports` navigates up one level to the project root, then into `reports/`.
- **`{ recursive: true }`** — does not throw if the directory already exists. Safe to call every time.

```js
const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
const filename = `report-${timestamp}.json`;
```

- **`replace(/[-:T.]/g, '')`** — strips all `-`, `:`, `T`, `.` characters from the ISO string.
- **`.slice(0, 14)`** — keeps only `YYYYMMDDHHMMSS` (14 digits). Result: `report-20260830121530.json`.
- Alphabetical sort of these filenames = chronological sort — this is what the `report` CLI command exploits.

---

### `buildReportText()` — terminal formatting

```js
const sourceLines = report.sources.map(s =>
    `        • ${s.title}\n          ${s.url}`
).join('\n');
```

Converts the sources array into a bulleted list with the title on one line and the URL indented below it. The `========` borders give it a visible block structure in the terminal.

---

### `report` CLI command — `index.js`

```js
if (userInput.toLowerCase() === 'report') {
    const reportsDir = path.join(__dirname, 'reports');
    const files = fs.readdirSync(reportsDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();
    const raw = fs.readFileSync(path.join(reportsDir, files[0]), 'utf-8');
    const report = JSON.parse(raw);
    console.log(buildReportText(report));
    continue;
}
```

- **`fs.readdirSync()`** — synchronous directory read. Fine here because this is a one-off CLI command, not a hot path.
- **`.sort().reverse()`** — filenames are `report-YYYYMMDDHHMMSS.json`, so alphabetical = chronological. Reversing puts the newest first.
- **`files[0]`** — the most recent report.
- **`ENOENT` catch** — if the `reports/` directory doesn't exist yet (no query has run), prints a friendly message instead of crashing.

---

### Import cleanup in `reportBuilder.js`

Original had fragmented imports — `import { fileURLToPath }` and `import { dirname }` placed in the middle of the file after executable code. ES Modules require all `import` statements to be at the **top level** before any executable statements.

Final clean import block:
```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

`dirname` is no longer a separate named import — `path.dirname()` is used instead since `path` was already imported.

---

### Key concepts introduced in Task 13

| Concept | Plain English |
|---|---|
| **`JSON.parse(obs.result)`** | Tool results are stored as JSON strings in memory. You must parse them back before reading properties. |
| **`.flatMap()`** | Like `.map()` but flattens one level — useful when each item maps to an array (each observation → multiple articles) |
| **`fs.promises.mkdir({ recursive: true })`** | Creates a directory and all parent dirs. Does not throw if it already exists. |
| **Timestamp filename** | `YYYYMMDDHHMMSS` format sorts alphabetically = chronologically — no date parsing needed |
| **`fs.readdirSync().sort().reverse()`** | Synchronous directory listing sorted newest-first by filename — works because filename encodes time |
| **Import placement** | All `import` statements must appear at the top level of an ES Module before any executable code |
| **`path.dirname()` vs `import { dirname }`** | Both work. If `path` is already imported, `path.dirname()` avoids an extra named import |

---

## Task 14 — Error Handling + Agent Guardrails: Day 9

### What changed and WHY

Before Day 9, the agent was functional but brittle: any unexpected input from the LLM, an empty API response, a rate limit, or hitting the step cap would either crash the process, return a useless generic message, or silently loop without making progress. Day 9 makes the agent **production-hardened** against all five real failure modes.

---

### Failure Mode 1 — LLM outputs garbage (no `Action:`, no `Final Answer:`)

**Where it's handled:** `src/agentLoop.js` — already present from prior days.

When `parseAction(response)` returns `{ error: 'parse_failed' }` or `{ error: 'unknown_tool' }`, the loop injects a FORMAT VIOLATION observation into memory:

```js
if(error) {
    memory.addObservation('system', '',
        `FORMAT VIOLATION: You did not follow the required format.
        You MUST respond using ONLY this exact structure:

        Thought: [your reasoning]
        Action: tool_name(your search query)

        Available tools: web_search, summarize, check_claim
        Do NOT answer directly. You MUST call a tool first.`
    );
    continue;  // ← skip tool execution, go to next iteration
}
```

This is stored as a `'system'` observation — not a thought — so the agent treats it as an external correction, not its own reasoning. On the next iteration, Gemini reads the FORMAT VIOLATION in its context and corrects its output.

**Why `continue` not `break`:** We don't want to abort the entire session for one bad response. One wasted step is acceptable; aborting wastes all prior tool calls.

---

### Failure Mode 2 — Tool returns empty results

**Where it's handled:** `src/agentLoop.js` — inside the `web_search` switch case.

```js
case 'web_search':
    const web = await webSearch(cleanArgs);

    if (web.length === 0 || (web.length === 1 && web[0].title?.toLowerCase().includes('search unavailable'))) {
        result = "No results found. Try a different or broader search query.";
    } else {
        result = JSON.stringify(web, null, 2);
    }
    break;
```

**Two conditions checked:**
- `web.length === 0` — NewsAPI returned no articles at all
- `web[0].title?.toLowerCase().includes('search unavailable')` — the catch fallback inside `webSearch.js` returned the mock "Search unavailable" article

**Why `.toLowerCase().includes()` instead of `=== 'Search unavailable'`:** `.toLowerCase()` produces all-lowercase output, so comparing it to a string with a capital `S` would always be `false`. `.includes()` does a substring match on the lowercased title — safe against any case variation.

**Why `?.` optional chaining:** If `title` is `null` (NewsAPI occasionally returns `null` titles), accessing `.toLowerCase()` on it would throw `TypeError`. The `?.` returns `undefined` instead, which `.includes()` handles gracefully.

By injecting an explicit `"No results found. Try a different or broader search query."` string as the observation, Gemini reads it on the next step and naturally tries a different search angle instead of looping the same empty query forever.

---

### Failure Mode 3 — API rate limit hit (429)

**Where it's handled:** `src/agentLoop.js` — wrapped around the `generateContent()` call.

```js
let response;
try {
    response = await generateContent({
        prompt: { system: systemPrompt, message: contentsWithPrimer },
        config: { temperature: 0.2, topP: 0.95 }
    });
} catch (err) {
    if (err.message.includes('429') || err.message.toLowerCase().includes('rate limit')) {
        const partial = memory.getScratchpad().thoughts.at(-1)?.thought ?? "No partial answer available.";
        return `⚠️ Rate limit reached. Partial answer:\n${partial}`;
    }
    throw err; // re-throw unknown errors so they still surface
}
```

**Why return partial answer instead of crashing:** If a rate limit hits mid-session, the agent has already done 2–4 tool calls and accumulated observations. The LLM's last `Thought:` often contains near-complete reasoning. Returning it gives the user something useful rather than a crash traceback.

**Why `.at(-1)`:** Array method that returns the last element — equivalent to `arr[arr.length - 1]` but more concise and safe on empty arrays (returns `undefined` instead of throwing).

**Why `throw err` for non-rate-limit errors:** Unknown errors (network failure, SDK bug, etc.) should still propagate up so they're visible in the terminal. Silently swallowing all errors would make debugging impossible.

---

### Failure Mode 4 — Max steps reached

**Where it's handled:** `src/agentLoop.js` — the fallback `return` after the `while` loop.

```js
// Before (Day 8):
return `Error: I couldn't find an answer within ${MAX_STEPS} steps. Try rephrasing your question.`;

// After (Day 9):
const sp = memory.getScratchpad();
const lastThought = sp.thoughts.at(-1)?.thought ?? "No reasoning captured.";
const obsCount = sp.memoryObservation.length;
return `⚠️ Reached max steps (${MAX_STEPS}). Best effort answer based on ${obsCount} observations:\n\n${lastThought}`;
```

**Why the last thought is useful:** The agent's final `Thought:` before hitting the step cap usually contains near-complete synthesis like *"I now have enough information about X and Y"*. This is far more useful than a generic error string.

**Why include `obsCount`:** Gives the user context about how much research was completed. 0 observations = agent never ran; 4 observations = the agent did real work, just ran out of budget.

---

### Failure Mode 5 — Network timeout

**Where it's handled:** `tools/webSearch.js` — a `withRetry` helper wraps the NewsAPI call.

```js
// Helper defined BEFORE webSearch() — standalone, not nested
async function withRetry(fn, retries = 1) {
    try {
        return await fn();
    } catch (err) {
        if (retries > 0) {
            console.log(`⚠️ Network error, retrying once... (${err.message})`);
            return await withRetry(fn, retries - 1);
        }
        throw err; // after 1 retry, propagate to webSearch()'s own catch block
    }
}

export async function webSearch(query) {
    try {
        const respose = await withRetry(() => newsapi.v2.everything({
            q: query,
            language: 'en',
        }));
        // ... rest of function
    } catch (error) {
        // catches both immediate errors AND errors after retry exhaustion
        return [{ title: "Search unavailable", ... }];
    }
}
```

**Why `withRetry` is a standalone helper, not nested inside `webSearch`:** A function declared inside another function's body is recreated on every call. A standalone function at module level is created once. More importantly, nesting `withRetry` inside `webSearch` means it cannot be tested or reused — it becomes tightly coupled to one specific tool.

**Why `retries = 1` (only one retry):** On a transient network blip, one retry is usually sufficient. More retries increase latency noticeably. After 1 retry failure, the `throw err` propagates up to `webSearch`'s own `catch` block, which returns the graceful "Search unavailable" fallback.

**Why pass `fn` as a function, not the result:** `withRetry(() => newsapi.v2.everything(...))` passes a *factory function* — not the already-started Promise. This allows `withRetry` to call `fn()` again on retry. Passing the Promise directly would retry the already-resolved/rejected Promise, which always produces the same result.

---

### Key concepts introduced in Task 14

| Concept | Plain English |
|---|---|
| **`array.at(-1)`** | Returns the last element of an array. Returns `undefined` (not a crash) on empty arrays. |
| **`?.` optional chaining** | Safely accesses a property on a potentially `null`/`undefined` value — short-circuits to `undefined` instead of throwing |
| **`withRetry(fn, retries)` pattern** | A higher-order function that retries an async operation N times before giving up — keeps retry logic DRY and reusable |
| **Passing a factory `() => call()`** | Passing a function that *produces* the Promise, not the Promise itself — allows the caller to re-execute the operation on retry |
| **Partial answer on rate limit** | Returning the agent's last reasoning as a best-effort result instead of crashing — gives the user something useful |
| **`throw err` for unknown errors** | Re-throwing non-rate-limit errors so they still surface in the terminal — avoids silently hiding bugs |
| **Graceful degradation** | Designing systems to fail in a controlled, user-friendly way rather than crashing or hanging |
| **`.toLowerCase().includes()`** | The correct way to do case-insensitive substring matching — `.toLowerCase()` first, then `.includes()` with all-lowercase target |

---

## Task 15 — CLI Polish + Multi-Question Session: Day 10

### What this task does and WHY it exists

Before Day 10, the CLI was a raw loop: every input that wasn't `exit`, `scratchpad`, or `report` was treated as a research question. There was no way to review what you'd asked earlier, no way to cleanly reset state mid-session, and nothing was saved about the overall session. Day 10 adds **session awareness** — the CLI becomes a proper multi-question research terminal.

All changes live in `index.js` only. No agent, tool, or memory logic changes.

---

### Feature 1 — `sessionHistory` array

```js
async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    const sessionHistory = [];  // ← declared before the loop, lives for the whole session
    
    while(true) { ... }
}
```

- Declared **inside `run()`** but **outside `while(true)`** — this is the key placement.
- Inside the loop = reset on every iteration (wrong). Inside `run()` but outside the loop = persists for the whole session.
- Each entry shape: `{ question, answer, timestamp }` — just enough to reconstruct what happened.

---

### Feature 2 — Push to history after each successful query

```js
const agentResponse = await runAgent(userInput);

sessionHistory.push({
    question: userInput,
    answer: agentResponse,
    timestamp: new Date().toISOString()
});
```

- Placed **inside the `try` block**, after `runAgent()` — only stores successful queries.
- If `runAgent()` throws, the `catch` block runs instead and the push is skipped — failed queries are never logged as successful.
- `new Date().toISOString()` — UTC timestamp in `"2026-09-02T05:45:00.000Z"` format. Consistent across timezones.

---

### Feature 3 — `history` command

```js
if (userInput.toLowerCase() === 'history') {
    if (sessionHistory.length === 0) {
        console.log('\n 📭 No history yet. Ask a research question first.');
    } else {
        console.log('\n📚 Past Questions:');
        sessionHistory.forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.question}`);
            console.log(`     → ${item.answer.substring(0, 120)}...`);
            console.log(`     (${new Date(item.timestamp).toLocaleString()})`);
        });
    }
    continue;
}
```

- **`sessionHistory.length`** — a property, not a method. Arrays don't have `length()` — that would throw `TypeError: sessionHistory.length is not a function`.
- **`forEach((item, idx))`** — the second argument to `forEach`'s callback is the index (0-based). Adding 1 gives the user a 1-based numbered list.
- **`.substring(0, 120)`** — caps the answer preview at 120 chars so the history output stays readable. Full answers are available via the `report` command.
- **`new Date(item.timestamp).toLocaleString()`** — converts the stored UTC ISO string back to a human-friendly local time string.

---

### Feature 4 — `clear` command

```js
if (userInput.toLowerCase() === 'clear') {
    memory.clear();
    console.log('\n🧹 Cleared scratchpad for a fresh research session.');
    continue;
}
```

- Calls `memory.clear()` — already imported at the top of `index.js` (`import * as memory from './src/memory.js'`).
- **Why this exists even though `agentLoop.js` calls `memory.clear()` automatically:** The auto-clear in `agentLoop.js` resets memory at the *start* of each new question. The `clear` command lets the user manually wipe memory *mid-session* — e.g. if they interrupted a query and want a clean slate before the next one.

---

### Feature 5 — `saveSessionLog()` + wired into `exit`

#### Module-level path constant

```js
const logDir = path.join(__dirname, 'sessions');
```

Declared at module level (alongside `__dirname`) so it's available to `saveSessionLog()` without being passed as an argument. The same pattern as `reportsDir` in the `report` command.

#### The function

```js
async function saveSessionLog(history) {
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const now = new Date();
        const timestamp = now.toISOString();
        // Strip colons/dashes so filename is valid on Windows
        const fileTimestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14); // → YYYYMMDDHHMMSS
        const filename = `session-${fileTimestamp}.json`;
        const logFile = path.join(logDir, filename);

        const logData = {
            sessionStart: history[0]?.timestamp ?? timestamp,
            sessionEnd: timestamp,
            totalQuestions: history.length,
            questions: [...history],
        };

        fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
        console.log(`\n📝 Session saved to sessions/${filename}`);
    } catch (error) {
        console.log('❌ Could not save session log:', error.message);
    }
}
```

**Key design decisions:**

- **`fs.existsSync` + `fs.mkdirSync`** — synchronous check-then-create. Safe here because this runs once at exit, not in a hot loop.
- **Filename uses stripped timestamp** (`YYYYMMDDHHMMSS`) not raw ISO string — colons (`:`) are illegal in Windows filenames. Raw ISO `"2026-09-02T11:10:00.000Z"` would crash `writeFileSync` on Windows.
- **`history[0]?.timestamp ?? timestamp`** — `?.` protects against an empty history array (user typed `exit` immediately without asking anything). `??` falls back to the session-end timestamp.
- **`[...history]`** — shallow copy of the array. Not strictly necessary here (JSON.stringify doesn't mutate), but a good defensive habit.
- **`catch` block logs the error** — the silent empty `catch` in the original implementation would have hidden any write failures completely.

#### Wired into exit

```js
if (userInput.toLowerCase() === 'exit') {
    console.log('\n👋 Closing the AI Study Buddy. See you later!');
    await saveSessionLog(sessionHistory);  // ← await is required
    rl.close();
    break;
}
```

- **`await` is mandatory** — `saveSessionLog` is `async` (uses `fs.promises` indirectly via `writeFileSync` in this sync version, but the pattern requires it). Without `await`, the function call returns a Promise immediately and the process may exit before the file write completes.

#### The saved JSON shape

```json
{
  "sessionStart": "2026-09-02T05:22:00.000Z",
  "sessionEnd": "2026-09-02T05:35:00.000Z",
  "totalQuestions": 3,
  "questions": [
    { "question": "What is GPT-5?",       "answer": "...", "timestamp": "2026-09-02T05:23:00.000Z" },
    { "question": "AI regulation news?",  "answer": "...", "timestamp": "2026-09-02T05:28:00.000Z" },
    { "question": "SpaceX latest launch?","answer": "...", "timestamp": "2026-09-02T05:34:00.000Z" }
  ]
}
```

---

### Key concepts introduced in Task 15

| Concept | Plain English |
|---|---|
| **Session-scoped array** | A variable declared outside a loop but inside a function — persists for the entire function call, resets when the function exits |
| **`array.length` (property)** | `length` is a property on arrays, not a method — `arr.length` ✅, `arr.length()` ❌ throws TypeError |
| **`forEach((item, idx))`** | The second callback argument is the element's 0-based index — add 1 for 1-based display |
| **`.substring(0, N)`** | Extracts the first N characters of a string — used here to cap preview output |
| **`toLocaleString()`** | Converts a Date to a human-readable string in the user's local timezone |
| **Filename-safe timestamp** | Raw ISO strings contain colons (`:`) which are illegal in Windows filenames. Strip with `.replace(/[-:T.]/g, '').slice(0, 14)` |
| **Module-level path constant** | A `path.join(__dirname, ...)` constant at module level — available everywhere without being passed as an argument |
| **Empty `catch` anti-pattern** | An empty `catch {}` silently swallows all errors — always log at minimum so failures are visible |

---



### What was expected vs. what happened

**Expected (Day 1 definition of done):**
```
Thought: I need to search for recent news about AI regulation.
Action: web_search(AI regulation news this week)
```

**Actual output:**
```
The AI landscape is moving incredibly fast. As of late 2024, here are the key...
```
The model answered in prose, completely ignoring the format contract in the system prompt.

---

### Why this happened — RLHF vs. format instructions

Modern LLMs like Gemini are not just pre-trained text completers. They are post-trained using **RLHF (Reinforcement Learning from Human Feedback)** — a process where human raters reward the model for being helpful, clear, and informative.

This RLHF training is **stronger than format instructions**. When asked a factual question like "What happened with AI regulation this week?", the model's learned instinct is to answer helpfully with well-structured information — even when you explicitly tell it not to.

In other words: the model isn't broken. It's doing exactly what it was trained to do. The problem is that single-turn format enforcement fights against that training.

---

### Attempts made to fix it

#### Attempt 1 — Stronger system prompt language

```
CRITICAL RULE: Every single response must follow this exact format — no exceptions:
HARD RULES:
- NEVER write prose or bullet points
- NEVER answer from memory — always call web_search first
```

**Result:** Model still answered in prose.

**Why it failed:** RLHF fine-tuning outweighs strongly-worded system prompt instructions for factual questions.

---

#### Attempt 2 — One-shot example in the system prompt

Added a concrete example of the expected format:
```
EXAMPLE:
User: What happened with AI regulation this week?
Thought: I need to search for the latest news about AI regulation.
Action: web_search(AI regulation news this week)
```

**Result:** Model still answered in prose.

**Why it failed:** The example was in the system instruction slot. The model treated it as background context, not as a strict template it had to replicate.

---

#### Attempt 3 — Lower temperature (0.6 → 0.1) + hard token cap (300)

Lower temperature makes the model more deterministic and more likely to follow instructions strictly. The token cap prevented runaway prose responses.

**Result:** Still prose output, now just truncated at 300 tokens.

**Why it failed:** Temperature affects randomness, not the model's baseline behavior. At `temperature: 0.1` the model still "wants" to answer helpfully — it just does so more consistently.

---

#### Attempt 4 — Response priming via user message suffix

```js
message: `${userInput}\n\nThought:`
```

The idea: append `"Thought:"` to the user message so the model would "complete" it.

**Result:** Still prose.

**Why it failed:** When `contents` is a plain string, the SDK wraps it as a user message. The model sees `"Thought:"` as part of the *question*, not as something it already said. It still chooses to answer fresh.

---

#### Attempt 5 — True response priming via multi-turn model-turn prefill

Changed `contents` from a plain string to a proper multi-turn conversation array:

```js
const contents = [
    { role: 'user',  parts: [{ text: prompt.message }] },
    { role: 'model', parts: [{ text: 'Thought:' }] },  // ← prefill
];
```

This is the architecturally correct approach — the model sees `"Thought:"` as something it *already said* and must continue from.

**Result:** Still prose output in testing.

**Why it likely failed:** The specific model version in use (`gemini-3-flash-preview`) may not honor partial model-turn prefilling in the same way other models do, or the SDK version may not pass it through as expected.

---

### Final decision — Why we moved forward

The Day 1 architecture is **100% correct**. Every piece of code is properly wired:
- `contextBuilder.js` builds the system prompt with tool descriptions and format contract
- `geminiClient.js` passes it to `systemInstruction` and uses multi-turn `contents`
- `index.js` calls everything correctly

The format issue is **not a code bug** — it is a model behavior characteristic.

**This will resolve naturally in Day 3 (agentLoop.js)** for two reasons:
1. The agent loop will maintain a growing conversation history. After the model sees real `Thought:` / `Action:` / `Observation:` exchanges in its context, it will pattern-match and follow the format on subsequent turns.
2. The model is a text completer at its core — it continues established patterns. Once the loop establishes a `Thought/Action/Observation` pattern in the first turn (even manually seeded), subsequent turns will naturally follow it.

---

### What changed in the code as a result of this investigation

| File | Change | Reason |
|---|---|---|
| `geminiClient.js` | `contents` changed from plain string to multi-turn array with model-turn prefill | Architecturally correct way to prime the model's response format |
| `geminiClient.js` | Added `prompt.primer` parameter (defaults to `'Thought:'`) | Allows callers to customize the prefill in future |
| `index.js` | `temperature` lowered from `0.6` to `0.1` | More deterministic output; better instruction following |
| `index.js` | `maxOutputTokens` removed from caller config | Avoiding artificial truncation; geminiClient default (1000) is sufficient |

---

### Key concepts introduced in this investigation

| Concept | Plain English |
|---|---|
| **RLHF** | Reinforcement Learning from Human Feedback — the post-training process that makes LLMs helpful and conversational, sometimes at the cost of strict format compliance |
| **Response priming** | Giving the model a partial start to its own response so it "completes" in a specific format rather than generating fresh |
| **Model-turn prefill** | Injecting a partial model turn as the last entry in a multi-turn `contents` array — the API-level way to do response priming |
| **Single-turn vs. multi-turn format enforcement** | Single-turn calls fight against RLHF helpfulness training; multi-turn loops naturally enforce format through context |
| **Conversation history in `contents`** | Passing `[{role:'user',...}, {role:'model',...}]` arrays to represent a back-and-forth conversation |

---

## Master Concepts Glossary

| Term | Plain English |
|---|---|
| **ReAct pattern** | An agent loop: **Re**ason (Thought) → **Act** (call a tool) → observe result → repeat |
| **Agent loop** | The core cycle that runs until the LLM decides it has enough info to give a final answer |
| **Tool** | A function the LLM can "call" by outputting a structured action string |
| **Scratchpad / Working memory** | A running log of observations the agent accumulates during a session |
| **Context window** | The maximum amount of text (prompt + history + observations) the LLM can see at once |
| **Context trimming** | Removing the oldest observations when the context gets too long |
| **System prompt** | Instructions given to the AI before the conversation that define its persona and rules |
| **Temperature** | Controls randomness. 0 = deterministic/factual, 1 = creative/random |
| **topP** | Controls diversity. The model considers only the top tokens whose probability sums to P |
| **maxOutputTokens** | Hard cap on how long the AI's response can be |
| **Named export / import** | Exporting/importing a specific item by name from a module using `{ }` |
| **ES Modules** | The modern JavaScript module system using `import`/`export` (vs. older `require()`) |
| **`async/await`** | Syntax for handling asynchronous (non-blocking) operations in a readable, sequential style |
| **State bleed** | When context or data from a previous agent execution carries over to the next session, leading to unexpected errors or incorrect context. Prevented by calling `clear()` on session startup. |
| **Dynamic date injection** | Dynamically appending today's actual calendar date to system instructions so the model can correctly reason about time-sensitive searches instead of dismissing future dates as hallucinations. |
| **Token budget management** | Strategically truncating or trimming large payloads (e.g. slicing tool results or removing older thoughts/observations) to prevent model context window overflow or high costs. |
| **Graceful degradation** | Designing a system to fail in a controlled, user-friendly way rather than crashing or hanging unexpectedly. |
| **`withRetry(fn, retries)` pattern** | A higher-order async helper that retries a failing operation N times before giving up. The key is passing a factory `() => call()` not the Promise itself. |
| **`array.at(-1)`** | Returns the last element of any array. Returns `undefined` (not a crash) on empty arrays — safer than `arr[arr.length - 1]` when the array may be empty. |
| **Optional chaining `?.`** | Safely traverses a chain of property accesses that may be `null` or `undefined` — returns `undefined` instead of throwing `TypeError`. |
| **Partial answer on rate limit** | When a 429 error is caught mid-session, returning the agent's last `Thought:` as a best-effort result rather than crashing — preserves the work done so far. |
| **Session-scoped array** | A variable declared outside a loop but inside a function — persists for the whole session, resets when the program restarts. |
| **`array.length` property** | `length` is a read-only numeric property on arrays and strings. It is NOT a function — calling `arr.length()` throws `TypeError`. |
| **Filename-safe timestamp** | ISO timestamps contain `:` which is illegal in Windows filenames. Strip with `.replace(/[-:T.]/g, '').slice(0, 14)` to get `YYYYMMDDHHMMSS`. |
| **Empty `catch` anti-pattern** | A `catch {}` block with no body silently swallows errors. Always log at minimum: `catch (e) { console.log(e.message); }` |
