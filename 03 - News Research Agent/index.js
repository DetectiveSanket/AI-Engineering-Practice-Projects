import { generateContent } from './src/geminiClient.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 
import { buildPrompt } from './src/contextBuilder.js';


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
                prompt: buildPrompt(userInput),
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

