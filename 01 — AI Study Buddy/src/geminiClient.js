
import { GoogleGenAI } from "@google/genai";

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Force dotenv to load from the exact folder this file is in
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });

// Initialize the client
// The SDK can also read GOOGLE_API_KEY automatically if set, 
// but we'll be explicit as per the user's request for "automatic from .env"


const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/**
 * Core function to generate content from Gemini
 * @param {Object} options 
 * @param {string} options.model - Model name (e.g., 'gemini-1.5-flash')
 * @param {string} options.prompt - The prompt text
 * @param {Object} options.config - Generation config (temperature, etc.)
 */
export async function generateContent({ model = 'gemini-3-flash-preview', prompt, config = {} }) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }

        const response = await client.models.generateContent({
            model: model,
            // contents: prompt,
            systemInstruction: prompt.system, // New part
            contents: prompt.message,         // New part
            generationConfig: {
                temperature: config.temperature ?? 0.7,
                topP: config.topP ?? 0.95,
                maxOutputTokens: config.maxTokens ?? 500,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw error;
    }
}

export default client;
