import { generateContent } from './src/geminiClient.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { buildPromptWithTools } from './src/contextBuilder.js';
// import { webSearch } from './tools/webSearch.js';


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
    ### Day 3 — First real tool: webSearch() (S5)
        Goal: The agent can actually search for news.

    Get NewsAPI free key: https://newsapi.org — free tier, 100 requests/day.

    Tasks:
    - [ ] npm install axios - done
    - [ ] Add NEWS_API_KEY to .env - done
    - [ ] Write tools/webSearch.js — function webSearch(query) - done
    - [ ] Call NewsAPI /everything endpoint with the query - done
    - [ ] Return structured result: array of { title, description, url, publishedAt } -- done
    - [ ] Cap at top 3 results to keep context short - done  
    - [ ] Add fallback: if API fails, return mock result (so the agent loop still runs) - done

*/