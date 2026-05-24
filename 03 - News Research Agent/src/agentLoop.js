
import {webSearch} from '../tools/webSearch.js';
import {summarize} from '../tools/summarize.js';
import {checkClaim} from '../tools/checkClaim.js';
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
    
    const MAX_STEPS = 5; // Step 1 often uses prose (wasted step) + 2 tool calls + Final Answer needs ~4-5 steps
    let steps = 0;
    
    while (steps < MAX_STEPS) {
        steps++;
        console.log(`\n--- Step ${steps} ---`);
        
        // Hint — in agentLoop.js, before calling generateContent:
        const contentsWithPrimer = [
            ...messages,
            { role: 'model', parts: [{ text: 'Thought:' }] }  // ← forces model to continue from here
        ];

        // Then pass contentsWithPrimer instead of messages:
        const response = await generateContent({
            prompt: {
                system: systemPrompt,
                message: contentsWithPrimer
            },
            config: {
                temperature: 0.2,
                topP: 0.95
            }
        })

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
                parts: [{text: 
                    `FORMAT VIOLATION: You did not follow the required format.
                    You MUST respond using ONLY this exact structure:

                    Thought: [your reasoning]
                    Action: tool_name(your search query)

                    Available tools: web_search, summarize, check_claim
                    Do NOT answer directly. You MUST call a tool first.`
                }]
            })
            continue; //? this will skip the tool calling part and go back to the start of the loop
        }
        
        //* 5. Execute the tool — strip surrounding quotes from args first
        // The LLM sometimes wraps args in quotes: Action: web_search("query")
        // NewsAPI treats quoted strings as exact phrase matches → returns []
        // Stripping the outer quotes makes the search work correctly.
        const cleanArgs = args.replace(/^"|"$/g, '').trim();

        let result = "";
        switch(tool) {

            case 'web_search':
                console.log("Tool is web_search");
                const web = await webSearch(cleanArgs);
                result = JSON.stringify(web);
                console.log("Observation:", result.slice(0, 200) + '...');
                break;

            case 'summarize':
                console.log("Tool is summarize");
                const sum = await summarize(cleanArgs);
                result = sum; // already a string — no need to JSON.stringify
                console.log("Observation:", result.slice(0, 200) + '...');
                break;

            case 'check_claim':
                console.log("Tool is check_claim");
                const claim = await checkClaim(cleanArgs);
                result = JSON.stringify(claim);
                console.log("Observation:", result);
                break;

            default:
                console.log("Unknown tool:", tool);
                result = `Unknown tool: ${tool}`;
        }

        messages.push({
            role: 'user',
            parts: [{text: `Observation : ${result}`}]
        })

    //* Another way        
        // let Observation = "";
        // if(tool === 'web_search') {
        //     const result = await webSearch(args);
        //     Observation = JSON.stringify(result, null, 2);
        // }
        
        // else if(tool === 'summarize') {
        //     const result = await summarize(args);
        //     Observation = JSON.stringify(result, null, 2);
        // }
        
        // else if(tool === 'check_claim') {
        //     const result = await checkClaim(args);
        //     Observation = JSON.stringify(result, null, 2);
        // }
        // else {
        //     Observation = `Tool ${tool} not yet implemented....`
        // }

        // console.log("Observation:", Observation.slice(0, 200) + "...");

        // messages.push({
        //     role: 'user',
        //     parts: [{text: `Observation : ${Observation}`}]
        // });
        
    }

    return `Error: I couldn't find an answer within ${MAX_STEPS} steps. Try rephrasing your question.`;
};