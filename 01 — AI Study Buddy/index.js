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

        try {

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

      ## Day 8 — Chain-of-thought (S5 continued)
        > Goal: Make the model reason out loud before answering.

        Tasks:
        - [ ] Add buildCoTPrompt to promptBuilder.js (already done day 3) -- all ready done.
        - [ ] In strategies.js, add a 4th comparison: CoT vs non-CoT on same topic
        - [ ] Log: which gives a more accurate explanation? Write your observation as a comment in code.
        - [ ] Try verbalized sampling: ask the model "What are 3 ways you could explain [topic]? Pick the best one and write it."

        Definition of done: You have a written observation (even just a code comment) on when CoT helps vs hurts.

        
*/