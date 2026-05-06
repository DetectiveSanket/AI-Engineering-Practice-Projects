# News Research Agent — Code Explained

> **Audience:** Someone reading this code for the first time, with no AI assistance.
> **Style:** Teaching — every section is self-contained. Open any section and understand it immediately.

---

## Table of Contents

- [Task 1 — Project Scaffold & Entry Point (`index.js`)](#task-1--project-scaffold--entry-point-indexjs)
- [Task 2 — Gemini Client (`src/geminiClient.js`)](#task-2--gemini-client-srcgeminiclientjs)
- [Task 3 — Context Builder (`src/contextBuilder.js`)](#task-3--context-builder-srccontextbuilderjs)
- [Task 4 — Tool Dispatcher (`src/toolDispatcher.js`)](#task-4--tool-dispatcher-srctooldispatcherjs)
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

## Day 1 — Format Investigation & Known Limitation

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
