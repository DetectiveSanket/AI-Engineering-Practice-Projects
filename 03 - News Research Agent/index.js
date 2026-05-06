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
            // primer is handled inside geminiClient.js — it prefills the
            // model turn with "Thought:" so the model is forced into ReAct format.
            const response = await generateContent({
                prompt: {
                    system: buildPromptWithTools(),
                    message: userInput
                },
                config:{
                    temperature: 0.1,
                    topP: 0.95,
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
    ### Day 2 — Build the action parser (S4: toolDispatcher.js)

        > Goal: Extract tool name and argument from raw LLM output reliably.

        Tasks:
        - [ ] Write toolDispatcher.js with function parseAction(text)
        - [ ] It should extract from "Action: web_search(AI regulation 2025)"
        → { tool: "web_search", args: "AI regulation 2025" }
        - [ ] Handle edge cases:
        - Extra spaces: "Action:  web_search( query here )" → still works
        - Wrong format: LLM forgets "Action:" prefix → return { tool: null, error: "parse_failed" }
        - Unknown tool name → return { tool: null, error: "unknown_tool" }
        - [ ] Write tests manually: paste 5 different LLM outputs, check parser output

*/