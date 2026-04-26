import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runExplainFlow } from './src/explain.js';
import {runParamExperiment} from './src/params.js';
import { generateQuiz, runQuizFlow } from './src/quiz.js';


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

        //3. check the user choice for answer;
        const choice = await rl.question("Choose an action: \n 1. Explain \n 2. Compare \n 3. Quiz \n Choice: ");

        // 4. Delegate to Specialists (The Router)
        try {

            // await runExplainFlow(userInput);
            // await runParamExperiment(userInput);

            // if user wants to compare: 
            if (choice === '2') {
                await runParamExperiment(userInput);
            }

            // if user wants a quiz
            else if(choice === '3') {
                await runQuizFlow(userInput , rl);
            }

            // Default fallback: Explain
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


/* 
    new task:
    ├── explain.js         ← plain-text explanation flow - done
    ├── quiz.js            ← JSON-forced quiz generation - done
    ├── params.js          ← parameter experiment runner


    ### Day 5 — Quiz generator with JSON parsing (S4, quiz.js)
        Goal: Force structured output and parse it reliably.

        Tasks:
        - [ ] Write quiz.js — function generateQuiz(topic)
        - [ ] Call Gemini with buildQuizPrompt(topic)
        - [ ] Parse the JSON response safely:
        - Strip markdown fences if present (```json ... ```)
        - JSON.parse() inside try/catch
        - If parse fails: retry once with a stricter prompt
        - [ ] Display: question, A/B/C/D options, wait for user input, reveal answer
        - [ ] Add "quiz" command to CLI: type "quiz sorting algorithms"

        Key problem you will hit: Gemini sometimes wraps JSON in ```json fences even when told not to.
        Fix: response.replace(/```json|```/g, "").trim() before parsing.

        Definition of done: You can take a working quiz on any topic.

    > The Game Loop: Instead of just printing the whole quiz at once, we will build a loop in quiz.js that:
        Prints one question at a time.
        Wait for you to type A, B, C, or D.
        Tells you immediately if you are Right or Wrong.
        Moves to the next question.

*/