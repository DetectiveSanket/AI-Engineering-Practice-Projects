
import {generateContent} from './src/geminiClient.js'

async function run () {

    const prompt = 'Give me 5 tips for time management';
    console.log("🚀 AI Study Buddy is waking up...");

    try {
        // Here we use the function you created!
        // We pass the prompt, and we also pass a custom config object.
        const response = await generateContent({
            prompt: prompt,
            // prompt: 'Give me 5 tips for time management',
            config: {
                temperature: 0.5,
                maxTokens : 100
            }
        });

        console.log("\n--- AI Explanation ---");
        console.log(response);
        console.log("----------------------");

    }catch(error){
        console.error('Error generating content: ', error.message);
    }
}

run();


//  we can give specific instructions to the AI model for a tailored response, use lower temperature (0.1-0.4) for deterministic and precise responses, use higher temperature (0.7-1.0) for creative and diverse responses, for factual accuracy and code generation, use lower temperature, for content creation, poetry, and creative writing, use higher temperature.

// ./src/geminiClient.js 




