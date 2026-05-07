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
    ### Day 4 — Build the core ReAct loop (S3: agentLoop.js)

        > Goal: The loop runs. Agent thinks, calls web_search, sees result, loops again.

        This is the most important file in the project. Take your time on it.

        Tasks:
        - [ ] Write agentLoop.js — async function runAgent(question) - done
        - [ ] Maintain a messages array (conversation history) - done
        - [ ] Each iteration: - done
        1. Call Gemini with full messages array
        2. Append assistant response to messages
        3. Check: is it "Final Answer:"? → return answer, exit
        4. Check: is it "Action:"? → parse it, run tool, get result
        5. Append tool result as: "Observation: [result]"
        6. Loop again
        - [ ] Add a max steps guard (10 steps max) — prevents infinite loops - done
        - [ ] Log every step to terminal so you can watch the agent think - done



*/