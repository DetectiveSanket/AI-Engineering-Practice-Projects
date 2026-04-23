
import {generateContent} from './src/geminiClient.js'
import * as readline from 'node:readline/promises'; // This is for taking user input in the CLI  , this is a module for reading and writing data from the command line
import { stdin as input, stdout as output } from 'node:process'; 

const rl = readline.createInterface({
    input ,
    output
});


async function run () {

    console.log("🚀 AI Study Buddy is waking up...");

    while(true) {

        // 1. ask the user for a topic.
        const userInput = await rl.question("\n📚 Enter a topic to study: ");


        // 2. check if user want to exit the app or not
        if(userInput.toLowerCase() === 'exit') {
            console.log("\n👋 Closing the AI Study Buddy. See you later!");
            rl.close();
            break;
        }

        // 3. call the ai with users specific input

        try {
            console.log("🤔 Thinking...");

            const response = await generateContent({
                prompt: userInput,
                config: {
                    temperature: 0.7
                }
            });

            console.log("🤖 ----- AI Study Buddy: ------ ");
            console.log(response);
            console.log("----------------------");

        }
        catch(error) {
             console.error("❌ Error:", error.message);
        }
    }
}

run();

rl.on("close" , () => {
    console.log("\n👋 Closing the AI Study Buddy. See you later!");
    process.exit(0);
});


//  we can give specific instructions to the AI model for a tailored response, use lower temperature (0.1-0.4) for deterministic and precise responses, use higher temperature (0.7-1.0) for creative and diverse responses, for factual accuracy and code generation, use lower temperature, for content creation, poetry, and creative writing, use higher temperature.


// const rl = readline.createInterface({ input, output }); //  readline.createInterface is used to create an interface for reading and writing data from the command line , it is a constructor for the readline module , it takes an object with input and output as properties , the input and output are streams , the input stream is the standard input stream , the output stream is the standard output stream 


/* 
    new task:
    ### Day 3 — Prompt Builder (S2)
        Goal: Stop hardcoding prompts. Build a template system.

        Tasks:
        - [ ] Write promptBuilder.js with three functions:
        - buildExplainPrompt(topic) — returns a zero-shot explanation prompt
        - buildQuizPrompt(topic) — returns a JSON-forced quiz prompt
        - buildCoTPrompt(topic) — returns a chain-of-thought prompt
        - [ ] Update index.js to use promptBuilder

*/