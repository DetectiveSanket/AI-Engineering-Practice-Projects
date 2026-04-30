
import { generateContent } from './geminiClient.js';
import { buildComparePrompt , buildCoTPrompt , buildVerbalizedPrompt} from './promptBuilder.js'
import { logResponse } from './logger.js';

// The three congig object
// greedyConfig   → temperature: 0.1, topP: 1.0
// samplingConfig → temperature: 0.8, topP: 0.9
// diverseConfig  → temperature: 1.0, topP: 0.7

const greedyConfig = { temperature : 0.1 , topP : 1.0 }; // Least creative answer - focused answer

const samplingConfig = { temperature : 0.8 , topP : 0.9 }; // Balanced answer

const diverseConfig = { temperature : 1.0 , topP : 0.7 }; // most creative answer   

export async function compareStrategies(topic) { // export async function to compare the strategies
    
    console.log(`🔍 Running strategies for topic: ${topic}`); // logging the topic
    console.log("-".repeat(40)); // making a line of hyphens for visual purposes eg- (------)

    // COT:-
    const cotPrompt = buildCoTPrompt(topic); // building the cot prompt

    const prompt = buildComparePrompt(topic); // building the prompt

    const verbalizedPrompt = buildVerbalizedPrompt(topic);

    // 🔥 Fire all three requests in parallel
    const [greedy, sampling, diverse , cot , verbalized] = await Promise.all([
        generateContent({ prompt, config: greedyConfig }), // calling the API for greedy config
        generateContent({ prompt, config: samplingConfig }), // calling the API for sampling config
        generateContent({ prompt, config: diverseConfig }), // calling the API for diverse config
        generateContent({ prompt : cotPrompt}),
        generateContent({prompt: verbalizedPrompt})

    ]);

    const printSection = (label, content) => {

        console.log(`\n${"=".repeat(60)}`); // making a line of equals for visual purposes eg- (==========)
        console.log(`🤖 Strategy: ${label.toUpperCase()}`); // logging the strategy name in uppercase
        console.log(`${"=".repeat(60)}\n`); // making a line of equals for visual purposes eg- (==========)

        if (content) { // if content is generated
            console.log(content); // logging the content
        } else {
            console.log("❌ No content generated."); // logging the error message
        }
    };

    printSection("🤖 Greedy (Deterministic)", greedy);
    logResponse(topic , 'greedy' , prompt , greedy); // this is to store logs in json file in to the disk

    printSection("🤖 Sampling (Balanced)", sampling);
    logResponse(topic , 'sampling' , prompt , sampling);

    printSection("🤖 Diverse (Creative)", diverse);
    logResponse(topic , 'diverse' , prompt , diverse);
    
    printSection("🧠 Chain-of-Thought (CoT)", cot);
    logResponse(topic , 'cot' , cotPrompt , cot);

    printSection("🧠 Verbalized Sampling", verbalized);
    logResponse(topic , 'verbalized' , verbalizedPrompt , verbalized);

};
