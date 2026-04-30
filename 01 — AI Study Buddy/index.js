import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runExplainFlow } from './src/explain.js';
import {runParamExperiment} from './src/params.js';
import { runQuizFlow } from './src/quiz.js';
import { compareStrategies } from './src/strategies.js'
import { addTopic, getHistory, clearSession , hasTopic} from './src/memory.js';
import { saveSession } from './src/logger.js'

const rl = readline.createInterface({ input, output });

    process.on('SIGINT' , ()=> {
        console.log('📝 Saving session to logs...');
        saveSession(); // here saving the session
        console.log("📝 Session saved to logs/");

        
        process.exit(0);
    });

async function run() {
    console.log("🚀 AI Study Buddy is waking up...");

    while (true) {
        // 1. Ask the user for a topic
        const userInput = await rl.question("\n📚 Enter a topic to study (or type 'exit'): ");

        // 2. Handle Exit
        if (userInput.toLowerCase() === 'exit') {
            console.log('📝 Saving session to logs...');
            saveSession(); // here saving the session
            console.log("📝 Session saved to logs/");

            
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }


        if(userInput === 'reset') {
            clearSession();
            console.log("✅ Session reset. Start fresh.");
            continue;
        }

        // 2.5 Handle history command
        if(userInput === 'history') {
            const history = getHistory();

            if(history.length === 0){
                console.log("⚠️  No history found.");
                continue;
            }

            console.log("📚 You've asked about these topics:");
            history.forEach((t, i) => {
                console.log(`${i + 1}. ${t.topic}`);
            })

            continue; // why continue? => to skip the further steps like choice of questions, explanation, comparison, quiz, strategies 
        }

        // 2.6 check if userInput already exists in memeory.topic[];
        if (hasTopic(userInput)) {

            const ans = await rl.question(`⚠️  You asked about "${userInput}" before. Want a different angle? (y/n): `);

            if (ans.toLowerCase() === 'n') {
                continue;   // jump back to ask for a new topic
            }

            // if 'y', do nothing — fall through to the choice menu below
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

            // Add the topic if not exist already in memeory
            if(!hasTopic(userInput)) {
                addTopic(userInput);
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
    ├── logger.js          ← writes session.json to disk

    ## Day 10 — Logger (S6 continued, logger.js)
        > Goal: Save every session to disk so you can review what the model produced.

        Tasks:
        - [ ] Write logger.js — writes session data to ./logs/session-[timestamp].json
        - [ ] Log structure: { startTime, endTime, topics, responses: [{ topic, strategy, prompt, response }] }
        - [ ] Update index.js: on Ctrl+C, call logger before exiting
        - [ ] Create logs/ folder with .gitignore entry
            
*/

