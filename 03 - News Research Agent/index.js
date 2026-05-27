import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { runAgent } from './src/agentLoop.js';
import * as memory from './src/memory.js';

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

        if(userInput.toLowerCase() === 'scratchpad') {
            const sp = memory.getScratchpad();
            console.log(JSON.stringify(sp,null,2));
            continue;
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
    ### Day 8 — Report builder (S6: reportBuilder.js)

    > Goal: Final answer is structured and readable, not just raw text.

    Tasks:
    - [ ] Write reportBuilder.js — function buildReport(question, answer, scratchpad)
    - [ ] Report structure:
    {
        question: string,
        answer: string,
        sources: [{ title, url }],
        stepsUsed: number,
        toolsUsed: [string],
        generatedAt: ISO timestamp
    }
    - [ ] Print to terminal: formatted readable version
    - [ ] Save to reports/report-[timestamp].json
    - [ ] Add "report" command to CLI: shows last saved report



*/