
import { generateContent } from './geminiClient.js';
import { buildComparePrompt } from './promptBuilder.js'

// The three congig object
// greedyConfig   → temperature: 0.1, topP: 1.0
// samplingConfig → temperature: 0.8, topP: 0.9
// diverseConfig  → temperature: 1.0, topP: 0.7

const greedyConfig = { temperature : 0.1 , topP : 1.0 }; // Least creative answer - focused answer

const samplingConfig = { temperature : 0.8 , topP : 0.9 }; // Balanced answer

const diverseConfig = { temperature : 1.0 , topP : 0.7 }; // most creative answer   

export async function compareStrategies(topic) {
    
    console.log(`🔍 Running strategies for topic: ${topic}`);
    console.log("-".repeat(40));

    const prompt = buildComparePrompt(topic);

    // 🔥 Fire all three requests in parallel
    const [greedy, sampling, diverse] = await Promise.all([
        generateContent({ prompt, config: greedyConfig }),
        generateContent({ prompt, config: samplingConfig }),
        generateContent({ prompt, config: diverseConfig }),
    ]);

    // 🔥 🔥 🔥 🔥 🔥 Print the result each with --- seperting 
    // 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 

    const printSection = (label, content) => {

        console.log(`\n${"=".repeat(60)}`);
        console.log(`🤖 Strategy: ${label.toUpperCase()}`);
        console.log(`${"=".repeat(60)}\n`);

        if (content) {
            console.log(content);
        } else {
            console.log("❌ No content generated.");
        }
    };

    printSection("Greedy (Deterministic)", greedy);
    console.log('🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥');
    
    printSection("Sampling (Balanced)", sampling);
    console.log('🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥');

    printSection("Diverse (Creative)", diverse);
}



