# News Research Agent — Code Explained

> **Audience:** Someone reading this code for the first time, with no AI assistance.
> **Style:** Teaching — every section is self-contained. Open any section and understand it immediately.

---

## Table of Contents

- [Task 1 — Project Scaffold & Entry Point (`index.js`)](#task-1--project-scaffold--entry-point-indexjs)
- [Task 2 — Gemini Client (`src/geminiClient.js`)](#task-2--gemini-client-srcgeminiclientjs)
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
const response = await client.models.generateContent({
    model: model,
    systemInstruction: prompt.system,
    contents: prompt.message,
    config: {
        temperature: config.temperature ?? 0.6,
        topP: config.topP ?? 0.95,
        maxOutputTokens: config.maxTokens ?? 800,
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
