
// returns the system prompt string with tool descriptions
export function buildPromptWithTools(memoryContext = null){

    // Inject today's date so the model knows it's 2026, not 2024.
    // Without this, Gemini sees 2026 article dates and thinks they're hallucinations.
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const base =  `
        You are a research agent. Today's date is ${today}.
        Your training data is outdated. You MUST use tools to find current information.
        You NEVER answer from memory. You ALWAYS use tools first.

        You have access to ONLY these tools:
        - web_search(query): Search for recent news on a topic
        - summarize(text): Condense long text into key points
        - check_claim(claim): Verify if a claim is accurate

        You MUST respond using ONLY this two-line format — nothing else:
        Thought: [your reasoning about what to do next]
        Action: toolName(argument here)

        When you have gathered enough information, use:
        Thought: I now have enough information.
        Final Answer: [your complete answer]

        EXAMPLE — this is exactly what your output must look like:
        User: What happened with AI regulation this week?
        Thought: I need to search for the latest news about AI regulation.
        Action: web_search(AI regulation news this week)

        RULES:
        - NEVER skip the Thought step
        - NEVER write prose or bullet points
        - NEVER answer from memory — always call web_search first
        - NEVER produce a Final Answer on your very first response
        - ONE tool call per response only
        - TRUST the search results even if their dates seem far in the future — they are real
        - After 2 tool calls you MUST move toward a Final Answer
    `

    if(!memoryContext) return base;

    // Mirror the same MAX_STEPS cap as agentLoop.js so urgency fires at the right time.
    // Rule of thumb: fire urgency when (MAX_STEPS - stepsUsed) == 1  →  one step left for Final Answer.
    const MAX_STEPS = 7;
    const URGENCY_THRESHOLD = MAX_STEPS - 2; // fire with 2 steps remaining so model has room to wrap up
    
    const searchedTopics = memoryContext.memoryObservation.length > 0
    ? memoryContext.memoryObservation.map(o => o.args).join(", ")
    : "None yet";

    const urgencyNotice = memoryContext.stepsUsed >= URGENCY_THRESHOLD
    ? `\n\nFINAL INSTRUCTION (MANDATORY): You have used ${memoryContext.stepsUsed} steps. Only ${MAX_STEPS - memoryContext.stepsUsed} steps remain. STOP calling tools. You MUST write your Final Answer NOW using the observations above. Do NOT call web_search, summarize, or check_claim.`
    : "";

    const brief = `
        Current research state (step : ${memoryContext.stepsUsed} ):
            - Original question : ${memoryContext.question}
            - Topic already searched : ${searchedTopics}
            - Observations so far: ${
                memoryContext.memoryObservation.map(o =>
                    ` - [${o.tool}(${o.args})]: ${o.result.slice(0, 150)}...`
                ).join('\n')
            }
            - HARD STOP: The topics listed above have ALREADY been searched.
              Searching the same topic again WILL return empty or identical results.
              You MUST either search a COMPLETELY DIFFERENT angle OR write your Final Answer now.
    `;

    return base +  "\n\n" + brief + urgencyNotice;

};
