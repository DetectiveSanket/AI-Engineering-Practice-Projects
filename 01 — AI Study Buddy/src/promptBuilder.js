

/* 
    Tasks:
    - [ ] Write promptBuilder.js with three functions:
    - buildExplainPrompt(topic) — returns a zero-shot explanation prompt
    - buildQuizPrompt(topic) — returns a JSON-forced quiz prompt
    - buildCoTPrompt(topic) — returns a chain-of-thought prompt
    
    - [ ] Update index.js to use promptBuilder
*/

// 1. buildExplainPrompt(topic) — Zero-Shot Prompting
export function buildExplainPrompt(topic) {

    const prompt = {
        system :`
            You are a helpful study assistant.
            Explain [topic] clearly and concisely in 150 words .
            Use simple language and provide examples if needed.
        `,

        // user : ` Topic : ${topic}`
        
        message: `
            Topic: ${topic}
        `
    };

    return prompt;
};

// 2. `buildQuizPrompt(topic)` — The "Output Format" Technique
export function buildQuizPrompt(topic) {
    const prompt = {
        system: `
            You are a helpful study assistant. 
            Create a 3-question multiple-choice quiz on "${topic}".
            Each question should have 4 options (A, B, C, D).
            Return the quiz in JSON format with this structure:
            {
                "questions": [
                    {
                        "question": "Question text?",
                        "options": ["A", "B", "C", "D"],
                        "answer": "Correct option letter"
                    }
                ]
            }

            Important: "Do not include markdown backticks like ` ` `` json"
            "Also do not include explanation"
        `,

        message: `Quiz on: ${topic}`
    };
    return prompt;
};

// 3. buildCoTPrompt(topic) — The "Chain-of-Thought" (CoT) Technique
export function buildCoTPrompt(topic) {
    const prompt = {
        system: `
            You are a helpful study assistant. 
            Solve the following problem step by step.
            Show your thinking process clearly.
            Topic: ${topic}
        `,
        message: `Step-by-step explanation of: ${topic}`
    };
    return prompt;
};