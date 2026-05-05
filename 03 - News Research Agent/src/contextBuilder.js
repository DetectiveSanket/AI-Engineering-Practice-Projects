
import { generateContent } from './geminiClient.js';


//* 1 - Normal prompt 
export function buildPrompt(topic) {

    const prompt = {

        system : `You are an expert news researcher. Your goal is to thoroughly research the given topic and produce a comprehensive report. 
        
        Rules:
        1. Use tools to gather information.
        2. Reason about what information is missing.
        3. Only stop when you have enough information to write the report.
        4. Output clear, well-structured explanations.
        `,

        message: topic
    }

    return prompt;
};