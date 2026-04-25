import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runExplainFlow } from './src/explain.js';

const rl = readline.createInterface({ input, output });

async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    while (true) {
        // 1. Ask the user for a topic
        const userInput = await rl.question("\n📚 Enter a topic to study (or type 'exit'): ");

        // 2. Handle Exit
        if (userInput.toLowerCase() === 'exit') {
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }

        // 3. Delegate to Specialists
        try {
            // Currently, every input triggers an explanation
            // In the future, we will add 'quiz' or 'compare' logic here
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


//  we can give specific instructions to the AI model for a tailored response, use lower temperature (0.1-0.4) for deterministic and precise responses, use higher temperature (0.7-1.0) for creative and diverse responses, for factual accuracy and code generation, use lower temperature, for content creation, poetry, and creative writing, use higher temperature.


// const rl = readline.createInterface({ input, output }); //  readline.createInterface is used to create an interface for reading and writing data from the command line , it is a constructor for the readline module , it takes an object with input and output as properties , the input and output are streams , the input stream is the standard input stream , the output stream is the standard output stream 


/* 
    new task:
    ├── explain.js         ← plain-text explanation flow
    ├── quiz.js            ← JSON-forced quiz generation
    ├── params.js          ← parameter experiment runner


    * explain.js
    goal: structured prompt -> simple text explanation

    ### Day 4 — Parameter experimenter (S4, params.js)
    Goal: See how temperature and top_p change the output.

    Tasks:
    - [ ] Write params.js — function runParamExperiment(topic)
    - [ ] Call Gemini 3 times for same topic with different configs:
    - Config A: temperature 0.1 (deterministic)
    - Config B: temperature 0.9 (creative)
    - Config C: temperature 0.7, topP 0.5 (constrained)
    - [ ] Print all 3 outputs side by side with labels
    - [ ] Add a "compare" command to CLI: type "compare recursion" to trigger this



*/