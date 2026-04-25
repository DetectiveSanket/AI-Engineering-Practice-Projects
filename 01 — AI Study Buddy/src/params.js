
import {generateContent} from './geminiClient.js';
import {buildExplainPrompt , buildCoTPrompt} from './promptBuilder.js'

export async function runParamExperiment(topic) {

    try{

        console.log('\n🤔 Thinking about: ' + topic + "...");
        
        const responseA = await generateContent({
            prompt : buildExplainPrompt(topic),
            config: {
                temperature : 0.1
            }
        });

        console.log('\n🤔 Thinking about (Temp 0.9): ' + topic + "...");

        const responseB = await generateContent({
            prompt: buildExplainPrompt(topic),
            config: {
                temperature : 0.9
            }
        });

        console.log('\n🤔 Thinking about (Temp 0.7, TopP 0.5): ' + topic + "...");

        const responseC = await generateContent({
            prompt : buildExplainPrompt(topic),
            config : {
                temperature : 0.7,
                topP: 0.5
            }
        });

        console.log("\n🤖 ----- AI Study Buddy Answer : ------ ");
        console.log("Temperature: 0.1 (Strict/Robotic)");
        console.log(responseA);
        console.log("-------------------------------\n");

  
        console.log("Temperature: 0.9 (Highly Creative)");
        console.log(responseB);
        console.log("-------------------------------\n");


        console.log("Temperature: 0.7, TopP: 0.5 (Constrained Creativity)");
        console.log(responseC);
        console.log("-------------------------------\n");

    }catch(error){
        console.log('Error: ',error.message);
    }
};