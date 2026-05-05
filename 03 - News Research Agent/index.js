import { generateContent } from './src/geminiClient.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { buildPromptWithTools } from './src/contextBuilder.js';


const rl = readline.createInterface({ input, output });

    process.on('SIGINT' , ()=> {
        process.exit(0);
    });

async function run() {

    console.log("🚀 AI Study Buddy is waking up...");
    
    
    while(true) {

        const userInput = await rl.question("\n Enter a topic to study (or type 'exit'): ");

        if(userInput.toLowerCase() === 'exit') {
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }

        try{

            console.log(`🤖 AI is searching for ${userInput}`);
            

            // calling the gemini function
            const response = await generateContent({
                prompt: {
                    system: buildPromptWithTools(),
                    message: userInput
                },
                config:{
                    temperature: 0.6,
                    topP: 0.95,
                    maxOutputTokens: 300,
                }
            })

            console.log('  **************************************************************');
            console.log(" AI Response :- " , response);
            console.log('  **************************************************************');


        }catch(error) {
            console.log("❌", error.message);
        }
    }
};

run();

rl.on("close", () => {
    process.exit(0);
});


/* 
    ### Day 1 — Setup + plain LLM call with system prompt

        > Goal: Gemini responds in the ReAct format (even without real tools yet).

        Tasks:
        - [x] mkdir "03 News Research Agent" && cd into it
        - [x] npm init -y
        - [x] npm install @google/genai dotenv
        - [x] Create .env with GEMINI_API_KEY
        - [x] Write index.js — hardcoded question: "What happened with AI regulation this week?"
        - [x] Write geminiClient.js — single function callGemini (prompt, options)
        - [ ] Write contextBuilder.js — returns the system prompt string with tool descriptions
        - [x] Call Gemini with the system prompt + user question
        - [x] Print raw output — you should see it write "Thought: ..." and "Action: web_search(...)"

        > Definition of done: Gemini outputs text that LOOKS like ReAct format even though no tools exist yet. You can see it trying to call a tool.    

*/