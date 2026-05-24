

import { generateContent } from "../src/geminiClient.js";


export async function summarize(text) {
    console.log('------ summarize tool is called ------');
    console.log("Query :- " , text);


    const response = await generateContent({
        prompt: {
            system: "You are a precise summarization assistant. Return only bullet points, no extra text.",
            message: `Summarize the following in 3 bullet points:\n\n${text}`
        },
        config:{
            temperature: 0.1,
            topP: 0.95,
        }
    })

    console.log('response' , response);
    
    return response;
}