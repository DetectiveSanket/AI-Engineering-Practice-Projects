
import {generateContent} from './geminiClient.js';
import {buildExplainPrompt , buildCoTPrompt} from './promptBuilder.js'
import { logResponse } from './logger.js';


export async function runParamExperiment(topic) {

    try{
        
        console.log('\n🤔 Thinking about (Temp 0.1): ' + topic + "...");

        const prompt1 = buildExplainPrompt(topic);
        const responseA = await generateContent({
            prompt : prompt1,
            // prompt : buildExplainPrompt(topic),
            config: {
                temperature : 0.1
            }
        });

        console.log('\n🤔 Thinking about (Temp 0.9): ' + topic + "...");
        const responseB = await generateContent({
            // prompt: buildExplainPrompt(topic),
            prompt : prompt1,
            config: {
                temperature : 0.9
            }
        });

        console.log('\n🤔 Thinking about (Temp 0.7, TopP 0.5): ' + topic + "...");
        const responseC = await generateContent({
            // prompt : buildExplainPrompt(topic),
            prompt : prompt1,
            config : {
                temperature : 0.7,
                topP: 0.5
            }
        });

        console.log("\n🤖 ----- AI Study Buddy Answer : ------ ");
        console.log("Temperature: 0.1 (Strict/Robotic)");
        console.log(responseA);
        logResponse(topic , "0.1" ,  prompt1 , responseA);
        console.log("-------------------------------\n");

  
        console.log("Temperature: 0.9 (Highly Creative)");
        console.log(responseB);
        logResponse(topic , "0.9" ,  prompt1 , responseB);
        console.log("-------------------------------\n");


        console.log("Temperature: 0.7, TopP: 0.5 (Constrained Creativity)");
        console.log(responseC);
        logResponse(topic , "0.7,0.5" ,  prompt1 , responseC);
        console.log("-------------------------------\n");

    }catch(error){
        console.log('Error: ',error.message);
    }
};