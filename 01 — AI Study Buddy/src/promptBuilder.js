

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
            Explain [topic] clearly and concisely .
            Use simple language and provide examples if needed.
        `,

        // user : ` Topic : ${topic}`
        
        message: `
            Topic: ${topic}
        `
    };

    return prompt;
};

// 2. `buildQuizPrompt(topic)` — The "Output Format" Technique
export function buildQuizPrompt(topic) {
    const prompt = {
        // Keep system minimal — experimental models often ignore it
        system: `You are a JSON API. You only output valid JSON. No other text.`,

        // The FULL instruction lives in the message (contents), which the model always reads.
        // We end the message with the opening of the JSON so the model is FORCED to continue it.
        message: `Generate EXACTLY 3 multiple-choice quiz questions about "${topic}".

Rules:
- Return ONLY a raw JSON object. No markdown. No backticks. No explanation. No greeting.
- Each question must have 4 options labeled A, B, C, D.
- The "answer" field must be the letter (A, B, C, or D) of the correct option.

Use this exact structure:
{"questions":[{"question":"Question text?","options":{"A":"Option text","B":"Option text","C":"Option text","D":"Option text"},"answer":"A"},{"question":"Question text?","options":{"A":"Option text","B":"Option text","C":"Option text","D":"Option text"},"answer":"B"},{"question":"Question text?","options":{"A":"Option text","B":"Option text","C":"Option text","D":"Option text"},"answer":"C"}]}`
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

//4. buildComparePrompt(topic) - for stragtegies module

export function buildComparePrompt(topic){

    const prompt = {
        system: `
            You are an AI explanation engine that demonstrates how subtle prompt/parameter changes alter outputs.
            Explain [topic] clearly and concisely.
            Use simple language but provide deep insights where relevant.
            Give a brief, single-paragraph explanation. Be concise.
            Please keep your answers concise, with a minimum of 100 words and a maximum of 150 words.
        `,

        message: `
            Topic: ${topic}
        `
    };

    return prompt;
};