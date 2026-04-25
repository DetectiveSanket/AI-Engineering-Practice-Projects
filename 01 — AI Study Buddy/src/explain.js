/* 

  ### Day 2 — Smart Explainer (S2, explain.js)
  Goal: Use structured prompts to get predictable outputs.

  Tasks:
  - [ ] Create explain.js in src/
  - [ ] Add function explainConcept(topic)
  - [ ] Use this prompt structure:
  
  You are a helpful tutor.
  Explain [topic] in simple terms.
  Do not use analogies unless I ask.
  Keep it under 4 paragraphs.

  - [ ] Call this from index.js instead of the old plain prompt
  - [ ] Update help text to mention the "Explain" command
    

    ≽ Here is the breakdown for explain.js:

        1. What is wrong with the current approach in index.js?
            - Right now, index.js is doing too many jobs:
                ^ It handles the CLI loop (the "while" loop).
                ^ It handles the readline interface.
                ^ It handles the logic for explaining (calling the prompt, calling the AI, and logging the result).
            - The Problem: When you add "Quiz Mode" and "Parameter Comparison Mode" tomorrow, your index.js will become a massive, confusing "Spaghetti" file. If you make a mistake in the Quiz code, you might accidentally break the Explanation code.

        2. Importance of explain.js — Why do we need it?
            - explain.js will be a Feature Module.
            * Focus: It only cares about one thing: How do I take a topic and show a beautiful explanation to the user?
            * Safety: You can change the "look" of your explanations (adding emojis, different borders, etc.) without touching your main loop in index.js.
            * Reusability: If you ever build a website version of this app, you can just import explain.js and use it there too!
            
        3. Hint to build explain.js from your end
            - Think of explain.js as a specialist. index.js is the "Boss" who takes orders, and explain.js is the "Employee" who does the specific task.

        Your Approach:

            1. Exports: Create a file named explain.js. It should export a function (e.g., export async function runExplainFlow(topic)).
            2. Imports: Inside explain.js, you will need to import:
            3. generateContent from your client.
            4. buildExplainPrompt from your prompt builder.
            5. Logic: Move the try/catch block and the console.log results (the "Thinking..." and the response box) into this new function.
            6. The Result: Your function should take the topic, call the AI, and print the results to the terminal.

            Step-by-Step Task for you:

        Create explain.js.
        Try to write a function that takes topic as a parameter.
        Make it do the "Thinking...", the API call, and the "🤖 AI Study Buddy" print out.
        Once you do that, we will update index.js to just call your new specialist! Let me know when you've written the code in explain.js.


*/

import { generateContent } from './geminiClient.js';
import { buildExplainPrompt } from './promptBuilder.js';

/**
 * Specialist: Explanation Flow
 * Responsibility: Handle the UI/UX and API call for concept explanations.
 */
export async function runExplainFlow(topic) {
    try {
        console.log("\n🤔 Thinking about: " + topic + "...");

        const response = await generateContent({
            prompt: buildExplainPrompt(topic),
            config: {
                temperature: 0.7
            }
        });

        console.log("\n🤖 ----- AI Study Buddy: ------ ");
        console.log(response);
        console.log("-------------------------------\n");
        
    } catch (error) {
        // We catch the error here so the 'Boss' (index.js) doesn't crash
        console.error("❌ Explanation Error:", error.message);
    }
}