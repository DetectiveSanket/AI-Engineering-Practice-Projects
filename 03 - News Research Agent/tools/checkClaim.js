
import { webSearch } from "./webSearch.js";
import { generateContent } from "../src/geminiClient.js";

export async function checkClaim(claim) {

    console.log('------ checkClaim tool is called ------');
    console.log("Claim :- " , claim);

    // 1. first we need to check the claim and for this we need to do websearch on the claim
    const web = await webSearch(claim);
    const resultWeb = web.map(article => `
        Title: ${article.title}
        Description: ${article.description}
        URL: ${article.url}
        Published At: ${article.publishedAt}
    `).join("\n");
    
    // call the gemini API to check the claim
    const response = await generateContent({
        prompt: {
            system: `You are a precise fact-checking assistant. Instruction to return ONLY valid JSON like:
            { "verdict": "true" | "false" | "uncertain", "reasoning": "one sentence" }.`,
            message: `Based on the following articles, is this claim accurate: "${claim}"?\n\n${resultWeb}`
        },
        config: {
            temperature: 0.1,
            topP: 0.95,
        }
    });
    
    const result = response.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    try {
        return JSON.parse(result);
    } catch (error) {
        return { verdict: "uncertain", reasoning: "Could not parse Gemini response." };
    }
}