
import { GoogleGenAI } from '@google/genai';

// dotenv setup
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Force dotenv to load from the exact folder this file is in
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/**
 * Core function to generate content from Gemini
 * @param {Object} options 
 * @param {string} options.model       - Model name (e.g., 'gemini-2.5-flash-preview-05-20')
 * @param {Object} options.prompt      - { system, message, primer? }
 *   prompt.system   - The system instruction (persona + rules)
 *   prompt.message  - The user's question
 *   prompt.primer   - Optional: text to prefill the model's turn (e.g., 'Thought:')
 * @param {Object} options.config      - Generation config (temperature, etc.)
 */

export async function generateContent({model = 'gemini-3-flash-preview', prompt, config = {}}) {
    try {

        if(!process.env.GEMINI_API_KEY){
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }        

        // Build the contents array as a proper multi-turn conversation.
        // The user turn holds the question; the model turn is the PRIMER.
        // Prefilling the model turn with "Thought:" forces the model to
        // continue in ReAct format — this is more reliable than system
        // prompt instructions alone, because the model is a text completer:
        // it MUST continue from whatever the model turn already says.
        
        // Hint: inside geminiClient.js, replace the contents build logic with:
        let contents;
        if (Array.isArray(prompt.message)) {
            // Agent loop mode: full history already formatted — use directly
            contents = prompt.message;
        } else {
            // Single-turn mode (Day 1 style): wrap in user turn + primer
            const primer = prompt.primer ?? 'Thought:';
            contents = [
                { role: 'user',  parts: [{ text: prompt.message }] },
                { role: 'model', parts: [{ text: primer }] },
            ];
        }


        const response = await client.models.generateContent({
            model: model,
            systemInstruction: prompt.system,
            contents: contents,
            config: {
                temperature: config.temperature ?? 0.6,
                topP: config.topP ?? 0.95,
                maxOutputTokens: config.maxOutputTokens ?? 1000,
            },
        })
        
        return typeof response.text === 'function' ? response.text() : response.text;

    } catch (error) {
        console.error("❌ Gemini API Error:", error.message);
        throw error;
    }
};