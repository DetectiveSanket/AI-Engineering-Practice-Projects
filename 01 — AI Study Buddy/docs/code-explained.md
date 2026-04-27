# AI Study Buddy — Code Reference Guide

> **Purpose:** This file explains every line of code in this project — why it was written, what it does, and common mistakes a beginner might make. It will grow as the project grows.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [File: `src/geminiClient.js`](#file-srcgeminiclientjs)
3. [File: `index.js` — Day 1 (Single Question)](#file-indexjs--day-1-single-question)
4. [File: `index.js` — Day 2 (CLI Input Loop)](#file-indexjs--day-2-cli-input-loop)
5. [File: `src/promptBuilder.js` — Day 3 (Prompt Templates)](#file-srcpromptbuilderjs--day-3-prompt-templates)
6. [File: `src/explain.js` — Day 4 (The Specialist)](#file-srcexplainjs--day-4-the-specialist)
7. [File: `src/params.js` — Day 4 (Parameter Experimenter)](#file-srcparamsjs--day-4-parameter-experimenter)
8. [Decision Log: Routing Problem and Interactive Menu](#decision-log-routing-problem-and-interactive-menu)
9. [Bugs We Fixed (and Why)](#bugs-we-fixed-and-why)
10. [Concepts Glossary](#concepts-glossary)

---

## Project Structure

```
01 — AI Study Buddy/
├── .env                  ← Your secret API key lives here. NEVER commit this to Git.
├── index.js              ← The "Boss". Manages the CLI loop and delegates tasks.
├── package.json          ← Lists your project's name, dependencies, and scripts.
├── src/
│   ├── geminiClient.js   ← The "Engine Room". All AI setup and communication logic lives here.
│   ├── promptBuilder.js  ← The "Speech Writer". Builds professional prompts from raw topics.
│   └── explain.js        ← The "Specialist". Handles the logic for explaining concepts.
└── docs/
    └── code-explained.md ← This file!
```

**Why do we separate files?**
Instead of putting all the code in one huge file, we split it by responsibility:
- `geminiClient.js` handles **"How do I talk to Google's AI?"**
- `index.js` handles **"What do I want to say to the AI?"**

This is called **Separation of Concerns** — a core principle of professional software development.

---

## File: `src/geminiClient.js`

This is the **Engine Room** of your project. It handles all the boring but critical setup:
authenticating with Google, loading your secret key, and providing a clean function that
any other file can call to get an AI response.

### The Complete File (Current State)

```javascript
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function generateContent({ model = 'gemini-3-flash-preview', prompt, config = {} }) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }

        const response = await client.models.generateContent({
            model: model,
            contents: prompt,
            generationConfig: {
                temperature: config.temperature ?? 0.7,
                topP: config.topP ?? 0.95,
                maxOutputTokens: config.maxTokens ?? 2048,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw error;
    }
}

export default client;
```

---

### Line-by-Line Breakdown

---

#### `import { GoogleGenAI } from "@google/genai";`

**What it does:** Pulls the `GoogleGenAI` class from a library called `@google/genai`
that you installed with `npm install @google/genai`.

**Why we use it:** This is the "Phone" to call Google's AI servers. Without it, Node.js
has no idea how to speak to the Gemini API.

**Why `GoogleGenAI` and not `createClient`?**
Both come from the same `@google/genai` library, but:
- `createClient` is a newer factory function — NOT available in all versions.
- `GoogleGenAI` is the stable Class that works reliably across versions.
- We tried `createClient` first and got: `SyntaxError: does not provide an export named 'createClient'`.
- **Lesson:** Always check your library's version before copying code from the internet.

**Beginner Mistake:** Writing `import GoogleGenAI from "@google/genai"` (without curly braces `{}`).
Curly braces mean you are pulling out a **named export**. Without them, you get the **default export**,
which is something else entirely, and your code silently breaks.

---

#### `import { config } from "dotenv";`

**What it does:** Imports the `config` function from the `dotenv` library.

**Why we use it:** Your API key is a secret — you should NEVER hardcode secrets directly in your code
(e.g., `apiKey: "AIzaSy..."` is WRONG and dangerous). Instead, you put secrets in a `.env` file,
and `dotenv` reads that file, making the values available via `process.env`.

**How it works conceptually:**
```
.env file:  GEMINI_API_KEY=your-secret-key-here
                  ↓ dotenv reads this
process.env.GEMINI_API_KEY → "your-secret-key-here"
```

---

#### `import { fileURLToPath } from "url";`
#### `import { dirname, join } from "path";`

**What these do:** These are built-in Node.js tools for working with file paths.

| Tool | What it does |
|---|---|
| `fileURLToPath` | Converts a URL like `file:///d:/project/src/geminiClient.js` into a normal path `d:\project\src\geminiClient.js` |
| `dirname` | Gets the folder containing a file. `dirname("d:\src\file.js")` → `"d:\src"` |
| `join` | Safely glues path parts together. `join("d:\src", "..", ".env")` → `"d:\.env"` |

**Why we need them:** When using ES Modules (`import/export` syntax), the classic `__dirname`
variable is NOT available automatically. These three tools let us recreate it safely.

---

#### `const __filename = fileURLToPath(import.meta.url);`

**What it does:** Gets the full file path of the *current file* (`geminiClient.js`).
`import.meta.url` gives a URL like `file:///d:/project/src/geminiClient.js`.
`fileURLToPath` converts that into a usable Windows path.

**Result:** `__filename` = `"d:\AI Engineering Practice Projects\01 — AI Study Buddy\src\geminiClient.js"`

---

#### `const __dirname = dirname(__filename);`

**What it does:** Gets the *folder* that contains the current file.

**Result:** `__dirname` = `"d:\AI Engineering Practice Projects\01 — AI Study Buddy\src"`

---

#### `config({ path: join(__dirname, "..", ".env") });`

**What it does:** Tells `dotenv` exactly where to find the `.env` file and loads it.

**Breaking it down:**
- `__dirname` → the `src` folder
- `".."` → go UP one level to the project root
- `".env"` → the file to open

**Full resolved path:** `d:\AI Engineering Practice Projects\01 — AI Study Buddy\.env`

**Why `".."` is there:**
`geminiClient.js` lives inside `src/`, but the `.env` file is in the root folder.
Without `".."`, the code looked for `.env` inside `src/`, found nothing, and failed with:
`GEMINI_API_KEY is missing in .env file` — **this was a real bug we fixed!**

**Beginner Mistake:** Putting your `.env` file in the wrong folder, or calling `config()` *after*
you try to use `process.env`. Always call `config()` first, before anything else.

---

#### `const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`

**What it does:** Creates an authenticated connection object to Google's AI services.

**Why `new`?** `GoogleGenAI` is a **Class** (a blueprint). The `new` keyword builds an actual
*instance* from that blueprint — like taking a car blueprint and building a real car from it.

**Why `process.env.GEMINI_API_KEY`?** After `dotenv` loads your `.env` file, the secret key
is available at `process.env.GEMINI_API_KEY`. The key is never written directly in the code.

---

#### `export async function generateContent({ model = 'gemini-3-flash-preview', prompt, config = {} }) {`

This one line does several things. Let's break each part:

**`export`** — Makes this function available to other files. Without `export`, only this file
can use the function. Other files would get `undefined` when they try to import it.

**`async`** — Marks the function as asynchronous. Calling Google's servers takes time (a network
request), so the function needs to be able to "wait" without freezing the whole program.

**`function generateContent`** — The name of this function.

**`{ model, prompt, config }`** — This is **Destructuring**. Instead of:
```javascript
function generateContent(options) {
    const model = options.model;
    const prompt = options.prompt;
}
```
We pull everything out in one step: `function generateContent({ model, prompt, config })`.

**Default values explained:**

| Parameter | Default | Meaning |
|---|---|---|
| `model = 'gemini-3-flash-preview'` | If not provided, use this model | You don't have to specify the model every single call |
| `prompt` | No default — required | There's no point calling the AI without a question |
| `config = {}` | Empty object | Prevents a crash if no config is passed |

**Why `config = {}`?**
If you call `generateContent({ prompt: "Hello" })`, the `config` argument is `undefined`.
If the code then tries `config.temperature`, it crashes: "Cannot read properties of undefined."
Setting `config = {}` means it becomes an empty object, and reading `.temperature` from
an empty object safely returns `undefined` instead of crashing.

---

#### `if (!process.env.GEMINI_API_KEY) { throw new Error(...) }`

**What it does:** A safety check before making any API call.

**Why `!`?** The exclamation mark means "NOT". So `!process.env.GEMINI_API_KEY` means
"if the key does NOT exist."

**Why `throw`?** `throw` creates an error and immediately stops the function. The `catch` block
below catches it and shows a clear, readable message instead of a confusing Google API error.

---

#### `const response = await client.models.generateContent({ ... })`

**What it does:** The actual call to Google's AI servers.

**Why `await`?** Because this is an `async` function, we can use `await`. It tells JavaScript:
"Pause here. Wait for Google to send a reply. Then continue." Without `await`, the code would
sprint forward immediately, and `response` would be a Promise object — not the actual text.

**The object we pass in:**

| Key | Value | Meaning |
|---|---|---|
| `model` | `'gemini-3-flash-preview'` | Which AI model to use |
| `contents` | `prompt` | What you're asking the AI |
| `generationConfig` | Object of "knobs" | How the AI should behave |

---

#### `temperature: config.temperature ?? 0.7`

**What it means:** "Use the temperature the caller passed. If they didn't pass one, use 0.7."

**`??` (Nullish Coalescing Operator):** Returns the right side only if the left side is `null`
or `undefined`. It does NOT trigger on `0` or `false`, unlike the `||` operator.

**Temperature Guide:**

| Range | Behavior | Use For |
|---|---|---|
| `0.1 – 0.4` | Precise, predictable | Code generation, factual Q&A |
| `0.5 – 0.7` | Balanced | General answers, summaries |
| `0.8 – 1.0` | Creative, varied | Poetry, brainstorming, creative writing |

---

#### `topP: config.topP ?? 0.95`

**What it means:** "Use the topP the caller passed, or default to 0.95."

**What is `topP`?** When the AI picks the next word, it ranks all possible words by probability.
`topP = 0.95` means: "Only choose from words that together account for 95% of the probability."

**Analogy:** Picking a song from a playlist:
- `topP = 0.1` → Only pick from the 3 most popular songs (very safe, predictable)
- `topP = 0.95` → Pick from almost anything on the playlist (more natural and varied)

---

#### `maxOutputTokens: config.maxTokens ?? 2048`

**What it means:** "Limit the AI's response to this many tokens, defaulting to 2048."

**What is a token?** AI models don't see "words" — they see "tokens" (chunks of characters).
Roughly: `1000 tokens ≈ 750 words`.

**Why limit it?**
1. **Cost/Quota:** APIs charge by tokens. Limits prevent unexpected huge bills.
2. **Relevance:** A shorter limit forces the AI to be concise.

---

#### `return response.text;`

**What it does:** Extracts just the text string from the response object and returns it.

**Why `response.text` and NOT `response.text()`?**
This is subtle but critical:
- `response.text` → A **property**. It's already a string. Just read it.
- `response.text()` → Calling it as a **function**. In this version of the SDK, calling
  it as a function returns `undefined`.

**This was a real bug we hit.** Output was `undefined` until we changed `response.text()` to
`response.text`. The lesson: always `console.log(response)` to see the raw object when
something unexpected happens — it will show you exactly what properties are available.

---

#### `} catch (error) { console.error(...); throw error; }`

**What it does:** Catches any error that happens inside the `try` block.

**Why `throw error` again after logging it?**
After logging, we re-throw the error so the *caller* also knows something went wrong.
If we didn't re-throw, the error would be silently absorbed here, and the caller would
receive `undefined` with no idea why.

---

#### `export default client;`

**What it does:** Makes the raw `client` object (the full Gemini connection) available for import.

**Why export BOTH the function AND the client?**
- `export function generateContent` = **The pre-made meal.** 95% of the time, other files just
  want to ask the AI a question. This function handles all the complexity for them.
- `export default client` = **The full kitchen.** For advanced use cases — uploading files,
  listing models, text embeddings — you need the raw client. Exporting it means any file can
  access the full power of Gemini without setting up the API key again.

---

## File: `index.js` — Day 1 (Single Question)

This was the **first version** of the entry point — it asked one hardcoded question and exited.
It is kept here for reference so you can see how the code evolved.

### The Complete File (Day 1 State)

```javascript
import { generateContent } from './src/geminiClient.js'

async function run() {
    const prompt = 'Give me 5 tips for time management';
    console.log("🚀 AI Study Buddy is waking up...");

    try {
        const response = await generateContent({
            prompt: prompt,
            config: { temperature: 0.5, maxTokens: 100 }
        });

        console.log("\n--- AI Explanation ---");
        console.log(response);
        console.log("----------------------");

    } catch (error) {
        console.error('Error generating content: ', error.message);
    }
}

run();
```

**Problem with this version:** The prompt is hardcoded. Every time you run the app, it asks
the same thing. There is no way for a user to type their own question. This is why we upgraded
to the CLI Input Loop in Day 2.

---

## File: `index.js` — Day 2 (CLI Input Loop)

This was the **Day 2 version**. The app stays open, waits for the user to type any topic,
calls the AI with raw `userInput` text, prints the answer, and loops back.

### The Complete File (Current State)

```javascript
import { generateContent } from './src/geminiClient.js'
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    while (true) {
        const userInput = await rl.question("\n📚 Enter a topic to study: ");

        if (userInput.toLowerCase() === 'exit') {
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }

        try {
            console.log("🤔 Thinking...");

            const response = await generateContent({
                prompt: userInput,
                config: { temperature: 0.7 }
            });

            console.log("🤖 ----- AI Study Buddy: ------ ");
            console.log(response);
            console.log("----------------------");

        } catch (error) {
            console.error("❌ Error:", error.message);
        }
    }
}

run();

rl.on("close", () => {
    console.log("\n👋 Closing the AI Study Buddy. See you later!");
    process.exit(0);
});
```

---

### Line-by-Line Breakdown

---

#### `import * as readline from 'node:readline/promises';`

**What it does:** Imports the entire `readline/promises` module from Node.js's built-in library.

**Why `node:readline/promises` and not just `readline`?**
- `readline` (old) uses **Callbacks** — an older, messier pattern where you pass a function
  to be called when input arrives. This leads to "Callback Hell" — deeply nested code.
- `readline/promises` (modern) uses **Promises/await** — it plays nicely with `async/await`
  and makes the code look clean and sequential.
- The `node:` prefix is a modern Node.js convention that explicitly says: "This is a built-in
  module, not an npm package." It prevents confusion if someone creates an npm package
  with the same name.

**Why `import * as readline`?**
The `readline/promises` module does not have a default export. `import * as readline` means:
"Import everything it exports and put it all under one object called `readline`." This lets
us call `readline.createInterface()`.

---

#### `import { stdin as input, stdout as output } from 'node:process';`

**What it does:** Imports `stdin` (keyboard) and `stdout` (screen) from Node.js's `process`
object and renames them to `input` and `output` for clarity.

**What are `stdin` and `stdout`?**
- `stdin` = **Standard Input** = the keyboard stream. Node.js listens here for what you type.
- `stdout` = **Standard Output** = the screen/terminal stream. Node.js prints here.

**Why rename them `as input` and `as output`?**
Pure readability. When you later write `readline.createInterface({ input, output })`, it reads
like plain English: "Create an interface with input and output." Writing `{ stdin, stdout }`
would also work but is slightly less clear.

**Beginner Mistake:** Forgetting to import `stdin`/`stdout` and trying to use `readline` without
connecting it to the terminal. The interface wouldn't know where to read from or write to.

---

#### `const rl = readline.createInterface({ input, output });`

**What it does:** Creates the `rl` (readline) object — the "Ear" of your application.

**Why outside the `run()` function?**
The interface is created **once** and lives for the entire life of the program. If you created
it inside `run()`, a new interface would be created on every call, which could cause memory
leaks and conflicting listeners.

**What does `{ input, output }` mean here?**
This is JavaScript **shorthand property notation**. It is equivalent to:
`readline.createInterface({ input: input, output: output })`
Since the variable name and the property name are the same, you can write it once.

---

#### `while (true) { ... }`

**What it does:** Creates an infinite loop that keeps the app running until we explicitly `break`
out of it.

**Why `while (true)` and not a `for` loop?**
A `for` loop is used when you know how many times to repeat (e.g., 10 times).
A `while (true)` loop is used when you want to repeat **until a condition is met** — in this
case, until the user types "exit". We don't know how many questions the user will ask.

**Why is this safe?**
It's safe because we have two exit mechanisms inside the loop:
1. The `if (userInput === 'exit')` check with `break`.
2. `Ctrl+C` which triggers the `rl.on("close")` event.
Without at least one of these, the app would run forever and consume your CPU.

---

#### `const userInput = await rl.question("\n📚 Enter a topic to study: ");`

**What it does:** Displays the prompt text in the terminal and **pauses** the code until the
user types something and presses Enter. The typed text is stored in `userInput`.

**Why `await`?** Keyboard input is asynchronous — the program doesn't know when the user will
finish typing. `await` tells JavaScript: "Pause right here and do nothing until the user presses
Enter. Then continue with whatever they typed."

**Beginner Mistake:** Forgetting `await` before `rl.question(...)`. Without it:
- `userInput` would be a **Promise** object, not a string.
- The loop would sprint through without waiting, resulting in infinite questions being printed
  instantly with no chance for the user to type anything.

**What is `"\n"`?** The `\n` is a **newline character** — it moves the cursor to a new line
before printing the prompt. It creates visual spacing between the AI's answer and the next question.

---

#### `if (userInput.toLowerCase() === 'exit') { rl.close(); break; }`

**What it does:** Checks if the user typed "exit" (in any casing), closes the interface,
and breaks out of the `while` loop.

**Why `.toLowerCase()`?**
Without it, the check would be case-sensitive. `"EXIT"` or `"Exit"` would NOT match `'exit'`
and the app would not quit. `.toLowerCase()` converts any variation to lowercase first,
so `"EXIT"`, `"Exit"`, `"eXiT"` all become `"exit"` before comparison.

**Why `rl.close()` before `break`?**
Order matters here:
1. `rl.close()` — tells the readline interface to stop listening and release the terminal.
   This also triggers the `rl.on("close")` event handler at the bottom of the file.
2. `break` — exits the `while` loop and allows `run()` to finish.
If you only used `break` without `rl.close()`, the interface would still be open, keeping
the process alive even after the loop ends.

---

#### `const response = await generateContent({ prompt: userInput, config: { temperature: 0.7 } })`

**What it does:** Passes the user's typed question directly to the AI and waits for a response.

**The key change from Day 1:**
Day 1 used a hardcoded string: `prompt: 'Give me 5 tips for time management'`.
Day 2 uses the live input: `prompt: userInput`.
This one change is what turns a "demo script" into an actual "interactive app."

**Why `temperature: 0.7` (up from 0.5)?**
We want slightly more creative and varied answers since the user can now ask about anything —
not just one fixed topic. A balanced-to-creative setting gives more natural-feeling responses.

---

#### `rl.on("close", () => { process.exit(0); });`

**What it does:** Registers a listener for the `"close"` event on the readline interface.
When `rl` is closed (by `rl.close()` OR by the user pressing `Ctrl+C`), this function runs.

**Why is this necessary?**
Without this, pressing `Ctrl+C` might leave the terminal in a bad state or the process might
hang. This ensures a **graceful shutdown** — the app cleans up and exits properly.

**Why `process.exit(0)`?**
- `process.exit()` is a Node.js command that forcefully terminates the process.
- The `0` is the **exit code**. It means "success — nothing went wrong."
- If you used `process.exit(1)`, it would signal "something went wrong" (useful for scripts
  running in CI/CD pipelines that check for errors).

**Why is this outside the `run()` function?**
The `rl` object is defined at the top level (outside `run()`). Its event listener must also
be registered at the same level. Think of it as: the `rl` object is the "security guard"
at the door — you set up the guard when you open the building, not inside individual rooms.

---

## Bugs We Fixed (and Why)

| # | Bug | Error Message | Root Cause | Fix Applied |
|---|---|---|---|---|
| 1 | Wrong import name | `SyntaxError: 'createClient' not exported` | `createClient` doesn't exist in this library version | Changed to `new GoogleGenAI(...)` |
| 2 | `.env` not found | `GEMINI_API_KEY is missing` | `geminiClient.js` is in `src/`, but `.env` is in the root | Added `".."` to path: `join(__dirname, "..", ".env")` |
| 3 | Response was `undefined` | Output printed `undefined` | `response.text()` was called as a function, but it is a property | Changed `response.text()` to `response.text` |
| 4 | Importing a folder | Module not found | `import from './src'` points to a folder, not a file | Changed to `'./src/geminiClient.js'` |

---

## Concepts Glossary

| Term | Simple Explanation |
|---|---|
| `import` / `export` | The way modern JavaScript files share code with each other |
| `async` / `await` | A way to wait for slow operations (like network calls) without freezing the program |
| `process.env` | A place Node.js stores environment variables — secrets loaded from `.env` |
| `try / catch` | "Try this code. If it crashes, catch the error instead of stopping the whole program." |
| `??` (Nullish Coalescing) | "Use the left value, but if it's null/undefined, use the right as a backup" |
| `new ClassName()` | Creates an instance (real object) from a Class (blueprint) |
| `throw` | Deliberately causes an error, stopping the current function and passing it to `catch` |
| Token | A chunk of text (~0.75 words) that AI models use to measure input/output size |
| Temperature | Controls AI creativity. Low (0.1–0.4) = predictable. High (0.8–1.0) = creative. |
| topP | Controls word diversity. Lower = safer choices. Higher = more varied language. |
| maxOutputTokens | The maximum length of the AI's response |
| Destructuring | Pulling values from an object in one step: `const { a, b } = obj` |
| Named Export | `export function foo()` — imported with curly braces: `import { foo }` |
| Default Export | `export default x` — imported without curly braces: `import x from '...'` |
| Separation of Concerns | Keeping each file focused on one responsibility (e.g., setup vs. usage) |

---

| `while (true)` | An infinite loop that keeps running until you explicitly `break` out of it |
| `stdin` | Standard Input — the keyboard stream Node.js reads from |
| `stdout` | Standard Output — the terminal screen Node.js writes to |
| `rl.question()` | Prints a prompt and waits for user to type a line, returning a Promise |
| `rl.close()` | Closes the readline interface and triggers the `"close"` event |
| `process.exit(0)` | Terminates the Node.js process. `0` = success, `1` = error |
| `import * as X` | Imports everything from a module and bundles it under one object name `X` |
| `as` (in import) | Renames an import for clarity: `import { stdin as input }` |
| Zero-Shot Prompting | Giving the AI a task with no examples. It relies solely on its training knowledge |
| Output Formatting | Instructing the AI to return a specific structure (e.g., JSON) instead of free-form text |
| Chain-of-Thought (CoT) | Telling the AI to "think step-by-step" to improve accuracy on complex topics |
| System Instruction | A permanent rule given to the AI before the conversation starts. Separate from the user message |
| Prompt Template | A reusable function that wraps a raw topic into a full, structured AI prompt |
| Sync function | A regular function that runs immediately and returns a value directly (no waiting) |
| Async function | A function that can `await` slow operations. Only needed when doing I/O (network, file, DB) |
| `{ system, message }` | A prompt object pattern: `system` = AI's permanent role, `message` = the specific user task |
| `systemInstruction` | The Gemini SDK parameter that sets the AI's permanent behavior for the whole session |
| Three-Layer Architecture | User input → Prompt Builder → AI Engine. Each layer has one responsibility |
| Specialist/Employee Pattern | Moving feature-specific logic into its own file (e.g., `explain.js`) |
| Boss/Main Pattern | The entry point (`index.js`) that coordinates which specialists to call |
| Delegation | Passing a task from one function/file to another specialist file |
| Feature Module | A file that handles one specific feature (like "Explanations" or "Quizzes") |
| Breaking Change | A code update that changes how a function works, requiring all callers to be updated |
| Defensive Coding | Using `try/catch` in the main loop even if the specialist already has one |

---

## File: `src/explain.js` — Day 4 (The Specialist)

This file is a **Specialist**. It has one job: Take a topic, get an explanation from the AI, and
show it to the user. 

### The Complete File (Current State)

```javascript
import { generateContent } from './geminiClient.js';
import { buildExplainPrompt } from './promptBuilder.js';

export async function runExplainFlow(topic) {
    try {
        console.log("\n🤔 Thinking about: " + topic + "...");

        const response = await generateContent({
            prompt: buildExplainPrompt(topic),
            config: { temperature: 0.7 }
        });

        console.log("\n🤖 ----- AI Study Buddy: ------ ");
        console.log(response);
        console.log("-------------------------------\n");
        
    } catch (error) {
        console.error("❌ Explanation Error:", error.message);
    }
}
```

---

### Line-by-Line Breakdown

#### `export async function runExplainFlow(topic) { ... }`

**Why `export`?** So that `index.js` can "hire" this specialist and run the flow.
**Why `async`?** Because it calls `generateContent`, which is an asynchronous API call.

---

#### `try { ... } catch (error) { ... }`

**Why here and not just in index.js?**
By having a `try/catch` inside the specialist, you keep the specialist **autonomous**. 
If the AI call fails, the specialist handles the error by printing a friendly "❌ Explanation Error".
This prevents the error from "crashing up" into the main loop if we don't want it to.

---

#### `console.log("\n🤔 Thinking about: " + topic + "...");`

**Why include UI logs here?** 
In a modular design, the specialist should manage its own "user experience."
`index.js` shouldn't have to know that a "Thinking" emoji needs to be shown.
`index.js` just says "Start the flow," and the specialist handles the rest.

---

## File: `index.js` — Day 4 Update (The Boss)

**What changed:** `index.js` was stripped down to its bare essentials. It no longer knows 
*how* to explain a concept; it only knows *who* to call.

### The Complete File (Current State)

```javascript
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runExplainFlow } from './src/explain.js';

const rl = readline.createInterface({ input, output });

async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    while (true) {
        const userInput = await rl.question("\n📚 Enter a topic to study (or type 'exit'): ");

        if (userInput.toLowerCase() === 'exit') {
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }

        try {
            // THE BOSS DELEGATES: "Go handle this topic, specialist."
            await runExplainFlow(userInput);
        } catch (error) {
            console.error("❌ Main Loop Error:", error.message);
        }
    }
}

run();

rl.on("close", () => {
    process.exit(0);
});
```

---

### Line-by-Line Breakdown

#### `import { runExplainFlow } from './src/explain.js';`

**The "Import" Shift:** We no longer import `geminiClient` or `promptBuilder` here. 
`index.js` doesn't need them anymore! This is **Separation of Concerns**. 
The "Boss" only needs to know the specialists, not the tools the specialists use.

---

#### `await runExplainFlow(userInput);`

**Delegation in action:** This one line replaces about 15 lines of old code. 
It sends the `userInput` to the specialist (explain.js) and waits for them to finish.

**Why still use `try/catch` here?**
This is called **Defensive Coding**. Even though `runExplainFlow` has its own `try/catch`, 
this outer block protects against errors that might happen *before* the specialist starts 
(like an import failing or a computer memory issue). It's the "Ultimate Safety Net."

---

*Last updated: 2026-04-25. This file grows as the project grows.*

---

## File: `src/params.js` — Day 4 (Parameter Experimenter)

This specialist's job is to call the Gemini API **three separate times** for the same topic,
each time using a different configuration (Temperature, TopP). The goal is to visually show
you how AI parameters change the quality and creativity of the output.

### The Complete File (Current State)

```javascript
import { generateContent } from './geminiClient.js';
import { buildExplainPrompt } from './promptBuilder.js';

export async function runParamExperiment(topic) {
    try {
        console.log('\n🤔 Thinking about: ' + topic + "...");

        const responseA = await generateContent({
            prompt: buildExplainPrompt(topic),
            config: { temperature: 0.1 }
        });

        console.log('\n🤔 Thinking about (Temp 0.9): ' + topic + "...");

        const responseB = await generateContent({
            prompt: buildExplainPrompt(topic),
            config: { temperature: 0.9 }
        });

        console.log('\n🤔 Thinking about (Temp 0.7, TopP 0.5): ' + topic + "...");

        const responseC = await generateContent({
            prompt: buildExplainPrompt(topic),
            config: { temperature: 0.7, topP: 0.5 }
        });

        console.log("\n🤖 ----- AI Study Buddy Answer : ------ ");
        console.log("Temperature: 0.1 (Strict/Robotic)");
        console.log(responseA);
        console.log("-------------------------------\n");

        console.log("Temperature: 0.9 (Highly Creative)");
        console.log(responseB);
        console.log("-------------------------------\n");

        console.log("Temperature: 0.7, TopP: 0.5 (Constrained Creativity)");
        console.log(responseC);
        console.log("-------------------------------\n");

    } catch(error) {
        console.error('❌ Error: ', error.message);
    }
}
```

---

### Line-by-Line Breakdown

#### Why is the same prompt (`buildExplainPrompt`) used for all three calls?

This is the key principle of a **controlled experiment**. In science, when you want to measure
the effect of one variable, you must keep all other variables the same.

*   **Wrong approach:** Use a different prompt for each call. Now you don't know if the difference
    in output was caused by the temperature OR by the prompt changing. Two variables changed.
*   **Correct approach:** Keep the prompt identical for all 3 calls. The only changing variable
    is the temperature/topP setting. You can now see clearly what each configuration does.

---

#### Why NOT use `Promise.all` to run all 3 at the same time?

**I was stuck on this question.** My first instinct was to run all 3 simultaneously to save time.

The answer: On the free API tier, sending 3 simultaneous requests can trigger a **429 Rate Limit
error** (Too Many Requests). By using sequential `await` calls (one after the other), each request
waits for the previous one to finish before starting. This is safer and more reliable.

Think of it like ordering 3 meals at once vs. one at a time. If the kitchen is busy, ordering all
3 at once can overwhelm it. Sequential ordering is slower but guaranteed to work.

---

#### What does each config actually produce?

| Config | Temperature | TopP | Effect |
|---|---|---|---|
| A | 0.1 | 0.95 (default) | Very robotic, predictable, safe. Almost the same every time. |
| B | 0.9 | 0.95 (default) | Very creative, varied vocabulary, may go off-topic slightly. |
| C | 0.7 | 0.5 | Moderately creative but vocabulary is constrained (only top 50%). |

---

## Decision Log: Routing Problem and Interactive Menu

This section captures a key design decision made during Day 4 development. It is written so
that when you come back to this file in the future, you can see exactly what the problem was,
how you thought about it, and why you chose the solution you did.

---

### 🚧 The Problem I Was Stuck On

After the app had two specialists (`runExplainFlow` and `runParamExperiment`), the question was:

> *"If I type a topic like 'JavaScript', how do I decide whether to explain it or experiment
> with it? The app always runs the same function regardless of what I want."*

The original "command-based" router looked like this:
```javascript
if (userInput.startsWith('compare ')) {
    // Extract topic
    await runParamExperiment(topic);
} else {
    await runExplainFlow(userInput);
}
```

**What was wrong with this?** 
If I typed `JavaScript`, the app always went to `runExplainFlow`. If I then wanted to experiment
with the same topic (`JavaScript`), I had to re-type `compare JavaScript`. This felt clunky because
the user had to decide the action *before* typing the topic.

---

### 💡 Two Solutions I Considered

**Solution A: Interactive Menu (what we built)**
*   You type the topic first.
*   The app then pauses and shows a menu (1. Explain / 2. Compare).
*   You choose the action *after* seeing your own topic.
*   *Best for:* Students who want to be guided step by step.

**Solution B: Mode Switcher**
*   You type `/mode experiment` to flip a global setting.
*   Every topic you type after that goes to the experimenter.
*   You type `/mode explain` to switch back.
*   *Best for:* Power users doing bulk testing.

**I chose Solution A** because the goal is a Study Buddy app for students, not a developer tool.

---

### ✅ How I Implemented It (The 2-Step Loop)

I changed the `while` loop from 1-step to 2-step:

```javascript
// BEFORE (1-step, command-based):
const userInput = await rl.question("Enter a topic: ");
// Router checked the text of userInput itself for 'compare '

// AFTER (2-step, menu-based):
// Step 1: capture topic
const userInput = await rl.question("Enter a topic: ");

// Step 2: show menu, capture choice separately
const choice = await rl.question("Choose:\n 1. Explain\n 2. Compare\n Choice: ");

// Route based on CHOICE, not the topic text
if (choice === '2') {
    await runParamExperiment(userInput);
} else {
    await runExplainFlow(userInput);
}
```

**The Key Insight:** The topic and the action are now two separate variables. The user types
their topic first (without any special syntax), then independently chooses what to do with it.

---

### 📝 Line-by-Line Explanation of the New Router

#### `const choice = await rl.question("Choose an action: ...");`

This is the **second** `rl.question` call inside the loop. The `while` loop now pauses here
and waits for the user to type 1 or 2. 

**Why does this work?** `rl.question` is just like a form input on a website. You can ask
multiple questions one after the other. The user answers each and presses Enter to continue.

---

#### `if (choice === '2') { ... }`

**Why `=== '2'` and not `=== 2`?**
This is a critical beginner mistake. `rl.question` always returns a **string**, not a number.
When the user types `2` and presses Enter, your variable is the string `"2"`, not the integer `2`.
*   `"2" === 2` → `false` (different types, strict equality fails)
*   `"2" === '2'` → `true` (both are strings)
Always compare against a string (single or double quotes) when routing on user input.

---

#### Future-proofing: The commented-out `quiz` block

```javascript
// else if (choice === '3') {
//     await runQuizFlow(userInput);
// }
```

This is **commented out** intentionally. It is a placeholder showing exactly where Quiz Mode
will plug in when we build `quiz.js`. When you read this file in the future, you can see:
1.  The Quiz feature was planned from the start.
2.  You know exactly where to uncomment and add the import.
3.  The `else` at the bottom acts as the safe default for any invalid choice.

---

### 🔧 Bug Fixed: 503 Model Unavailable Error

**What happened:** When testing `params.js`, the app crashed with:
```
Gemini API Error: {"code":503, "message":"This model is currently experiencing high demand..."}
```

**Why it happened:** The project was using `gemini-3-flash-preview`, which is an **experimental
preview model**. Preview models are not guaranteed to be available and often get overloaded
because many developers are testing them simultaneously.

**The Fix:** Changed the default model in `geminiClient.js` to `gemini-2.0-flash`:

```javascript
// BEFORE:
export async function generateContent({ model = 'gemini-3-flash-preview', ... })

// AFTER:
export async function generateContent({ model = 'gemini-2.0-flash', ... })
```

**Rule of Thumb:** For production or learning projects, always use a stable, non-preview model.
Preview/experimental models are fine for testing new features but not for reliable apps.

---

### ✅ Final `index.js` (Current State — End of Day 4)

```javascript
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runExplainFlow } from './src/explain.js';
import { runParamExperiment } from './src/params.js';

const rl = readline.createInterface({ input, output });

async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    while (true) {
        // Step 1: Ask for the topic
        const userInput = await rl.question("\n📚 Enter a topic to study (or type 'exit'): ");

        // Handle Exit
        if (userInput.toLowerCase() === 'exit') {
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }

        // Step 2: Show the action menu
        const choice = await rl.question("Choose an action: \n 1. Explain \n 2. Compare \n Choice: ");

        // Step 3: Route to the correct specialist
        try {
            if (choice === '2') {
                await runParamExperiment(userInput);
            }
            // else if (choice === '3') {
            //     await runQuizFlow(userInput);   <- Quiz coming soon!
            // }
            else {
                await runExplainFlow(userInput);
            }
        } catch (error) {
            console.error("❌ Main Loop Error:", error.message);
        }
    }
}

run();

rl.on("close", () => {
    process.exit(0);
});
```

---

| `Promise.all` | Runs multiple async tasks at the same time (parallel). Use with caution on free API tiers. |
| `Promise.allSettled` | Like `Promise.all` but waits for ALL to finish even if some fail |
| Sequential `await` | Running async calls one at a time. Slower but safer and easier to debug |
| Interactive Menu | A CLI pattern where the app asks the user follow-up questions to choose an action |
| `startsWith()` | String method that checks if a string begins with a specific prefix |
| `substring(n)` | Returns a new string starting from index `n`, removing the first `n` characters |
| `=== '2'` vs `=== 2` | String comparison vs number comparison. `rl.question` always returns a string |
| 503 Error | "Service Unavailable" — the server is overloaded. Common with preview/experimental models |
| Rate Limit (429) | Too many requests in a short time. Free API tiers have limits on calls per minute |
| Preview Model | An experimental model version. Not production-stable, often overloaded |
| Stable Model | A production-ready model version. Recommended for apps and learning projects |

---

*Last updated: 2026-04-25. This file grows as the project grows.*

---

## File: `src/quiz.js` — Day 5 (The Quiz Game)

This specialist has two jobs:
1.  **`generateQuiz(topic)`** — calls the Gemini API with a strict JSON-only prompt and parses the response into a usable JavaScript object.
2.  **`runQuizFlow(topic, rl)`** — takes that parsed object and runs an interactive one-question-at-a-time game loop in the terminal.

### The Complete File (Current State)

```javascript
import { generateContent } from './geminiClient.js';
import { buildQuizPrompt } from './promptBuilder.js';

export async function generateQuiz(topic) {
    try {
        const response = await generateContent({
            prompt: buildQuizPrompt(topic),
            config: {
                temperature: 0.2,
                maxTokens: 450
            }
        });

        // Bulletproof JSON Extraction
        const targetIndex = response.indexOf('"questions"');

        if (targetIndex === -1) {
            console.error("\n[DEBUG] AI failed to output questions. Raw response:\n", response);
            throw new Error("AI response did not contain the 'questions' array.");
        }

        const start = response.lastIndexOf('{', targetIndex);
        const end = response.lastIndexOf('}');

        if (start === -1 || end === -1) {
            throw new Error("AI response did not contain valid JSON brackets.");
        }

        const jsonString = response.substring(start, end + 1);

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("\n[DEBUG] The AI generated invalid JSON:\n", jsonString);
            throw new Error(`JSON Parsing crashed: ${parseError.message}`);
        }

        console.log('✅ Quiz Generated! Here are your questions:');
        return data;

    } catch(error) {
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
}

export async function runQuizFlow(topic, rl) {
    console.log(`🧠 Generating a ${topic} Quiz for you...`);
    const quiz = await generateQuiz(topic);
    const questions = quiz.questions;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        console.log(`\n--- Question ${i + 1} of ${questions.length} ---`);
        console.log(q.question);
        console.log(`A. ${q.options.A}`);
        console.log(`B. ${q.options.B}`);
        console.log(`C. ${q.options.C}`);
        console.log(`D. ${q.options.D}`);

        const answer = await rl.question('\nYour answer (A-D): ');

        if (answer.toUpperCase() === q.answer.toUpperCase()) {
            console.log('\n✅ Correct!\n');
        } else {
            console.log(`\n❌ Wrong! The correct answer was ${q.answer}. ${q.options[q.answer]}\n`);
        }
    }

    console.log('\n🎉 Quiz finished! Well done.\n');
}
```

---

## Decision Log: Day 5 — Errors Encountered and How They Were Fixed

This section documents the real debugging journey of Day 5. When you read this
in the future, you will see exactly what went wrong, why it went wrong, and
what the correct fix was. These are not beginner mistakes — they are the same
problems every professional developer faces when working with LLM APIs.

---

### 🚧 Error 1 — "topic is not a function"

**Type:** Hidden Syntax Error (SyntaxError at runtime, disguised as a wrong error message)

**What we saw in the terminal:**
```
❌ Main Loop Error: Failed to generate quiz: topic is not a function
```

**Why it happened:**
In `promptBuilder.js`, the `buildQuizPrompt` function used backtick characters
inside a template literal (backtick string). This broke the string early:

```javascript
// BROKEN:
system: `
    Important: "Do not include markdown backticks like ` ` `` json"
`
```

JavaScript reads the first backtick inside the string as the end of the whole
template literal. Everything after it was broken JavaScript syntax. When the
SDK received the broken prompt object, it could not call the function correctly,
which produced the misleading "is not a function" error.

**How we fixed it:**
Replaced the literal backticks inside the string with single-quoted equivalents
so they did not conflict with the outer template literal delimiters.

**Lesson:** When you see a runtime error that says something "is not a function"
but you know it IS a function, the real problem is almost always something
syntactically broken nearby that is corrupting the data before it reaches the
function call.

---

### 🚧 Error 2 — "response.text is not a function" / "topic is not a function" (Redux)

**Type:** Wrong method call on a string (TypeError)

**What we saw in the terminal:**
```
❌ Main Loop Error: Failed to generate quiz: topic is not a function
```

**Why it happened:**
In `geminiClient.js`, the `generateContent` function already calls `response.text`
and returns the raw string. But in `quiz.js`, the code tried to call `.text()`
again on that string:

```javascript
// geminiClient.js already does this:
return response.text;  // returns a plain string

// quiz.js was doing this — WRONG:
let text = await response.text();  // calling .text() on a string!
```

A plain JavaScript string does not have a `.text()` method. Calling a method
that does not exist on a value produces a `TypeError`. Because this happened
inside the `catch` block which rethrows with a new error message, the original
error message got swallowed.

**How we fixed it:**
Removed the second `.text()` call in `quiz.js`. Since `generateContent` already
returns a string, we use it directly: `let text = response;`

**Lesson:** When data passes through multiple functions, trace what type it is at
every step. A string is not a Response object. Always check what the function you
are calling actually returns.

---

### 🚧 Error 3 — "Unexpected token 'O', 'Okay, let…'" (JSON SyntaxError)

**Type:** JSON.parse failure on conversational text

**What we saw in the terminal:**
```
❌ Main Loop Error: Failed to generate quiz: Unexpected token 'O', "Okay, let'"... is not valid JSON
```

**Why it happened:**
Even though we asked the AI for "JSON only", the experimental model (`gemini-3-flash-preview`)
added conversational text before the JSON:

```
Okay, let's create a quiz for you! {"questions": [...]}
```

`JSON.parse()` is extremely strict. It expects to start reading a `{` or `[`
immediately. The letter "O" from "Okay" is not valid JSON, so it crashes
instantly.

**How we fixed it:**
We implemented **targeted JSON extraction** using `response.indexOf('"questions"')`
to find where the actual data starts, then `lastIndexOf('{', targetIndex)` to
search backwards for the opening bracket that belongs to the quiz object.
This surgically extracts just the JSON and ignores any text before or after it.

**Lesson:** Never trust an LLM to return perfectly formatted data. Always extract
the target data defensively from the string rather than passing the whole
response to `JSON.parse`.

---

### 🚧 Error 4 — "Unexpected non-whitespace character after JSON at position 2"

**Type:** JSON.parse failure due to multiple JSON objects in the response

**What we saw in the terminal:**
```
❌ Main Loop Error: Failed to generate quiz: Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)
```

**Why it happened:**
The experimental model was "stuttering" — it sometimes outputs an empty `{}`
before the real data:

```
{} {"questions": [...]}
```

Our original extraction looked for the FIRST `{`, which found the empty one.
It extracted `{} {"questions"...}`. When `JSON.parse` successfully parsed
the empty `{}` at position 0, it encountered the SECOND `{` at position 2 and
panicked because there was non-whitespace after a complete JSON object.

**How we fixed it:**
Changed the extraction strategy to search backwards from the keyword `"questions"`:

```javascript
const targetIndex = response.indexOf('"questions"');  // find the data keyword
const start = response.lastIndexOf('{', targetIndex); // find ITS opening bracket
const end = response.lastIndexOf('}');
```

By anchoring to the word `"questions"` and searching backwards from it, we
bypass any empty brackets or garbage before the real JSON object.

**Lesson:** `response.lastIndexOf('{', somePosition)` is a very useful pattern
when dealing with AI output. It means: "find the last `{` that appears BEFORE
this position." This guarantees you grab the bracket that belongs to the data
you care about, not any stutter brackets before it.

---

### 🚧 Error 5 — "AI response did not contain the 'questions' array" (Root Cause)

**Type:** The model completely ignoring the system instruction

**What we saw in the terminal:**
```
[DEBUG] AI failed to output questions. Raw response:
 Here's a 3-question quiz on C++, covering fundamental concepts...

❌ Main Loop Error: Failed to generate quiz: AI response did not contain the 'questions' array.
```

**Why it happened:**
This was the most important bug of Day 5. The prompt was split into two parts:
-  `system` (systemInstruction): "You are a JSON-only API..."
-  `message` (contents): "Generate a 3-question quiz on: C++"

The experimental model (`gemini-3-flash-preview`) was **ignoring the systemInstruction
field entirely** and only reading the `message`. The message sounded like a friendly
study request, so the model generated a beautiful markdown quiz — completely ignoring
the JSON requirement.

**How we fixed it:**
Moved the ENTIRE instruction — including the JSON-only requirement and the complete
template example — into the `message` field where the model always reads it.
We also used a "priming" technique: the message ends with the exact JSON structure
we expect, forcing the model to fill it in with real content rather than generate
a prose answer.

```javascript
message: `Generate EXACTLY 3 multiple-choice quiz questions about "${topic}".

Rules:
- Return ONLY a raw JSON object. No markdown. No backticks. No explanation. No greeting.
- Each question must have 4 options labeled A, B, C, D.

Use this exact structure:
{"questions":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A"}, ...]}`
```

**Lesson:** For experimental models, treat `systemInstruction` as unreliable.
Put your most important constraints (especially output format requirements) directly
in the `message`/`contents` where you know the model reads it. The "JSON template
at the end of the message" technique is a well-known prompt engineering pattern
called **few-shot formatting** or **output priming**.

---

### 🚧 Error 6 — The "Two Bosses" Problem (rl.createInterface conflict)

**Type:** Logic Bug — duplicate readline interface

**What would happen at runtime:**
If two `readline.createInterface` instances both listen to `process.stdin`,
Node.js gets confused about which one should receive keyboard input. The result
is unpredictable: sometimes input is swallowed, sometimes the app freezes.

**Why it happened:**
`quiz.js` created its own `rl` instance to ask the user for answers. But
`index.js` already had an `rl` instance managing the main loop. You cannot have
two bosses fighting over the keyboard at the same time.

**How we fixed it:**
Pass the existing `rl` from `index.js` down into `runQuizFlow` as a parameter:

```javascript
// index.js:
await runQuizFlow(userInput, rl);  // pass the Boss's rl down

// quiz.js:
export async function runQuizFlow(topic, rl) {  // accept it as a parameter
    const answer = await rl.question('Your answer: ');  // use the same rl
}
```

**Lesson:** In any application that uses a shared resource (keyboard, file handle,
database connection), only one part of the code should own that resource. Pass it
down to the functions that need it rather than creating a new one in each function.
This is called the **Single Owner** or **Dependency Injection** pattern.

---

### 🚧 Error 7 — The "All Questions at Once" Scope Bug

**Type:** Logic Bug — the `for` loop printed all questions before asking for any answer

**What would happen at runtime:**
All 3 questions printed immediately to the terminal. Then, because `rl.question`
and the `if/else` check were OUTSIDE the `for` loop, the variable `q` no longer
existed when the code tried to check `q.answer`. Result: `ReferenceError: q is
not defined`.

**How we fixed it:**
Moved the `rl.question` and the answer-checking `if/else` block INSIDE the `for`
loop's curly braces `{ }`. This means: for every iteration, print the question,
wait for the answer, check it, and only THEN advance to the next question.

```javascript
for (let i = 0; i < questions.length; i++) {
    const q = questions[i];       // q exists here
    console.log(q.question);      // show question
    const answer = await rl.question('Answer: '); // wait for user
    if (answer === q.answer) { ... }  // q still exists here
}
// q is gone after the loop — correctly scoped
```

**Lesson:** Variable scope in `for` loops is one of the most common beginner bugs.
Always ask: "Is the variable I am using still alive at this line?" `q` only exists
inside the loop body `{ }`. The moment you step outside those braces, `q` is gone.

---

### ✅ Final Architecture — End of Day 5

At the end of Day 5, the app has three working modes:

| User Input | Mode | Specialist Called |
|---|---|---|
| Type topic → choose 1 | Explain | `runExplainFlow(topic)` |
| Type topic → choose 2 | Compare | `runParamExperiment(topic)` |
| Type topic → choose 3 | Quiz | `runQuizFlow(topic, rl)` |

The quiz game loop:
1. Calls `generateQuiz(topic)` to get parsed JSON data.
2. Iterates through `data.questions` one at a time.
3. Waits for the user to type A, B, C, or D.
4. Immediately tells the user if they are right or wrong.
5. Moves to the next question until all are done.
6. Prints "🎉 Quiz finished!" to signal completion.

---

| New Term | Meaning |
|---|---|
| Syntax Error | Code that JavaScript cannot read at all, like a broken string or missing bracket |
| TypeError | Calling a method that doesn't exist on a value (e.g., `.text()` on a string) |
| JSON.parse() | Built-in JS function that converts a JSON string into a JavaScript object |
| Priming | Ending your prompt with the start of the expected output to guide the model |
| Few-shot formatting | Showing the model an example of exactly what output format you want |
| systemInstruction | A field in the Gemini SDK that sets the model's "personality" — unreliable on experimental models |
| contents | The user message field in the Gemini SDK — the model ALWAYS reads this |
| Dependency Injection | Passing a shared resource (like `rl`) into a function rather than creating a new one |
| Single Owner Pattern | Only one part of the code controls a shared resource, preventing conflicts |
| Scope | The region of code where a variable is alive and accessible |

---

*Last updated: 2026-04-26. This file grows as the project grows.*

---

## Week 2 — Strategies + Chain of Thought (CoT)

Week 1 was about **"What to ask"** (Prompt Engineering). Week 2 is about **"How the AI thinks"** — the mechanical process the model uses to generate each word. Understanding this transforms you from a user of the API into an engineer who can control the quality, style, and creativity of every response.

---

## Day 6 — Generation Strategies: The Theory

### What Day 6 Was About

Day 6 had one goal: understand the **three generation mentalities** before writing a single line of code. These are not abstract academic concepts — they are the exact settings you can tune in the `generationConfig` object you already use in `geminiClient.js`.

---

### The Core Concept: Next Token Prediction

An LLM does not write a sentence all at once. It predicts the next word (called a "token") one step at a time. For every step, the model looks at every word in its vocabulary and assigns a **probability score** to each one.

For example, after the prompt "The cat sat on the..." the model might compute:
- **mat:** 80%
- **floor:** 10%
- **pizza:** 2%
- **table:** 1%
- *(everything else):* remaining %

The **generation strategy** is the rule we use to pick which word actually gets printed.

---

### The Three Controls

#### Temperature — The "Randomness Knob"
Once a shortlist of words has been decided, Temperature controls how boldly the AI picks from it.

- **Temperature = 0 (or near 0):** The AI always picks the #1 most likely word. Safe, grounded, deterministic. Use this for facts, formulas, code.
- **Temperature = 0.5:** A balanced middle ground. Sensible but not boring.
- **Temperature > 0.5:** The AI gives lower-ranked words a real chance of being chosen. This produces creative, varied, sometimes surprising output.
- **Temperature = 1.0+:** Very high randomness. Use with caution — the AI can produce poetic but also incoherent results.

**In code:**
```javascript
generationConfig: { temperature: 0.8 }
```

---

#### Top-K — The "Shortlist" Filter
Before Temperature even kicks in, Top-K **removes most words from consideration**.

- If **K = 5**, the AI looks at its vocabulary of 100,000+ words and **discards everything except the top 5** most likely options. Temperature then picks from those 5.
- **Purpose:** Prevents completely insane or "hallucinated" word choices.
- **K = 1** is exactly Greedy Search — only one option, no randomness possible.

**In code:**
```javascript
generationConfig: { topK: 40 }
```

---

#### Top-P (Nucleus Sampling) — The "Confidence" Filter
Top-P is a smarter, dynamic version of Top-K. Instead of a fixed number, it keeps adding words to the shortlist until their combined probability reaches **P%**.

- If **P = 0.9 (90%)** and the word "Water" alone is already 91% likely, only "Water" is in the shortlist.
- But if 100 words each have a 1% chance, Top-P adds all 90 of them (until it reaches 90%).
- **Purpose:** The shortlist grows when the AI is unsure and shrinks when it is confident. This is more adaptive than a fixed K.

**In code:**
```javascript
generationConfig: { topP: 0.95 }
```

---

### The Three Strategies

#### 1. Greedy (The Strict Robot)
**Rule:** Always pick the single word with the highest probability. No randomness.

- **Temperature:** 0 (or ~0.1)
- **TopP:** 1.0 (no filtering needed, we always take #1)
- **Result:** Very fast and logical but can repeat itself or sound robotic.

**Example prompt:** *"The sunrise over the city was..."*
**Greedy output:** `"beautiful."` — short, safe, predictable.

---

#### 2. Sampling (The Creative Artist)
**Rule:** Use Temperature, Top-K, and Top-P together to introduce controlled randomness.

- **Temperature:** 0.8–0.9
- **TopP:** 0.9
- **Result:** Varied, human-sounding, creative. The same prompt gives different results every time.

**Example prompt:** *"The sunrise over the city was..."*
**Sampling output:** `"spectacular, painting the skyline in molten gold as the trains sighed beneath."` — rich, alive, surprising.

---

#### 3. Beam Search (The Chess Player)
**Rule:** Don't just look at the next word — keep 3 different "paths" (beams) open and compare which complete sentence turns out best.

- **Gemini API:** Does not expose Beam Search directly.
- **How we simulate it:** We make 3 parallel API calls and then use a "quality referee" (a heuristic like picking the longest, most detailed response) to choose the winner.
- **Result:** High-quality, polished text that feels well-planned.

**Example prompt:** *"The sunrise over the city was..."*
**Beam Search (3 candidates):**
1. `"breathtaking."`
2. `"a quiet revelation."`
3. `"a warm, blazing spectacle."`

The referee picks #3 — the most detailed and descriptive one.

---

### Why This Matters for Our Project

| Situation | Best Strategy | Why |
|---|---|---|
| Student asks for a Math formula | Greedy (Temp ~0) | Don't want creative math |
| Student asks for a story to remember history | Sampling (Temp 0.8) | Creative language helps memory |
| Student asks for a "best explanation" | Beam Simulation | Quality over diversity |

---

### Day 6 Status: ✅ Theory Complete

Day 6 goal was "understand these strategies mentally." That goal is complete. No code was written — this was intentionally a reading and understanding day. The code implementation begins in Day 7.

---

| New Term | Meaning |
|---|---|
| Token | A single word or word-piece the model predicts one step at a time |
| Temperature | Controls randomness. Low = safe and focused. High = creative and varied |
| Top-K | Limits the word pool to the K most likely candidates before picking |
| Top-P | Dynamically limits the word pool until cumulative probability reaches P |
| Greedy Search | Always pick the #1 most likely next token — deterministic and fast |
| Sampling | Pick randomly from the Top-K/Top-P shortlist — creative and varied |
| Beam Search | Run multiple "paths" in parallel and pick the best complete sentence |
| Nucleus Sampling | Another name for Top-P sampling |
| Heuristic | A practical "good enough" rule used to make a decision (e.g., pick the longest response) |
| Promise.all() | A JavaScript tool to run multiple async tasks at the same time |

---

## Day 7 — Strategies Module: The Implementation Plan

### What Day 7 Is About

Day 6 was theory. Day 7 is action. We will create `src/strategies.js` — a new specialist that runs the same prompt through all three strategies at the same time and displays the results side by side.

### File to Create: `src/strategies.js`

**Function:** `compareStrategies(topic)`

This function will:
1. Build one single prompt for the given topic.
2. Fire three separate `generateContent` calls simultaneously using `Promise.all()`.
3. Each call uses a different `generationConfig` (Greedy, Sampling, Diverse).
4. Print all three responses labeled and side by side in the terminal.

---

### The Three Configurations

| Strategy | Temperature | TopP | Personality |
|---|---|---|---|
| Strategy 1 — Greedy | 0.1 | 1.0 | Grounded, factual, no risk |
| Strategy 2 — Sampling | 0.8 | 0.9 | Creative, balanced, human |
| Strategy 3 — Diverse | 1.0 | 0.7 | Very diverse, wide vocabulary |

---

### New Concept: `Promise.all()` 

**The problem it solves:** If we call Strategy 1, wait for it, then call Strategy 2, wait, then call Strategy 3 — the user waits 3× longer than necessary.

**What `Promise.all()` does:** It fires all three calls at the exact same moment and waits for all of them to finish together. The total wait time is the same as the slowest single call, not the sum of all three.

**Mental model:** 
- Without `Promise.all()`: Like sending three letters by post, one at a time. 
- With `Promise.all()`: Like sending all three letters in the same post-box drop.

```javascript
// Instead of this (slow — sequential):
const r1 = await call1();
const r2 = await call2();
const r3 = await call3();

// We do this (fast — parallel):
const [r1, r2, r3] = await Promise.all([call1(), call2(), call3()]);
```

---

### Router Update Plan

A new option will be added to the `index.js` menu:

```
Choose an action:
 1. Explain
 2. Compare
 3. Quiz
 4. Strategy Comparison   ← NEW
 Choice:
```

When the user picks 4, it will call `compareStrategies(topic)` from `strategies.js`.

---

### Day 7 Checklist

- [ ] Create `src/strategies.js`
- [ ] Write `compareStrategies(topic)` function
- [ ] Define 3 config objects (Greedy, Sampling, Diverse)
- [ ] Use `Promise.all()` to run all 3 calls in parallel
- [ ] Format and print labeled comparison output
- [ ] Update `index.js` router to add option 4

---

*Last updated: 2026-04-27. This file grows as the project grows.*
