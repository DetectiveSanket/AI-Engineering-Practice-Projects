import { generateContent } from './src/geminiClient.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { buildPromptWithTools } from './src/contextBuilder.js';
// import { webSearch } from './tools/webSearch.js';
import { runAgent } from './src/agentLoop.js';

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
            // const response = await generateContent({
            //     prompt: {
            //         system: buildPromptWithTools(),
            //         message: userInput
            //     },
            //     config:{
            //         temperature: 0.1,
            //         topP: 0.95,
            //     }
            // })


            // True AI Agent call
            const agentResponse = await runAgent(userInput);

        
            
            console.log('  **************************************************************');
            console.log(" AI Response :- " , agentResponse);
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
    ### Day 6 — Working memory / scratchpad (memory.js)

        > Goal: Agent has a proper memory system, not just raw messages array.

        ~={orange}Why this matters:=~ As the loop runs, messages array grows. After 5-6 tool calls,
        you're sending thousands of tokens to Gemini each step. You need to manage this.

        Tasks:
        - [ ] Write memory.js with:
        - addThought(thought) — stores agent's reasoning
        - addObservation(tool, args, result) — stores what tool returned
        - getContext(maxTokens) — returns trimmed history that fits in budget
        - getScratchpad() — returns full scratchpad for debugging
        - clear() — resets for new question

        - [ ] Trimming strategy: keep last N observations, always keep the original question
        Estimate: each observation ≈ 500 tokens. Budget: 8000 tokens. Keep last 14 obs.
        
        - [ ] Update agentLoop.js to use memory.js instead of raw messages array

        - [ ] Add "scratchpad" CLI command: shows everything the agent has stored this session



*/