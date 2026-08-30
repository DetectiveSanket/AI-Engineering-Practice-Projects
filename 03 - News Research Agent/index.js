import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAgent } from './src/agentLoop.js';
import * as memory from './src/memory.js';
import { buildReportText } from './src/reportBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // project root — used to locate reports/ folder

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

        if (userInput.toLowerCase() === 'report') {
            // Find the most recently saved report in reports/ and print it
            const reportsDir = path.join(__dirname, 'reports');
            try {
                const files = fs.readdirSync(reportsDir)
                    .filter(f => f.endsWith('.json'))
                    .sort()
                    .reverse(); // latest filename = latest timestamp = first after sort+reverse

                if (files.length === 0) {
                    console.log('\n📭 No reports found. Run a research query first.');
                } else {
                    const latestFile = files[0];
                    const raw = fs.readFileSync(path.join(reportsDir, latestFile), 'utf-8');
                    const report = JSON.parse(raw);
                    console.log(buildReportText(report));
                    console.log(`  (Loaded from: ${latestFile})`);
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log('\n📭 No reports directory yet. Run a research query first.');
                } else {
                    console.log('❌ Error reading report:', err.message);
                }
            }
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


// Day 8 complete ✅ — Report builder fully wired.
// Type 'report' at the CLI to print the last saved research report.