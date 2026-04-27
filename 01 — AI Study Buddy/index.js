import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runExplainFlow } from './src/explain.js';
import {runParamExperiment} from './src/params.js';
import { runQuizFlow } from './src/quiz.js';
import { compareStrategies } from './src/strategies.js'


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
        const choice = await rl.question("Choose an action: \n 1. Explain \n 2. Compare \n 3. Quiz \n 4. Strategy Lab \n Choice: ");

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

            // if user wants strategies
            else if(choice === '4') {
                await compareStrategies(userInput);
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

      ## Day 7 — Strategies module (S5, strategies.js)
    Goal: Run same prompt through multiple strategies and compare.

    Tasks:
    - [ ] Write strategies.js — function compareStrategies(topic)
    - [ ] Strategy 1 (greedy simulation): temperature: 0.1, topP: 1.0
    - [ ] Strategy 2 (sampling): temperature: 0.8, topP: 0.9
    - [ ] Strategy 3 (diverse): temperature: 1.0, topP: 0.7
    - [ ] Run all 3 in parallel using Promise.all()
    - [ ] Print labeled comparison
    - [ ] Add "strategies" command to CLI  
*/