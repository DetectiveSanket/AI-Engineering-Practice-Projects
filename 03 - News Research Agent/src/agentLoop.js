
import {webSearch} from '../tools/webSearch.js';
import {generateContent} from './geminiClient.js';
import { buildPromptWithTools } from "./contextBuilder.js";
import { parseAction, isFinalAnswer, extractFinalAnswer } from "./toolDispatcher.js";

const sessionMemory = {
    topic: [],
    lastTopic: null,
    questionCount: 0
}

export async function runAgent(question ) {
    
    console.log("Que is : " , question);

    const userQuestion = `Research question: ${question}`;
    const systemPrompt = buildPromptWithTools();

    const messages = [
        { role: "user", parts: [{ text: userQuestion }] }
    ];
    
    const MAX_STEPS = 10;
    let steps = 0;
    
    while (steps < MAX_STEPS) {
        steps++;
        console.log(`\n--- Step ${steps} ---`);
        
        // 1. Call Gemini
        const response = await generateContent({
            prompt: {
                system : systemPrompt,
                message : messages //  how to pass the conversation history.  ( check this point ) {because model always needs }
                 
            },
            config: {
                temperature : 0.2,
                topP : 0.95
            }
        });

        console.log('Agent response :- ' , response);
        messages.push({
            role: 'model',
            parts: [{ text: response}]
        });


        // 2. Check for Final Answer
        if(isFinalAnswer(response)) {
            return extractFinalAnswer(response);
        }

        // 3. Parse for Action
        const {tool , args , error} = parseAction(response);

        // 4. Check action & run tools

        if(error) {
            messages.push({
                role: 'user',
                parts: [{text: `Observation error : ${error}. Try again.`}]
            })
            continue;
        }
        
        // 5. Execute the tool (feature when all three tool are ready)
        // let result = ""
        // switch(tool) {
        //     case 'web_search' :
        //         result = await webSearch(args);
        //         break;

        //     case 'summarize' : 
        //         result = await summarize(args);
        //         break;

        //     case 'check_claim' : 
        //         result = await checkClaim(args);
        //         break;
                
        //     default : 
        //         result = `Unknown tool: ${tool}`;
        // }

        let Observation = "";
        if(tool === 'web_search') {
            const result = await webSearch(args);
            Observation = JSON.stringify(result, null, 2);
        } else {
            Observation = `Tool ${tool} not yet implemented....`
        }

        console.log("Observation:", Observation.slice(0, 200) + "...");

        messages.push({
            role: 'user',
            parts: [{text: `Observation : ${Observation}`}]
        });
        
    }

    return "Error: I couldn't find an answer within 10 steps. Try rephrasing your question.";
};