
import {webSearch} from '../tools/webSearch.js';
import {summarize} from '../tools/summarize.js';
import {checkClaim} from '../tools/checkClaim.js';
import {generateContent} from './geminiClient.js';
import { buildPromptWithTools } from "./contextBuilder.js";
import { parseAction, isFinalAnswer, extractFinalAnswer } from "./toolDispatcher.js";
import * as memory from './memory.js';
import { buildReport, saveReport, buildReportText } from './reportBuilder.js';


export async function runAgent(question ) {
    
    console.log("Que is : " , question);

    const userQuestion = `Research question: ${question}`;
    memory.clear();                      // reset previous session — prevents bleed between questions
    memory.setQuestion(userQuestion);    // store the new question

    // const systemPrompt = buildPromptWithTools(memory.getScratchpad());


    
    const MAX_STEPS = 7; // Budget: 1 wasted (prose) + 2-3 tool calls + 1 urgency warn + 1-2 Final Answer steps
    let steps = 0;
    
    while (steps < MAX_STEPS) {
        const context = memory.getContext(10);

        steps++;
        console.log(`\n--- Step ${steps} ---`);

        // ─── DEBUG: what context is Gemini seeing this step? ────────────────────
        // console.log('\n🧠 CONTEXT SENT TO GEMINI:');
        // console.log('-------------------------------------------');
        // console.log(context);
        // console.log('-------------------------------------------\n');
        // ────────────────────────────────────────────────────────────────

        // Build context string from memory — updated every iteration with latest observations
        const contentsWithPrimer = [
            { role: 'user',  parts: [{ text: context }] },            // full scratchpad context
            { role: 'model', parts: [{ text: 'Thought:' }] }         // primer — forces ReAct format
        ];

        // 1. Get the current scratchpad state
        const currentMemory = memory.getScratchpad();
        
        // 2. Generate the fresh dynamic system prompt
        const systemPrompt = buildPromptWithTools(currentMemory);


        // Then pass contentsWithPrimer instead of messages:
        let response;
        try {
            response = await generateContent({
                prompt: {
                    system: systemPrompt,
                    message: contentsWithPrimer
                },
                config: {
                    temperature: 0.2,
                    topP: 0.95
                }
            })
        } catch (err) {
            if (err.message.includes('429') || err.message.toLowerCase().includes('rate limit')) {
                const partial = memory.getScratchpad().thoughts.at(-1)?.thought ?? "No partial answer available.";
                return `⚠️ Rate limit reached. Partial answer:\n${partial}`;
            }
            throw err; // re-throw unknown errors
        }


        // ─── DEBUG: full model response ─────────────────────────────────────
        // console.log('🤖 GEMINI RAW RESPONSE:');
        // console.log(response);
        // console.log('───────────────────────────────────────────\n');
        // ────────────────────────────────────────────────────────────────

        // Add response to memory
        memory.addThought(response);
        

        // 2. Check for Final Answer
        if(isFinalAnswer(response)) {
            const ans = extractFinalAnswer(response);

           // Build the final report from scratchpad + answer
            const report = buildReport(userQuestion, ans, memory.getScratchpad());

            // Print formatted report
            console.log('\n' + buildReportText(report));

            // Save JSON
            await saveReport(report);  // you'll write saveReport() next

            return ans; // return answer so CLI can print it too
        }

        // 3. Parse for Action
        const {tool , args , error} = parseAction(response);

        // 4. Check action & run tools
        
        // If format is wrong, add user message to memory
        if(error) {
            // Store as an observation (not a thought) — it's a system correction, not model reasoning
            memory.addObservation('system', '', 
                `FORMAT VIOLATION: You did not follow the required format.
                You MUST respond using ONLY this exact structure:

                Thought: [your reasoning]
                Action: tool_name(your search query)

                Available tools: web_search, summarize, check_claim
                Do NOT answer directly. You MUST call a tool first.`
            );
            continue;
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

                if (web.length === 0 || (web.length === 1 && web[0].title?.toLowerCase().includes('search unavailable'))) {
                    result = "No results found. Try a different or broader search query.";
                }else{
                    result = JSON.stringify(web, null, 2);
                }

                // If very long web search, auto-summarize (saves token budget + context space)
                if (result.length > 2000) {
                    console.log(`⚠️ Observation too long — auto-summarizing...`);
                    result = await summarize(result);
                }
                
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

        // ─── DEBUG: what observation is stored? ─────────────────────────────
        // console.log(`💾 OBSERVATION STORED IN MEMORY [${tool}]:`);
        // console.log(result.slice(0, 400));
        // console.log('...(truncated)');
        // ────────────────────────────────────────────────────────────────

        // Add observation to memory
        memory.addObservation(tool, cleanArgs, result);

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

    const sp = memory.getScratchpad();
    const lastThought = sp.thoughts.at(-1)?.thought ?? "No reasoning captured.";
    const obsCount = sp.memoryObservation.length;
    return `⚠️ Reached max steps (${MAX_STEPS}). Best effort answer based on ${obsCount} observations:\n\n${lastThought}`;

};