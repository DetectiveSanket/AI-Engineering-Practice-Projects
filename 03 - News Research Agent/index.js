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
    ### ### Day 5 — Add the other two tools (S5 continued)

        > Goal: Agent has all 3 tools. It can choose which one to use.

        Tasks:
        - [ ] Write tools/summarize.js — function summarize(text)
        Uses Gemini: "Summarize this in 3 bullet points: [text]"
        Returns string of bullet points

        - [ ] Write tools/checkClaim.js — function checkClaim(claim)
        1. Calls webSearch(claim) to get recent articles
        2. Asks Gemini: "Based on these articles: [articles], is this claim accurate: [claim]?
            Return JSON: { verdict: 'true'|'false'|'uncertain', reasoning: string }"
        3. Returns the verdict object

        - [ ] Update toolDispatcher.js and agentLoop.js to route to all 3 tools

        - [ ] Test: ask "Is it true that OpenAI released GPT-5?" 
        Agent should: search → summarize → check claim → final answer

        Definition of done: All 3 tools run without errors. Agent uses at least 2 different
        tools in one research session.



*/