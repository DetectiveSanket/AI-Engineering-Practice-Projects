import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Force dotenv to load from the exact folder this file is in
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env") });

// Immediately verify the key loaded — this will tell us exactly what's happening
console.log("Key loaded:", process.env.GEMINI_API_KEY ? "YES ✓" : "NO ✗");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();


